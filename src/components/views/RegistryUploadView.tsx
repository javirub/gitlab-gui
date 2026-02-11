import { useState } from "react";
import { ArrowLeft, Upload, FileUp } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useTranslation } from "react-i18next";
import type { GitLabInstance, GitLabProject, PackageUploadParams, View } from "../../models";
import { useToast } from "../ui/ToastContext";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import "./RegistryUploadView.css";

interface RegistryUploadViewProps {
  instances: GitLabInstance[];
  projects: GitLabProject[];
  setView: (view: View) => void;
}

export function RegistryUploadView({ instances, projects, setView }: RegistryUploadViewProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadParams, setUploadParams] = useState<PackageUploadParams>({
    project_id: "",
    instance_id: "",
    package_name: "",
    package_version: "",
    file_name: "",
    file_path: ""
  });

  async function pickFile() {
    const selected = await open({ multiple: false });
    if (selected && !Array.isArray(selected)) {
      const fileName = selected.split(/[\\/]/).pop() || "";
      setUploadParams(prev => ({ ...prev, file_path: selected, file_name: fileName }));
    }
  }

  async function handleUpload() {
    setIsUploading(true);
    try {
      const result = await invoke<string>("upload_package", { params: uploadParams });
      showToast(result, "success");
    } catch (e) {
      showToast(`${t("error")}: ${e}`, "error");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="view-enter">
      <h1><Upload size={24} className="card-icon" /> {t("upload_registry_title")}</h1>
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

        <button type="button" className="file-select-area" onClick={pickFile} aria-haspopup="dialog">
          {uploadParams.file_path ? (
            <div>
              <FileUp size={20} className="card-icon" />
              <strong>{t("selected")}:</strong> {uploadParams.file_name}<br />
              <small>{uploadParams.file_path}</small>
            </div>
          ) : (
            <div className="file-select-placeholder">
              <FileUp size={28} />
              <span>{t("click_select_file")}</span>
            </div>
          )}
        </button>

        <button onClick={handleUpload} disabled={isUploading}>
          {isUploading ? <LoadingSpinner size={18} /> : t("upload_btn")}
        </button>
      </div>

      <button className="btn-back" onClick={() => setView("actions")}>
        <ArrowLeft size={16} /> {t("back_to_actions")}
      </button>
    </div>
  );
}
