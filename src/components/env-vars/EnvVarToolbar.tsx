import { Plus, ClipboardPaste, Save, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import "./EnvVarToolbar.css";

interface EnvVarToolbarProps {
  inputMode: "manual" | "file";
  setInputMode: (mode: "manual" | "file") => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onAddRow: () => void;
  onPasteClipboard: () => void;
  onSave: () => void;
  onRefresh: () => void;
}

export function EnvVarToolbar({
  inputMode, setInputMode,
  isSaving, hasUnsavedChanges,
  onAddRow, onPasteClipboard, onSave, onRefresh,
}: EnvVarToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="envvar-toolbar">
      <div className="envvar-toolbar-tabs">
        <button
          className={`envvar-tab ${inputMode === "manual" ? "envvar-tab-active" : ""}`}
          onClick={() => setInputMode("manual")}
          type="button"
        >
          {t("manual_mode")}
        </button>
        <button
          className={`envvar-tab ${inputMode === "file" ? "envvar-tab-active" : ""}`}
          onClick={() => setInputMode("file")}
          type="button"
        >
          {t("file_mode")}
        </button>
      </div>

      <div className="envvar-toolbar-actions">
        {inputMode === "manual" && (
          <>
            <button className="envvar-toolbar-btn" onClick={onAddRow} type="button">
              <Plus size={16} /> {t("add_row")}
            </button>
            <button className="envvar-toolbar-btn" onClick={onPasteClipboard} type="button">
              <ClipboardPaste size={16} /> {t("paste_clipboard")}
            </button>
          </>
        )}
        <button className="envvar-toolbar-btn" onClick={onRefresh} type="button">
          <RefreshCw size={16} /> {t("refresh_variables")}
        </button>
        <button
          className="envvar-toolbar-btn envvar-save-btn"
          onClick={onSave}
          disabled={isSaving || !hasUnsavedChanges}
          type="button"
        >
          {isSaving ? <LoadingSpinner size={16} /> : <Save size={16} />}
          {t("save_changes")}
        </button>
      </div>
    </div>
  );
}
