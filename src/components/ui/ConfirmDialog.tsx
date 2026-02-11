import { useEffect } from "react";
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

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div
        className={`confirm-dialog confirm-${variant}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("are_you_sure")}
        onClick={e => e.stopPropagation()}
      >
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
