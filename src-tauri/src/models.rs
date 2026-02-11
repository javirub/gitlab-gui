use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GitLabInstance {
    pub id: String,
    pub name: String,
    pub url: String,
    pub username: String,
    pub token: String,
}

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GitLabProject {
    pub id: String,
    pub instance_id: String,
    pub project_id: String,
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

// Environment Variables
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GitLabVariable {
    pub key: String,
    pub value: String,
    pub variable_type: String,
    pub protected: bool,
    pub masked: bool,
    pub environment_scope: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateVariableParams {
    pub instance_id: String,
    pub project_id: String,
    pub key: String,
    pub value: String,
    pub variable_type: String,
    pub protected: bool,
    pub masked: bool,
    pub environment_scope: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateVariableParams {
    pub instance_id: String,
    pub project_id: String,
    pub key: String,
    pub value: String,
    pub variable_type: String,
    pub protected: bool,
    pub masked: bool,
    pub environment_scope: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeleteVariableParams {
    pub instance_id: String,
    pub project_id: String,
    pub key: String,
    pub environment_scope: String,
}
