import { useEffect, useState } from "react";
import { Unlock, Shield, ShieldCheck, Globe, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ImportPreset } from "../../models";
import "./ImportOptionsDialog.css";

interface ImportOptionsDialogProps {
  count: number;
  onSelect: (preset: ImportPreset, environmentScope: string) => void;
  onCancel: () => void;
}

type ScopeMode = "all" | "specific";

export function ImportOptionsDialog({ count, onSelect, onCancel }: ImportOptionsDialogProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [preset, setPreset] = useState<ImportPreset | null>(null);
  const [scopeMode, setScopeMode] = useState<ScopeMode>("all");
  const [specificScope, setSpecificScope] = useState("");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  function chooseProtection(selected: ImportPreset) {
    setPreset(selected);
    setStep(2);
  }

  const canConfirm = scopeMode === "all" || specificScope.trim().length > 0;

  function handleConfirm() {
    if (!preset || !canConfirm) return;
    onSelect(preset, scopeMode === "all" ? "*" : specificScope.trim());
  }

  return (
    <div className="import-options-overlay" onClick={onCancel}>
      <div
        className="import-options-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t("import_options_title")}
        onClick={e => e.stopPropagation()}
      >
        <p className="import-options-title">{t("import_options_title")}</p>
        <p className="import-options-subtitle">
          {step === 1 ? t("import_step_protection") : t("import_step_environment")} ·{" "}
          {t("import_options_subtitle", { count })}
        </p>

        {step === 1 ? (
          <div className="import-options-list">
            <button
              type="button"
              className="import-option-btn"
              onClick={() => chooseProtection("unprotected")}
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
              onClick={() => chooseProtection("protected")}
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
              onClick={() => chooseProtection("protected_masked")}
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
        ) : (
          <>
            <p className="import-env-question">{t("import_env_question")}</p>
            <div className="import-options-list">
              <button
                type="button"
                className={`import-option-btn${scopeMode === "all" ? " import-option-btn-selected" : ""}`}
                onClick={() => setScopeMode("all")}
                aria-pressed={scopeMode === "all"}
              >
                <span className="import-option-icon import-option-icon-unprotected">
                  <Globe size={18} />
                </span>
                <span className="import-option-text">
                  <span className="import-option-label">{t("import_env_all")}</span>
                  <span className="import-option-desc">{t("import_env_all_desc")}</span>
                </span>
              </button>

              <button
                type="button"
                className={`import-option-btn${scopeMode === "specific" ? " import-option-btn-selected" : ""}`}
                onClick={() => setScopeMode("specific")}
                aria-pressed={scopeMode === "specific"}
              >
                <span className="import-option-icon import-option-icon-protected">
                  <MapPin size={18} />
                </span>
                <span className="import-option-text">
                  <span className="import-option-label">{t("import_env_specific")}</span>
                </span>
              </button>
            </div>

            {scopeMode === "specific" && (
              <input
                className="import-env-input"
                value={specificScope}
                onChange={e => setSpecificScope(e.target.value)}
                placeholder={t("import_env_specific_placeholder")}
                autoFocus
              />
            )}

            <div className="import-options-actions">
              <button type="button" className="import-options-back" onClick={() => setStep(1)}>
                {t("import_back")}
              </button>
              <button
                type="button"
                className="import-options-confirm"
                onClick={handleConfirm}
                disabled={!canConfirm}
              >
                {t("import_confirm")}
              </button>
            </div>
          </>
        )}

        <button type="button" className="import-options-cancel" onClick={onCancel}>
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}
