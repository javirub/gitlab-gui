import { useState } from "react";
import { Trash2, Undo2, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { EnvVarRow as EnvVarRowType } from "../../models";
import { EnvVarConflictWarning } from "./EnvVarConflictWarning";

interface EnvVarRowProps {
  row: EnvVarRowType;
  existingMaskedKeys: Set<string>;
  onUpdate: (rowId: string, field: keyof EnvVarRowType, value: string | boolean) => void;
  onDelete: (rowId: string) => void;
  onUndoEdit: (rowId: string) => void;
  onUndoDelete: (rowId: string) => void;
}

export function EnvVarRowComponent({
  row, existingMaskedKeys, onUpdate, onDelete, onUndoEdit, onUndoDelete,
}: EnvVarRowProps) {
  const { t } = useTranslation();
  const [showValue, setShowValue] = useState(false);

  const isDeleted = row.status === "deleted";
  const showConflict = row.status === "new" && existingMaskedKeys.has(row.key) && row.key.length > 0;

  const statusColors: Record<string, string> = {
    new: "#4ade80",
    edited: "#fbbf24",
    existing: "#6b7280",
    deleted: "#f87171",
  };

  return (
    <>
      <tr className={`envvar-row envvar-row-${row.status}`}>
        <td>
          <span
            className="status-dot"
            style={{ backgroundColor: statusColors[row.status] }}
            title={t(`status_${row.status}`)}
          />
        </td>
        <td>
          <input
            className="envvar-input"
            value={row.key}
            onChange={e => onUpdate(row.rowId, "key", e.target.value)}
            disabled={isDeleted}
            placeholder="KEY_NAME"
          />
          {row.errors.length > 0 && (
            <div className="envvar-error">
              {row.errors.map((err, i) => (
                <span key={i}>{t(err, err)}</span>
              ))}
            </div>
          )}
        </td>
        <td className="envvar-value-cell">
          <input
            className="envvar-input"
            type={showValue ? "text" : "password"}
            value={row.value}
            onChange={e => onUpdate(row.rowId, "value", e.target.value)}
            disabled={isDeleted}
            placeholder="value"
          />
          <button
            className="icon-btn envvar-toggle-btn"
            onClick={() => setShowValue(!showValue)}
            title={showValue ? t("hide_value") : t("reveal_value")}
            aria-label={showValue ? t("hide_value") : t("reveal_value")}
            type="button"
          >
            {showValue ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </td>
        <td>
          <select
            className="envvar-select"
            value={row.variable_type}
            onChange={e => onUpdate(row.rowId, "variable_type", e.target.value)}
            disabled={isDeleted}
          >
            <option value="env_var">env_var</option>
            <option value="file">file</option>
          </select>
        </td>
        <td className="envvar-checkbox-cell">
          <input
            type="checkbox"
            checked={row.protected}
            onChange={e => onUpdate(row.rowId, "protected", e.target.checked)}
            disabled={isDeleted}
          />
        </td>
        <td className="envvar-checkbox-cell">
          <input
            type="checkbox"
            checked={row.masked}
            onChange={e => onUpdate(row.rowId, "masked", e.target.checked)}
            disabled={isDeleted}
          />
        </td>
        <td>
          <input
            className="envvar-input envvar-scope-input"
            value={row.environment_scope}
            onChange={e => onUpdate(row.rowId, "environment_scope", e.target.value)}
            disabled={isDeleted}
          />
        </td>
        <td>
          <input
            className="envvar-input"
            value={row.description}
            onChange={e => onUpdate(row.rowId, "description", e.target.value)}
            disabled={isDeleted}
            placeholder={t("var_description")}
          />
        </td>
        <td>
          <div className="envvar-actions">
            {isDeleted ? (
              <button className="icon-btn" onClick={() => onUndoDelete(row.rowId)} title={t("undo_delete")} aria-label={t("undo_delete")} type="button">
                <Undo2 size={14} />
              </button>
            ) : (
              <>
                {row.status === "edited" && (
                  <button className="icon-btn" onClick={() => onUndoEdit(row.rowId)} title={t("undo_edit")} aria-label={t("undo_edit")} type="button">
                    <Undo2 size={14} />
                  </button>
                )}
                <button className="icon-btn icon-btn-danger" onClick={() => onDelete(row.rowId)} title={t("delete")} aria-label={t("delete")} type="button">
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
      {showConflict && (
        <tr>
          <td colSpan={9} className="envvar-conflict-cell">
            <EnvVarConflictWarning />
          </td>
        </tr>
      )}
    </>
  );
}
