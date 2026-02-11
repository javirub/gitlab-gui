import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { GitLabInstance } from "../../models";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import "./InstancesView.css";

interface InstancesViewProps {
  instances: GitLabInstance[];
  editingInstanceId: string | null;
  instName: string;
  instUrl: string;
  instUser: string;
  instToken: string;
  setInstName: (v: string) => void;
  setInstUrl: (v: string) => void;
  setInstUser: (v: string) => void;
  setInstToken: (v: string) => void;
  saveInstance: () => void;
  deleteInstance: (id: string) => Promise<boolean>;
  startEditInstance: (inst: GitLabInstance) => void;
  cancelEdit: () => void;
}

export function InstancesView({
  instances,
  editingInstanceId,
  instName, instUrl, instUser, instToken,
  setInstName, setInstUrl, setInstUser, setInstToken,
  saveInstance, deleteInstance, startEditInstance, cancelEdit,
}: InstancesViewProps) {
  const { t } = useTranslation();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function handleDelete() {
    if (confirmDeleteId) {
      await deleteInstance(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  }

  return (
    <div className="view-enter">
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
        <div className="form-actions">
          <button onClick={saveInstance}>{editingInstanceId ? t("update_btn") : t("register_btn")}</button>
          {editingInstanceId && (
            <button className="btn-secondary" onClick={cancelEdit}>{t("cancel")}</button>
          )}
        </div>
      </div>

      <h2>{t("registered_instances")}</h2>
      <div className="grid">
        {instances.map(inst => (
          <div key={inst.id} className="card card-hoverable">
            <div className="card-header">
              <div>
                <span className="badge badge-instance">{t("instances")}</span>
                <h3>{inst.name}</h3>
                <p>{inst.url}</p>
              </div>
              <div className="card-actions">
                <button className="icon-btn" onClick={() => startEditInstance(inst)} title={t("edit")}>
                  <Pencil size={16} />
                </button>
                <button className="icon-btn icon-btn-danger" onClick={() => setConfirmDeleteId(inst.id)} title={t("delete")}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {confirmDeleteId && (
        <ConfirmDialog
          message={t("confirm_delete_inst")}
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
