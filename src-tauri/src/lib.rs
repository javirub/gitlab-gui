mod models;
mod gitlab;

use models::{GitLabInstance, PackageUploadParams, CreateVariableParams, UpdateVariableParams, DeleteVariableParams, GitLabVariable};
use gitlab::GitLabClient;
use tauri_plugin_store::StoreExt;

fn get_client(app: &tauri::AppHandle, instance_id: &str) -> Result<GitLabClient, String> {
    let store = app.store("config.json")
        .map_err(|e| format!("Failed to access store: {}", e))?;

    let instances_val = store.get("instances").ok_or("Instances not found")?;
    let instances: Vec<GitLabInstance> = serde_json::from_value(instances_val)
        .map_err(|e| format!("Failed to parse instances: {}", e))?;

    let instance = instances.into_iter()
        .find(|i| i.id == instance_id)
        .ok_or_else(|| format!("Instance with ID {} not found", instance_id))?;

    GitLabClient::new(instance)
        .map_err(|e| format!("Failed to create GitLab client: {}", e))
}

#[tauri::command]
async fn upload_package(
    app: tauri::AppHandle,
    params: PackageUploadParams,
) -> Result<String, String> {
    let client = get_client(&app, &params.instance_id)?;
    client.upload_package_file(params)
        .map_err(|e| format!("Upload failed: {}", e))
}

#[tauri::command]
async fn search_projects(
    app: tauri::AppHandle,
    instance_id: String,
    query: Option<String>,
) -> Result<Vec<models::GitLabProject>, String> {
    let client = get_client(&app, &instance_id)?;
    client.search_projects(query)
        .map_err(|e| format!("Search failed: {}", e))
}

#[tauri::command]
async fn list_variables(
    app: tauri::AppHandle,
    instance_id: String,
    project_id: String,
) -> Result<Vec<GitLabVariable>, String> {
    let client = get_client(&app, &instance_id)?;
    client.list_variables(&project_id)
        .map_err(|e| format!("Failed to list variables: {}", e))
}

#[tauri::command]
async fn create_variable(
    app: tauri::AppHandle,
    params: CreateVariableParams,
) -> Result<GitLabVariable, String> {
    let client = get_client(&app, &params.instance_id)?;
    client.create_variable(
        &params.project_id,
        &params.key,
        &params.value,
        &params.variable_type,
        params.protected,
        params.masked,
        &params.environment_scope,
    ).map_err(|e| format!("Failed to create variable: {}", e))
}

#[tauri::command]
async fn update_variable(
    app: tauri::AppHandle,
    params: UpdateVariableParams,
) -> Result<GitLabVariable, String> {
    let client = get_client(&app, &params.instance_id)?;
    client.update_variable(
        &params.project_id,
        &params.key,
        &params.value,
        &params.variable_type,
        params.protected,
        params.masked,
        &params.environment_scope,
    ).map_err(|e| format!("Failed to update variable: {}", e))
}

#[tauri::command]
async fn delete_variable(
    app: tauri::AppHandle,
    params: DeleteVariableParams,
) -> Result<(), String> {
    let client = get_client(&app, &params.instance_id)?;
    client.delete_variable(
        &params.project_id,
        &params.key,
        &params.environment_scope,
    ).map_err(|e| format!("Failed to delete variable: {}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let _ = app.store("config.json");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            upload_package,
            search_projects,
            list_variables,
            create_variable,
            update_variable,
            delete_variable,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
