use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GitLabInstance {
    pub id: String,
    pub name: String,
    pub url: String,
    pub username: String,
    pub token: String, // Can be password or PAT
}

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GitLabProject {
    pub id: String,
    pub instance_id: String,
    pub project_id: String, // The GitLab Project ID (numeric or path)
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PackageUploadParams {
    pub project_id: String,
    pub instance_id: String,
    pub package_name: String,
    pub package_version: String,
    pub file_name: String,
    pub file_path: String,
}
