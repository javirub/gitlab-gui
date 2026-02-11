import { Unlock, Shield, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ImportPreset } from "../../models";
import "./ImportOptionsDialog.css";

interface ImportOptionsDialogProps {
  count: number;
  onSelect: (preset: ImportPreset) => void;
  onCancel: () => void;
}

export function ImportOptionsDialog({ count, onSelect, onCancel }: ImportOptionsDialogProps) {
  const { t } = useTranslation();

  return (
    <div className="import-options-overlay" onClick={onCancel}>
      <div className="import-options-dialog" onClick={e => e.stopPropagation()}>
        <p className="import-options-title">{t("import_options_title")}</p>
        <p className="import-options-subtitle">
          {t("import_options_subtitle", { count })}
        </p>

        <div className="import-options-list">
          <button
            type="button"
            className="import-option-btn"
            onClick={() => onSelect("unprotected")}
          >
            <span className="import-option-icon import-option-icon-unprotected">
              <Unlock size={18} />
            </span>
            <span className="import-option-text">
              <span className="import-option-label">{t("import_unprotected")}</span>
              <span className="import-option-desc">{t("import_unprotected_desc")}</span>
            </span>
          </button>

          <button
            type="button"
            className="import-option-btn"
            onClick={() => onSelect("protected")}
          >
            <span className="import-option-icon import-option-icon-protected">
              <Shield size={18} />
            </span>
            <span className="import-option-text">
              <span className="import-option-label">{t("import_protected")}</span>
              <span className="import-option-desc">{t("import_protected_desc")}</span>
            </span>
          </button>

          <button
            type="button"
            className="import-option-btn"
            onClick={() => onSelect("protected_masked")}
          >
            <span className="import-option-icon import-option-icon-masked">
              <ShieldCheck size={18} />
            </span>
            <span className="import-option-text">
              <span className="import-option-label">{t("import_protected_masked")}</span>
              <span className="import-option-desc">{t("import_protected_masked_desc")}</span>
            </span>
          </button>
        </div>

        <button type="button" className="import-options-cancel" onClick={onCancel}>
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}
