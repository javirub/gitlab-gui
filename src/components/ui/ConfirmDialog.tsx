import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import "./ConfirmDialog.css";

interface ConfirmDialogProps {
  message: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, variant = "default", onConfirm, onCancel }: ConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className={`confirm-dialog confirm-${variant}`} onClick={e => e.stopPropagation()}>
        {variant === "danger" && (
          <div className="confirm-icon">
            <AlertTriangle size={28} />
          </div>
        )}
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn-cancel" onClick={onCancel}>
            {t("cancel")}
          </button>
          <button
            className={`confirm-btn-ok ${variant === "danger" ? "confirm-btn-danger" : ""}`}
            onClick={onConfirm}
          >
            {t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
