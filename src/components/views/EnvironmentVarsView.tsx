import { useState } from "react";
import { KeyRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { GitLabInstance, GitLabProject } from "../../models";
import { useEnvVars } from "../../hooks/useEnvVars";
import { readEnvFromClipboard } from "../../utils/clipboardDetector";
import { useToast } from "../ui/ToastContext";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { EnvVarToolbar } from "../env-vars/EnvVarToolbar";
import { EnvVarTable } from "../env-vars/EnvVarTable";
import { EnvVarFileImport } from "../env-vars/EnvVarFileImport";
import "./EnvironmentVarsView.css";

interface EnvironmentVarsViewProps {
  instances: GitLabInstance[];
  projects: GitLabProject[];
}

export function EnvironmentVarsView({ instances, projects }: EnvironmentVarsViewProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const envVars = useEnvVars();
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedInstanceId, setSelectedInstanceId] = useState("");

  function handleProjectSelect(projectLocalId: string) {
    const project = projects.find(p => p.id === projectLocalId);
    if (!project) return;

    setSelectedProjectId(project.project_id);
    setSelectedInstanceId(project.instance_id);

    envVars.loadVariables(project.instance_id, project.project_id).catch(e => {
      showToast(`${t("error")}: ${e}`, "error");
    });
  }

  async function handlePasteClipboard() {
    try {
      const parsed = await readEnvFromClipboard();
      if (!parsed || parsed.length === 0) {
        showToast(t("clipboard_no_data"), "warning");
        return;
      }
      envVars.addRowsFromParsed(parsed);
      showToast(t("clipboard_imported", { count: parsed.length }), "success");
    } catch {
      showToast(t("clipboard_access_denied"), "error");
    }
  }

  async function handleSave() {
    if (!envVars.validateRows()) return;
    if (!selectedInstanceId || !selectedProjectId) return;

    const result = await envVars.saveAllChanges(selectedInstanceId, selectedProjectId);

    if (result.errors.length > 0) {
      for (const err of result.errors) {
        showToast(err, "error");
      }
      if (result.created + result.updated + result.deleted > 0) {
        showToast(t("save_partial_error"), "warning");
      }
    } else {
      showToast(
        t("save_success", {
          created: result.created,
          updated: result.updated,
          deleted: result.deleted,
        }),
        "success"
      );
    }

    // Reload variables after save
    envVars.loadVariables(selectedInstanceId, selectedProjectId).catch(e => {
      showToast(`${t("error")}: ${e}`, "error");
    });
  }

  function handleRefresh() {
    if (selectedInstanceId && selectedProjectId) {
      envVars.loadVariables(selectedInstanceId, selectedProjectId).catch(e => {
        showToast(`${t("error")}: ${e}`, "error");
      });
    }
  }

  const hasProject = selectedProjectId.length > 0;

  return (
    <div className="view-enter">
      <h1><KeyRound size={24} className="card-icon" /> {t("env_vars_title")}</h1>

      <div className="card">
        <div className="input-group">
          <label>{t("select_project_for_vars")}</label>
          <select onChange={e => handleProjectSelect(e.target.value)} defaultValue="">
            <option value="" disabled>{t("select_project_for_vars")}</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({instances.find(i => i.id === p.instance_id)?.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasProject && (
        <>
          <EnvVarToolbar
            inputMode={envVars.inputMode}
            setInputMode={envVars.setInputMode}
            isSaving={envVars.isSaving}
            hasUnsavedChanges={envVars.hasUnsavedChanges}
            onAddRow={envVars.addEmptyRow}
            onPasteClipboard={handlePasteClipboard}
            onSave={handleSave}
            onRefresh={handleRefresh}
          />

          {envVars.inputMode === "file" && (
            <EnvVarFileImport onImport={envVars.addRowsFromParsed} />
          )}

          {envVars.isLoading ? (
            <div className="envvar-loading">
              <LoadingSpinner size={32} message={t("loading_variables")} />
            </div>
          ) : (
            <EnvVarTable
              rows={envVars.rows}
              onUpdate={envVars.updateRowField}
              onDelete={envVars.markRowDeleted}
              onUndoEdit={envVars.undoRowEdit}
              onUndoDelete={envVars.undoRowDelete}
            />
          )}
        </>
      )}
    </div>
  );
}
