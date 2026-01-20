import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { LazyStore } from "@tauri-apps/plugin-store";
import { open } from "@tauri-apps/plugin-dialog";
import { useTranslation } from "react-i18next";
import { GitLabInstance, GitLabProject, PackageUploadParams } from "./models";
import "./App.css";

const store = new LazyStore("config.json", {
  autoSave: true,
  defaults: { instances: [], projects: [] }
});

type View = "actions" | "instances" | "projects" | "registry-upload";

function App() {
  const { t } = useTranslation();
  const [view, setView] = useState<View>("actions");
  const [instances, setInstances] = useState<GitLabInstance[]>([]);
  const [projects, setProjects] = useState<GitLabProject[]>([]);

  // Instance form state
  const [instName, setInstName] = useState("");
  const [instUrl, setInstUrl] = useState("https://gitlab.com");
  const [instUser, setInstUser] = useState("");
  const [instToken, setInstToken] = useState("");

  // Project form state
  const [projName, setProjName] = useState("");
  const [projId, setProjId] = useState("");
  const [projInstId, setProjInstId] = useState("");

  // Editing state
  const [editingInstanceId, setEditingInstanceId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Discovery state
  const [searchQuery, setSearchQuery] = useState("");
  const [discoveredProjects, setDiscoveredProjects] = useState<GitLabProject[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Upload state
  const [uploadParams, setUploadParams] = useState<PackageUploadParams>({
    project_id: "",
    instance_id: "",
    package_name: "",
    package_version: "",
    file_name: "",
    file_path: ""
  });
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const savedInstances = await store.get<GitLabInstance[]>("instances");
    const savedProjects = await store.get<GitLabProject[]>("projects");
    setInstances(savedInstances || []);
    setProjects(savedProjects || []);
  }

  async function saveInstance() {
    if (editingInstanceId) {
      const updated = instances.map(inst =>
        inst.id === editingInstanceId
          ? { ...inst, name: instName.trim(), url: instUrl.trim(), username: instUser.trim(), token: instToken.trim() }
          : inst
      );
      setInstances(updated);
      await store.set("instances", updated);
      setEditingInstanceId(null);
    } else {
      const newInstance: GitLabInstance = {
        id: crypto.randomUUID(),
        name: instName.trim(),
        url: instUrl.trim(),
        username: instUser.trim(),
        token: instToken.trim()
      };
      const updated = [...instances, newInstance];
      setInstances(updated);
      await store.set("instances", updated);
    }
    await store.save();
    setInstName("");
    setInstUser("");
    setInstToken("");
  }

  async function deleteInstance(id: string) {
    if (!confirm(t("confirm_delete_inst"))) return;
    const updatedInstances = instances.filter(i => i.id !== id);
    const updatedProjects = projects.filter(p => p.instance_id !== id);
    setInstances(updatedInstances);
    setProjects(updatedProjects);
    await store.set("instances", updatedInstances);
    await store.set("projects", updatedProjects);
    await store.save();
  }

  function startEditInstance(inst: GitLabInstance) {
    setEditingInstanceId(inst.id);
    setInstName(inst.name);
    setInstUrl(inst.url);
    setInstUser(inst.username);
    setInstToken(inst.token);
  }

  async function saveProject(p?: GitLabProject) {
    if (editingProjectId) {
      const updated = projects.map(proj =>
        proj.id === editingProjectId
          ? { ...proj, name: projName, project_id: projId, instance_id: projInstId }
          : proj
      );
      setProjects(updated);
      await store.set("projects", updated);
      setEditingProjectId(null);
    } else {
      const newProject: GitLabProject = p ? {
        ...p,
        id: crypto.randomUUID(),
      } : {
        id: crypto.randomUUID(),
        instance_id: projInstId,
        project_id: projId,
        name: projName
      };
      const updated = [...projects, newProject];
      setProjects(updated);
      await store.set("projects", updated);
    }
    await store.save();
    setProjName("");
    setProjId("");
  }

  async function deleteProject(id: string) {
    if (!confirm(t("confirm_delete_proj"))) return;
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    await store.set("projects", updated);
    await store.save();
  }

  function startEditProject(proj: GitLabProject) {
    setEditingProjectId(proj.id);
    setProjName(proj.name);
    setProjId(proj.project_id);
    setProjInstId(proj.instance_id);
  }

  async function handleSearch() {
    if (!projInstId) return;
    setIsSearching(true);
    try {
      const results = await invoke<GitLabProject[]>("search_projects", {
        instanceId: projInstId,
        query: searchQuery || null
      });
      setDiscoveredProjects(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  }

  async function pickFile() {
    const selected = await open({
      multiple: false,
    });
    if (selected && !Array.isArray(selected)) {
      const fileName = selected.split(/[\\/]/).pop() || "";
      setUploadParams({ ...uploadParams, file_path: selected, file_name: fileName });
    }
  }

  async function handleUpload() {
    setUploadStatus(t("uploading"));
    try {
      const result = await invoke<string>("upload_package", { params: uploadParams });
      setUploadStatus(result);
    } catch (e) {
      setUploadStatus(`${t("error")}: ${e}`);
    }
  }

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-logo">{t("title")}</div>
        <div className={`nav-item ${view === "actions" ? "active" : ""}`} onClick={() => setView("actions")}>
          {t("actions")}
        </div>
        <div className={`nav-item ${view === "instances" ? "active" : ""}`} onClick={() => setView("instances")}>
          {t("instances")}
        </div>
        <div className={`nav-item ${view === "projects" ? "active" : ""}`} onClick={() => setView("projects")}>
          {t("projects")}
        </div>
      </div>

      <main className="main-content">
        {view === "actions" && (
          <div>
            <h1>{t("available_actions")}</h1>
            <div className="grid">
              <div className="card" onClick={() => setView("registry-upload")} style={{ cursor: "pointer" }}>
                <h3>📦 {t("package_upload")}</h3>
                <p>{t("package_upload_desc")}</p>
              </div>
            </div>
          </div>
        )}

        {view === "instances" && (
          <div>
            <h1>{editingInstanceId ? `${t("edit")} ${t("instances")}` : t("register_instance")}</h1>
            <div className="card">
              <div className="input-group">
                <label>{t("friendly_name")}</label>
                <input value={instName} onChange={e => setInstName(e.target.value)} placeholder="e.g. Work GitLab" />
              </div>
              <div className="input-group">
                <label>{t("gitlab_url")}</label>
                <input value={instUrl} onChange={e => setInstUrl(e.target.value)} />
              </div>
              <div className="input-group">
                <label>{t("username")}</label>
                <input value={instUser} onChange={e => setInstUser(e.target.value)} />
              </div>
              <div className="input-group">
                <label>{t("token_password")}</label>
                <input type="password" value={instToken} onChange={e => setInstToken(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={saveInstance}>{editingInstanceId ? t("update_btn") : t("register_btn")}</button>
                {editingInstanceId && (
                  <button onClick={() => { setEditingInstanceId(null); setInstName(""); setInstUser(""); setInstToken(""); }} style={{ background: 'rgba(255,255,255,0.1)' }}>{t("cancel")}</button>
                )}
              </div>
            </div>

            <h2>{t("registered_instances")}</h2>
            <div className="grid">
              {instances.map(inst => (
                <div key={inst.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="badge badge-instance">{t("instances")}</span>
                      <h3>{inst.name}</h3>
                      <p>{inst.url}</p>
                    </div>
                    <div className="card-actions">
                      <button className="icon-btn" onClick={() => startEditInstance(inst)} title={t("edit")}>✏️</button>
                      <button className="icon-btn" onClick={() => deleteInstance(inst.id)} title={t("delete")}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "projects" && (
          <div>
            <h1>{editingProjectId ? `${t("edit")} ${t("projects")}` : t("register_project")}</h1>
            <div className="card">
              <div className="input-group">
                <label>{t("friendly_name")}</label>
                <input value={projName} onChange={e => setProjName(e.target.value)} placeholder="e.g. My Awesome App" />
              </div>
              <div className="input-group">
                <label>{t("project_id_label")}</label>
                <input value={projId} onChange={e => setProjId(e.target.value)} />
              </div>
              <div className="input-group">
                <label>{t("select_instance")}</label>
                <select value={projInstId} onChange={e => setProjInstId(e.target.value)}>
                  <option value="">{t("select_instance")}</option>
                  {instances.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name} ({inst.url})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => saveProject()}>{editingProjectId ? t("update_btn") : t("register_btn")}</button>
                {editingProjectId && (
                  <button onClick={() => { setEditingProjectId(null); setProjName(""); setProjId(""); }} style={{ background: 'rgba(255,255,255,0.1)' }}>{t("cancel")}</button>
                )}
                {!editingProjectId && (
                  <button
                    onClick={handleSearch}
                    disabled={!projInstId}
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)' }}
                  >
                    {t("search_projects")}
                  </button>
                )}
              </div>

              {projInstId && (
                <div style={{ marginTop: 20 }}>
                  <input
                    placeholder={t("search_placeholder")}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ marginBottom: 10 }}
                  />
                  {isSearching && <p>{t("uploading")}...</p>}
                  {discoveredProjects.length > 0 && (
                    <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 10 }}>
                      {discoveredProjects.map(p => (
                        <div key={p.project_id} className="card" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong>{p.name}</strong><br />
                            <small>ID: {p.project_id}</small>
                          </div>
                          <button onClick={() => saveProject(p)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>{t("add_selected")}</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <h2>{t("registered_projects")}</h2>
            <div className="grid">
              {projects.map(proj => (
                <div key={proj.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="badge badge-project">{t("projects")}</span>
                      <h3>{proj.name}</h3>
                      <p>ID: {proj.project_id}</p>
                      <small>On: {instances.find(i => i.id === proj.instance_id)?.name}</small>
                    </div>
                    <div className="card-actions">
                      <button className="icon-btn" onClick={() => startEditProject(proj)} title={t("edit")}>✏️</button>
                      <button className="icon-btn" onClick={() => deleteProject(proj.id)} title={t("delete")}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "registry-upload" && (
          <div>
            <h1>{t("upload_registry_title")}</h1>
            <div className="card">
              <div className="input-group">
                <label>{t("select_project_preset")}</label>
                <select
                  onChange={e => {
                    const p = projects.find(proj => proj.id === e.target.value);
                    if (p) {
                      setUploadParams({ ...uploadParams, project_id: p.project_id, instance_id: p.instance_id });
                    }
                  }}
                >
                  <option value="">{t("manual_entry_or_select")}</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {!uploadParams.instance_id && (
                <div className="input-group">
                  <label>{t("instance_manual")}</label>
                  <select
                    value={uploadParams.instance_id}
                    onChange={e => setUploadParams({ ...uploadParams, instance_id: e.target.value })}
                  >
                    <option value="">{t("select_instance")}</option>
                    {instances.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="input-group">
                <label>{t("project_id_manual")}</label>
                <input
                  value={uploadParams.project_id}
                  onChange={e => setUploadParams({ ...uploadParams, project_id: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>{t("package_name")}</label>
                <input
                  value={uploadParams.package_name}
                  onChange={e => setUploadParams({ ...uploadParams, package_name: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>{t("package_version")}</label>
                <input
                  value={uploadParams.package_version}
                  onChange={e => setUploadParams({ ...uploadParams, package_version: e.target.value })}
                />
              </div>

              <div className="file-select-area" onClick={pickFile}>
                {uploadParams.file_path ? (
                  <div>
                    <strong>{t("selected")}:</strong> {uploadParams.file_name}<br />
                    <small>{uploadParams.file_path}</small>
                  </div>
                ) : (
                  t("click_select_file")
                )}
              </div>

              <button onClick={handleUpload}>{t("upload_btn")}</button>

              {uploadStatus && (
                <div style={{ marginTop: 20, padding: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                  {uploadStatus}
                </div>
              )}
            </div>
            <button onClick={() => setView("actions")} style={{ background: 'none', border: '1px solid var(--glass-border)' }}>{t("back_to_actions")}</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
