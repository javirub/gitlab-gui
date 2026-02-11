import { useState } from "react";
import { FileUp, Upload } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { useTranslation } from "react-i18next";
import { parseEnvText, type ParsedEnvVar } from "../../utils/envParser";
import { useToast } from "../ui/ToastContext";
import "./EnvVarFileImport.css";

interface EnvVarFileImportProps {
  onImport: (parsed: ParsedEnvVar[]) => void;
}

export function EnvVarFileImport({ onImport }: EnvVarFileImportProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [preview, setPreview] = useState<ParsedEnvVar[]>([]);
  const [filePath, setFilePath] = useState<string | null>(null);

  async function handleSelectFile() {
    const selected = await open({
      multiple: false,
      filters: [
        { name: "Environment Files", extensions: ["env", "txt", "yml", "conf", "properties"] }
      ]
    });

    if (!selected || Array.isArray(selected)) return;

    setFilePath(selected);

    try {
      const content = await readTextFile(selected);
      const parsed = parseEnvText(content);

      if (!parsed || parsed.length === 0) {
        showToast(t("file_parse_error"), "error");
        setPreview([]);
        return;
      }

      setPreview(parsed);
    } catch (e) {
      showToast(`${t("error")}: ${e}`, "error");
      setPreview([]);
    }
  }

  function handleImport() {
    if (preview.length > 0) {
      onImport(preview);
      setPreview([]);
      setFilePath(null);
    }
  }

  return (
    <div className="file-import-panel">
      <button type="button" className="file-import-select" onClick={handleSelectFile} aria-haspopup="dialog">
        <FileUp size={28} />
        <span>{filePath || t("select_env_file")}</span>
      </button>

      {preview.length > 0 && (
        <div className="file-import-preview">
          <h4>{t("file_import_preview")} - {t("parsed_count", { count: preview.length })}</h4>
          <div className="file-import-preview-list">
            {preview.map((p, i) => (
              <div key={i} className="file-import-preview-row">
                <span className="file-import-key">{p.key}</span>
                <span className="file-import-eq">=</span>
                <span className="file-import-val">{p.value.length > 40 ? p.value.slice(0, 40) + "..." : p.value}</span>
              </div>
            ))}
          </div>
          <button className="file-import-btn" onClick={handleImport} type="button">
            <Upload size={16} /> {t("import_variables")}
          </button>
        </div>
      )}
    </div>
  );
}
