import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import "./EnvVarConflictWarning.css";

export function EnvVarConflictWarning() {
  const { t } = useTranslation();

  return (
    <div className="conflict-warning">
      <AlertTriangle size={14} />
      <span>{t("masked_var_warning")}</span>
    </div>
  );
}
