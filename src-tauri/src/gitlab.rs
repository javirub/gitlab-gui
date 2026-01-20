use crate::models::{GitLabInstance, PackageUploadParams};
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

        // Try Private-Token header (most common for GitLab PATs)
        headers.insert("PRIVATE-TOKEN", auth_value.clone());
        
        // Also add Authorization Bearer for some instances/token types
        let bearer_value = header::HeaderValue::from_str(&format!("Bearer {}", token))
            .context("Invalid bearer token format")?;
        headers.insert(header::AUTHORIZATION, bearer_value);

        let client = Client::builder()
            .default_headers(headers)
            .build()?;

        Ok(Self { client, instance })
    }

    pub fn upload_package_file(&self, params: PackageUploadParams) -> Result<String> {
        // Enforce URL encoding for project_id if it's a path
        let project_id_encoded = params.project_id.replace("/", "%2F");
        
        let url = format!(
            "{}/api/v4/projects/{}/packages/generic/{}/{}/{}",
            self.instance.url.trim().trim_end_matches('/'),
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
        let mut url = format!("{}/api/v4/projects?membership=true&simple=true", self.instance.url.trim_end_matches('/'));
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
}
