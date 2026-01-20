mod models;
mod gitlab;

use models::{GitLabInstance, PackageUploadParams};
use gitlab::GitLabClient;
use tauri_plugin_store::StoreExt;

#[tauri::command]
async fn upload_package(
    app: tauri::AppHandle,
    params: PackageUploadParams,
) -> Result<String, String> {
    let store = app.store("config.json")
        .map_err(|e| format!("Failed to access store: {}", e))?;
    
    let instances_val = store.get("instances").ok_or("Instances not found")?;
    let instances: Vec<GitLabInstance> = serde_json::from_value(instances_val)
        .map_err(|e| format!("Failed to parse instances: {}", e))?;

    let instance = instances.into_iter()
        .find(|i| i.id == params.instance_id)
        .ok_or_else(|| format!("Instance with ID {} not found", params.instance_id))?;

    let client = GitLabClient::new(instance)
        .map_err(|e| format!("Failed to create GitLab client: {}", e))?;

    client.upload_package_file(params)
        .map_err(|e| format!("Upload failed: {}", e))
}

#[tauri::command]
async fn search_projects(
    app: tauri::AppHandle,
    instance_id: String,
    query: Option<String>,
) -> Result<Vec<models::GitLabProject>, String> {
    let store = app.store("config.json")
        .map_err(|e| format!("Failed to access store: {}", e))?;
    
    let instances_val = store.get("instances").ok_or("Instances not found")?;
    let instances: Vec<GitLabInstance> = serde_json::from_value(instances_val)
        .map_err(|e| format!("Failed to parse instances: {}", e))?;

    let instance = instances.into_iter()
        .find(|i| i.id == instance_id)
        .ok_or_else(|| format!("Instance with ID {} not found", instance_id))?;

    let client = GitLabClient::new(instance)
        .map_err(|e| format!("Failed to create GitLab client: {}", e))?;

    client.search_projects(query)
        .map_err(|e| format!("Search failed: {}", e))
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
            // Ensure the store exists
            let _ = app.store("config.json");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![upload_package, search_projects])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
