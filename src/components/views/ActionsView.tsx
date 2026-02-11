import { Package, KeyRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { View } from "../../models";
import "./ActionsView.css";

interface ActionsViewProps {
  setView: (view: View) => void;
}

export function ActionsView({ setView }: ActionsViewProps) {
  const { t } = useTranslation();

  return (
    <div className="view-enter">
      <h1>{t("available_actions")}</h1>
      <div className="grid">
        <button type="button" className="card card-hoverable" onClick={() => setView("registry-upload")}>
          <h3><Package size={20} className="card-icon" /> {t("package_upload")}</h3>
          <p>{t("package_upload_desc")}</p>
        </button>
        <button type="button" className="card card-hoverable" onClick={() => setView("env-vars")}>
          <h3><KeyRound size={20} className="card-icon" /> {t("env_vars")}</h3>
          <p>{t("env_vars_desc")}</p>
        </button>
      </div>
    </div>
  );
}
