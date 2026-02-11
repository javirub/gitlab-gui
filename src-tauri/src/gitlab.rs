use crate::models::{GitLabInstance, GitLabVariable, PackageUploadParams};
use anyhow::{Context, Result};
use reqwest::{blocking::Client, header};
use std::fs;

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

        headers.insert("PRIVATE-TOKEN", auth_value.clone());

        let bearer_value = header::HeaderValue::from_str(&format!("Bearer {}", token))
            .context("Invalid bearer token format")?;
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

    pub fn upload_package_file(&self, params: PackageUploadParams) -> Result<String> {
        let project_id_encoded = self.encode_project_id(&params.project_id);

        let url = format!(
            "{}/api/v4/projects/{}/packages/generic/{}/{}/{}",
            self.base_url(),
            project_id_encoded,
            params.package_name,
            params.package_version,
            params.file_name
        );

        let file_content = fs::read(&params.file_path)
            .with_context(|| format!("Failed to read file at {}", params.file_path))?;

        let response = self.client.put(&url)
            .body(file_content)
            .send()?;

        if response.status().is_success() {
            Ok(format!("Successfully uploaded {} to {}", params.file_name, url))
        } else {
            let status = response.status();
            let text = response.text().unwrap_or_default();
            anyhow::bail!("Failed to upload package: {} - {}", status, text)
        }
    }

    pub fn search_projects(&self, query: Option<String>) -> Result<Vec<crate::models::GitLabProject>> {
        let mut url = format!("{}/api/v4/projects?membership=true&simple=true", self.base_url());
        if let Some(q) = query {
            url.push_str(&format!("&search={}", q));
        }

        let response = self.client.get(&url).send()?;
        if response.status().is_success() {
            let projects: Vec<serde_json::Value> = response.json()?;
            let mapped = projects.into_iter().map(|p| {
                crate::models::GitLabProject {
                    id: "".to_string(),
                    instance_id: self.instance.id.clone(),
                    project_id: p["id"].to_string(),
                    name: p["name_with_namespace"].as_str().unwrap_or_default().to_string(),
                }
            }).collect();
            Ok(mapped)
        } else {
            let status = response.status();
            let text = response.text().unwrap_or_default();
            anyhow::bail!("Failed to search projects: {} - {}", status, text)
        }
    }

    pub fn list_variables(&self, project_id: &str) -> Result<Vec<GitLabVariable>> {
        let encoded = self.encode_project_id(project_id);
        let url = format!("{}/api/v4/projects/{}/variables", self.base_url(), encoded);

        let response = self.client.get(&url).send()?;
        if response.status().is_success() {
            let vars: Vec<serde_json::Value> = response.json()?;
            let mapped = vars.into_iter().map(|v| {
                GitLabVariable {
                    key: v["key"].as_str().unwrap_or_default().to_string(),
                    value: v["value"].as_str().unwrap_or_default().to_string(),
                    variable_type: v["variable_type"].as_str().unwrap_or("env_var").to_string(),
                    protected: v["protected"].as_bool().unwrap_or(false),
                    masked: v["masked"].as_bool().unwrap_or(false),
                    environment_scope: v["environment_scope"].as_str().unwrap_or("*").to_string(),
                }
            }).collect();
            Ok(mapped)
        } else {
            let status = response.status();
            let text = response.text().unwrap_or_default();
            anyhow::bail!("Failed to list variables: {} - {}", status, text)
        }
    }

    pub fn create_variable(&self, project_id: &str, key: &str, value: &str, variable_type: &str, protected: bool, masked: bool, environment_scope: &str) -> Result<GitLabVariable> {
        let encoded = self.encode_project_id(project_id);
        let url = format!("{}/api/v4/projects/{}/variables", self.base_url(), encoded);

        let body = serde_json::json!({
            "key": key,
            "value": value,
            "variable_type": variable_type,
            "protected": protected,
            "masked": masked,
            "environment_scope": environment_scope,
        });

        let response = self.client.post(&url)
            .json(&body)
            .send()?;

        if response.status().is_success() {
            let v: serde_json::Value = response.json()?;
            Ok(GitLabVariable {
                key: v["key"].as_str().unwrap_or_default().to_string(),
                value: v["value"].as_str().unwrap_or_default().to_string(),
                variable_type: v["variable_type"].as_str().unwrap_or("env_var").to_string(),
                protected: v["protected"].as_bool().unwrap_or(false),
                masked: v["masked"].as_bool().unwrap_or(false),
                environment_scope: v["environment_scope"].as_str().unwrap_or("*").to_string(),
            })
        } else {
            let status = response.status();
            let text = response.text().unwrap_or_default();
            anyhow::bail!("Failed to create variable: {} - {}", status, text)
        }
    }

    pub fn update_variable(&self, project_id: &str, key: &str, value: &str, variable_type: &str, protected: bool, masked: bool, environment_scope: &str) -> Result<GitLabVariable> {
        let encoded = self.encode_project_id(project_id);
        let key_encoded = urlencoding::encode(key);
        let mut url = format!("{}/api/v4/projects/{}/variables/{}", self.base_url(), encoded, key_encoded);

        if environment_scope != "*" {
            url.push_str(&format!("?filter[environment_scope]={}", urlencoding::encode(environment_scope)));
        }

        let body = serde_json::json!({
            "value": value,
            "variable_type": variable_type,
            "protected": protected,
            "masked": masked,
            "environment_scope": environment_scope,
        });

        let response = self.client.put(&url)
            .json(&body)
            .send()?;

        if response.status().is_success() {
            let v: serde_json::Value = response.json()?;
            Ok(GitLabVariable {
                key: v["key"].as_str().unwrap_or_default().to_string(),
                value: v["value"].as_str().unwrap_or_default().to_string(),
                variable_type: v["variable_type"].as_str().unwrap_or("env_var").to_string(),
                protected: v["protected"].as_bool().unwrap_or(false),
                masked: v["masked"].as_bool().unwrap_or(false),
                environment_scope: v["environment_scope"].as_str().unwrap_or("*").to_string(),
            })
        } else {
            let status = response.status();
            let text = response.text().unwrap_or_default();
            anyhow::bail!("Failed to update variable: {} - {}", status, text)
        }
    }

    pub fn delete_variable(&self, project_id: &str, key: &str, environment_scope: &str) -> Result<()> {
        let encoded = self.encode_project_id(project_id);
        let key_encoded = urlencoding::encode(key);
        let mut url = format!("{}/api/v4/projects/{}/variables/{}", self.base_url(), encoded, key_encoded);

        if environment_scope != "*" {
            url.push_str(&format!("?filter[environment_scope]={}", urlencoding::encode(environment_scope)));
        }

        let response = self.client.delete(&url).send()?;

        if response.status().is_success() {
            Ok(())
        } else {
            let status = response.status();
            let text = response.text().unwrap_or_default();
            anyhow::bail!("Failed to delete variable: {} - {}", status, text)
        }
    }
}
