use crate::models::{GitLabInstance, GitLabVariable, PackageUploadParams};
use anyhow::{Context, Result};
use reqwest::{blocking::Body, blocking::Client, blocking::Response, header};
use std::fs::File;

/// GitLab caps `per_page` at 100 for the REST API.
const PER_PAGE: u32 = 100;

pub struct GitLabClient {
    client: Client,
    instance: GitLabInstance,
}

impl GitLabClient {
    pub fn new(instance: GitLabInstance) -> Result<Self> {
        let mut headers = header::HeaderMap::new();
        let token = instance.token.trim();

        let mut auth_value = header::HeaderValue::from_str(token)
            .context("Invalid token format")?;
        auth_value.set_sensitive(true);
        headers.insert("PRIVATE-TOKEN", auth_value);

        let mut bearer_value = header::HeaderValue::from_str(&format!("Bearer {}", token))
            .context("Invalid bearer token format")?;
        // Keep the credential out of any header dump reqwest may log
        bearer_value.set_sensitive(true);
        headers.insert(header::AUTHORIZATION, bearer_value);

        let client = Client::builder()
            .default_headers(headers)
            .build()?;

        Ok(Self { client, instance })
    }

    fn base_url(&self) -> String {
        self.instance.url.trim().trim_end_matches('/').to_string()
    }

    fn encode_project_id(&self, project_id: &str) -> String {
        urlencoding::encode(project_id).to_string()
    }

    /// Turn a non-2xx response into an error carrying the status and body.
    fn fail(context: &str, response: Response) -> anyhow::Error {
        let status = response.status();
        let text = response.text().unwrap_or_default();
        anyhow::anyhow!("{}: {} - {}", context, status, text)
    }

    /// Fetch every page of a paginated list endpoint.
    ///
    /// GitLab returns only 20 records per page by default, so a single request
    /// silently truncated projects and CI/CD variables. `url` must already
    /// carry its own query string separator handling via `separator`.
    fn get_all_pages(&self, url: &str, context: &str) -> Result<Vec<serde_json::Value>> {
        let separator = if url.contains('?') { '&' } else { '?' };
        let mut all = Vec::new();
        let mut page = 1u32;

        loop {
            let paged_url = format!("{}{}per_page={}&page={}", url, separator, PER_PAGE, page);
            let response = self.client.get(&paged_url).send()?;

            if !response.status().is_success() {
                return Err(Self::fail(context, response));
            }

            // x-next-page is empty on the last page
            let next_page = response
                .headers()
                .get("x-next-page")
                .and_then(|v| v.to_str().ok())
                .and_then(|v| v.trim().parse::<u32>().ok());

            let items: Vec<serde_json::Value> = response.json()?;
            let received = items.len();
            all.extend(items);

            match next_page {
                Some(next) if next > page => page = next,
                // Fall back to length-based paging if the header is missing
                None if received == PER_PAGE as usize => page += 1,
                _ => break,
            }
        }

        Ok(all)
    }

    pub fn upload_package_file(&self, params: PackageUploadParams) -> Result<String> {
        let project_id_encoded = self.encode_project_id(&params.project_id);

        let url = format!(
            "{}/api/v4/projects/{}/packages/generic/{}/{}/{}",
            self.base_url(),
            project_id_encoded,
            urlencoding::encode(&params.package_name),
            urlencoding::encode(&params.package_version),
            urlencoding::encode(&params.file_name)
        );

        // Stream the file instead of loading it fully into memory: package
        // artifacts can be hundreds of megabytes.
        let file = File::open(&params.file_path)
            .with_context(|| format!("Failed to read file at {}", params.file_path))?;
        let len = file
            .metadata()
            .with_context(|| format!("Failed to stat file at {}", params.file_path))?
            .len();

        let response = self
            .client
            .put(&url)
            .body(Body::sized(file, len))
            .send()?;

        if response.status().is_success() {
            Ok(format!("Successfully uploaded {} to {}", params.file_name, url))
        } else {
            Err(Self::fail("Failed to upload package", response))
        }
    }

    pub fn search_projects(&self, query: Option<String>) -> Result<Vec<crate::models::GitLabProject>> {
        let mut url = format!("{}/api/v4/projects?membership=true&simple=true", self.base_url());
        if let Some(q) = query {
            url.push_str(&format!("&search={}", urlencoding::encode(&q)));
        }

        let projects = self.get_all_pages(&url, "Failed to search projects")?;

        Ok(projects
            .into_iter()
            .map(|p| crate::models::GitLabProject {
                id: String::new(),
                instance_id: self.instance.id.clone(),
                project_id: json_id(&p["id"]),
                name: p["name_with_namespace"].as_str().unwrap_or_default().to_string(),
            })
            .collect())
    }

    pub fn list_variables(&self, project_id: &str) -> Result<Vec<GitLabVariable>> {
        let encoded = self.encode_project_id(project_id);
        let url = format!("{}/api/v4/projects/{}/variables", self.base_url(), encoded);

        let vars = self.get_all_pages(&url, "Failed to list variables")?;
        Ok(vars.iter().map(variable_from_json).collect())
    }

