import { useState } from "react";
import { Pencil, Trash2, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { GitLabInstance, GitLabProject } from "../../models";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import "./ProjectsView.css";

interface ProjectsViewProps {
  instances: GitLabInstance[];
  projects: GitLabProject[];
  editingProjectId: string | null;
  projName: string;
  projId: string;
  projInstId: string;
  searchQuery: string;
  discoveredProjects: GitLabProject[];
  isSearching: boolean;
  setProjName: (v: string) => void;
  setProjId: (v: string) => void;
  setProjInstId: (v: string) => void;
  setSearchQuery: (v: string) => void;
  saveProject: (p?: GitLabProject) => void;
  deleteProject: (id: string) => Promise<boolean>;
  startEditProject: (proj: GitLabProject) => void;
  cancelEdit: () => void;
  handleSearch: () => void;
}

export function ProjectsView({
  instances, projects,
  editingProjectId, projName, projId, projInstId,
  searchQuery, discoveredProjects, isSearching,
  setProjName, setProjId, setProjInstId, setSearchQuery,
  saveProject, deleteProject, startEditProject, cancelEdit,
  handleSearch,
}: ProjectsViewProps) {
  const { t } = useTranslation();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function handleDelete() {
    if (confirmDeleteId) {
      await deleteProject(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  }

  return (
    <div className="view-enter">
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
        <div className="form-actions">
          <button onClick={() => saveProject()}>{editingProjectId ? t("update_btn") : t("register_btn")}</button>
          {editingProjectId && (
            <button className="btn-secondary" onClick={cancelEdit}>{t("cancel")}</button>
          )}
          {!editingProjectId && (
            <button
              className="btn-secondary"
              onClick={handleSearch}
              disabled={!projInstId}
            >
              <Search size={16} />
              {t("search_projects")}
            </button>
          )}
        </div>

        {projInstId && (
          <div className="discovery-section">
            <input
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {isSearching && <LoadingSpinner message={t("searching")} />}
            {discoveredProjects.length > 0 && (
              <div className="discovered-list">
                {discoveredProjects.map(p => (
                  <div key={p.project_id} className="discovered-item">
                    <div>
                      <strong>{p.name}</strong>
                      <small>ID: {p.project_id}</small>
                    </div>
                    <button className="btn-small" onClick={() => saveProject(p)}>{t("add_selected")}</button>
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
          <div key={proj.id} className="card card-hoverable">
            <div className="card-header">
              <div>
                <span className="badge badge-project">{t("projects")}</span>
                <h3>{proj.name}</h3>
                <p>ID: {proj.project_id}</p>
                <small>On: {instances.find(i => i.id === proj.instance_id)?.name}</small>
              </div>
              <div className="card-actions">
                <button className="icon-btn" onClick={() => startEditProject(proj)} title={t("edit")}>
                  <Pencil size={16} />
                </button>
                <button className="icon-btn icon-btn-danger" onClick={() => setConfirmDeleteId(proj.id)} title={t("delete")}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {confirmDeleteId && (
        <ConfirmDialog
          message={t("confirm_delete_proj")}
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
