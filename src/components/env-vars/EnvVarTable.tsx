import { useTranslation } from "react-i18next";
import type { EnvVarRow } from "../../models";
import { EnvVarRowComponent } from "./EnvVarRow";
import "./EnvVarTable.css";

interface EnvVarTableProps {
  rows: EnvVarRow[];
  onUpdate: (rowId: string, field: keyof EnvVarRow, value: string | boolean) => void;
  onDelete: (rowId: string) => void;
  onUndoEdit: (rowId: string) => void;
  onUndoDelete: (rowId: string) => void;
}

export function EnvVarTable({ rows, onUpdate, onDelete, onUndoEdit, onUndoDelete }: EnvVarTableProps) {
  const { t } = useTranslation();

  // Collect masked keys from non-deleted server rows for conflict detection
  const existingMaskedKeys = new Set<string>();
  for (const row of rows) {
    if (row.status !== "deleted" && row.isMaskedOnServer) {
      existingMaskedKeys.add(row.originalKey);
    }
  }

  if (rows.length === 0) {
    return <p className="envvar-empty">{t("no_variables")}</p>;
  }

  return (
    <div className="envvar-table-wrapper">
      <table className="envvar-table">
        <thead>
          <tr>
            <th className="envvar-th-status"></th>
            <th>{t("var_key")}</th>
            <th>{t("var_value")}</th>
            <th>{t("var_type")}</th>
            <th>{t("var_protected")}</th>
            <th>{t("var_masked")}</th>
            <th>{t("var_scope")}</th>
            <th>{t("var_description")}</th>
            <th>{t("var_actions")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <EnvVarRowComponent
              key={row.rowId}
              row={row}
              existingMaskedKeys={existingMaskedKeys}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onUndoEdit={onUndoEdit}
              onUndoDelete={onUndoDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