    #[allow(clippy::too_many_arguments)]
    pub fn create_variable(&self, project_id: &str, key: &str, value: &str, variable_type: &str, protected: bool, masked: bool, environment_scope: &str, description: &str) -> Result<GitLabVariable> {
        let encoded = self.encode_project_id(project_id);
        let url = format!("{}/api/v4/projects/{}/variables", self.base_url(), encoded);

        let body = serde_json::json!({
            "key": key,
            "value": value,
            "variable_type": variable_type,
            "protected": protected,
            "masked": masked,
            "environment_scope": environment_scope,
            "description": description,
        });

        let response = self.client.post(&url).json(&body).send()?;

        if response.status().is_success() {
            Ok(variable_from_json(&response.json()?))
        } else {
            Err(Self::fail("Failed to create variable", response))
        }
    }

    #[allow(clippy::too_many_arguments)]
    pub fn update_variable(&self, project_id: &str, key: &str, value: &str, variable_type: &str, protected: bool, masked: bool, environment_scope: &str, description: &str) -> Result<GitLabVariable> {
        let url = self.variable_url(project_id, key, environment_scope);

        let body = serde_json::json!({
            "value": value,
            "variable_type": variable_type,
            "protected": protected,
            "masked": masked,
            "environment_scope": environment_scope,
            "description": description,
        });

        let response = self.client.put(&url).json(&body).send()?;

        if response.status().is_success() {
            Ok(variable_from_json(&response.json()?))
        } else {
            Err(Self::fail("Failed to update variable", response))
        }
    }

    pub fn delete_variable(&self, project_id: &str, key: &str, environment_scope: &str) -> Result<()> {
        let url = self.variable_url(project_id, key, environment_scope);

        let response = self.client.delete(&url).send()?;

        if response.status().is_success() {
            Ok(())
        } else {
            Err(Self::fail("Failed to delete variable", response))
        }
    }

    /// URL of a single variable, scoped to an environment when it is not `*`.
    fn variable_url(&self, project_id: &str, key: &str, environment_scope: &str) -> String {
        let encoded = self.encode_project_id(project_id);
        let key_encoded = urlencoding::encode(key);
        let mut url = format!("{}/api/v4/projects/{}/variables/{}", self.base_url(), encoded, key_encoded);

        if environment_scope != "*" {
            url.push_str(&format!(
                "?filter[environment_scope]={}",
                urlencoding::encode(environment_scope)
            ));
        }

        url
    }
}

/// Read a GitLab id, which the API sends as a number but may appear as a string.
fn json_id(value: &serde_json::Value) -> String {
    value
        .as_str()
        .map(str::to_string)
        .or_else(|| value.as_i64().map(|n| n.to_string()))
        .unwrap_or_default()
}

fn variable_from_json(v: &serde_json::Value) -> GitLabVariable {
    GitLabVariable {
        key: v["key"].as_str().unwrap_or_default().to_string(),
        value: v["value"].as_str().unwrap_or_default().to_string(),
        variable_type: v["variable_type"].as_str().unwrap_or("env_var").to_string(),
        protected: v["protected"].as_bool().unwrap_or(false),
        masked: v["masked"].as_bool().unwrap_or(false),
        environment_scope: v["environment_scope"].as_str().unwrap_or("*").to_string(),
        description: v["description"].as_str().unwrap_or_default().to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn instance() -> GitLabInstance {
        GitLabInstance {
            id: "i1".into(),
            name: "test".into(),
            url: "https://gitlab.example.com/".into(),
            username: "javirub".into(),
            token: "glpat-secret".into(),
        }
    }

    #[test]
    fn base_url_strips_trailing_slash() {
        let client = GitLabClient::new(instance()).unwrap();
        assert_eq!(client.base_url(), "https://gitlab.example.com");
    }

    #[test]
    fn variable_url_omits_filter_for_the_wildcard_scope() {
        let client = GitLabClient::new(instance()).unwrap();
        assert_eq!(
            client.variable_url("group/proj", "MY_KEY", "*"),
            "https://gitlab.example.com/api/v4/projects/group%2Fproj/variables/MY_KEY"
        );
    }

    #[test]
    fn variable_url_encodes_the_environment_scope() {
        let client = GitLabClient::new(instance()).unwrap();
        assert_eq!(
            client.variable_url("7", "MY_KEY", "review/*"),
            "https://gitlab.example.com/api/v4/projects/7/variables/MY_KEY\
             ?filter[environment_scope]=review%2F%2A"
        );
    }

    #[test]
    fn json_id_accepts_numbers_and_strings() {
        assert_eq!(json_id(&serde_json::json!(42)), "42");
        assert_eq!(json_id(&serde_json::json!("42")), "42");
        assert_eq!(json_id(&serde_json::Value::Null), "");
    }

    #[test]
    fn variable_from_json_falls_back_to_gitlab_defaults() {
        let v = variable_from_json(&serde_json::json!({ "key": "K", "value": "V" }));
        assert_eq!(v.key, "K");
        assert_eq!(v.value, "V");
        assert_eq!(v.variable_type, "env_var");
        assert_eq!(v.environment_scope, "*");
        assert!(!v.protected);
        assert!(!v.masked);
    }
}
