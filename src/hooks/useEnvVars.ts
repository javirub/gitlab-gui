import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { GitLabVariable, EnvVarRow, EnvVarRowSnapshot, SaveError, ImportResult } from "../models";
import type { ParsedEnvVar } from "../utils/envParser";

interface SaveResult {
  created: number;
  updated: number;
  deleted: number;
  errors: SaveError[];
}

function captureSnapshot(row: EnvVarRow): EnvVarRowSnapshot {
  return {
    key: row.key,
    value: row.value,
    variable_type: row.variable_type,
    protected: row.protected,
    masked: row.masked,
    environment_scope: row.environment_scope,
    description: row.description,
  };
}

function variableToRow(v: GitLabVariable): EnvVarRow {
  return {
    rowId: crypto.randomUUID(),
    key: v.key,
    value: v.value,
    variable_type: v.variable_type,
    protected: v.protected,
    masked: v.masked,
    environment_scope: v.environment_scope,
    description: v.description,
    status: "existing",
    originalKey: v.key,
    isMaskedOnServer: v.masked,
    errors: [],
    originalSnapshot: null,
  };
}

export function useEnvVars() {
  const [rows, setRows] = useState<EnvVarRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [inputMode, setInputMode] = useState<"manual" | "file">("manual");

  const loadVariables = useCallback(async (instanceId: string, projectId: string) => {
    setIsLoading(true);
    try {
      const vars = await invoke<GitLabVariable[]>("list_variables", {
        instanceId,
        projectId,
      });
      setRows(vars.map(variableToRow));
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  function addEmptyRow() {
    const newRow: EnvVarRow = {
      rowId: crypto.randomUUID(),
      key: "",
      value: "",
      variable_type: "env_var",
      protected: false,
      masked: false,
      environment_scope: "*",
      description: "",
      status: "new",
      originalKey: "",
      isMaskedOnServer: false,
      errors: [],
      originalSnapshot: null,
    };
    setRows(prev => [...prev, newRow]);
  }

  function addRowsFromParsed(parsed: ParsedEnvVar[]): ImportResult {
    let imported = 0;
    let merged = 0;

    const existingKeyMap = new Map<string, number>();
    rows.forEach((row, idx) => {
      if (row.status !== "deleted") {
        existingKeyMap.set(row.key, idx);
      }
    });

    const updatedRows = [...rows];
    const newRows: EnvVarRow[] = [];

    for (const p of parsed) {
      const existingIdx = existingKeyMap.get(p.key);
      if (existingIdx !== undefined) {
        const existingRow = updatedRows[existingIdx];
        updatedRows[existingIdx] = {
          ...existingRow,
          value: p.value,
          status: existingRow.status === "new" ? "new" : "edited",
          originalSnapshot: existingRow.status === "existing" && !existingRow.originalSnapshot
            ? captureSnapshot(existingRow)
            : existingRow.originalSnapshot,
        };
        merged++;
      } else {
        newRows.push({
          rowId: crypto.randomUUID(),
          key: p.key,
          value: p.value,
          variable_type: "env_var",
          protected: false,
          masked: false,
          environment_scope: "*",
          description: "",
          status: "new",
          originalKey: "",
          isMaskedOnServer: false,
          errors: [],
          originalSnapshot: null,
        });
        imported++;
      }
    }

    setRows([...updatedRows, ...newRows]);
    return { imported, merged };
  }

  function updateRowField(rowId: string, field: keyof EnvVarRow, value: string | boolean) {
    setRows(prev => prev.map(row => {
      if (row.rowId !== rowId) return row;
      const updated = { ...row, [field]: value };
      if (row.status === "existing") {
        updated.status = "edited";
        if (!row.originalSnapshot) {
          updated.originalSnapshot = captureSnapshot(row);
        }
      }
      return updated;
    }));
  }

  function markRowDeleted(rowId: string) {
    setRows(prev => prev.map(row => {
      if (row.rowId !== rowId) return row;
      if (row.status === "new") {
        return row;
      }
      return { ...row, status: "deleted" as const };
    }).filter(row => !(row.rowId === rowId && row.status === "new")));
  }

  function undoRowEdit(rowId: string) {
    setRows(prev => prev.map(row => {
      if (row.rowId !== rowId || row.status !== "edited") return row;
      if (row.originalSnapshot) {
        return {
          ...row,
          ...row.originalSnapshot,
          status: "existing" as const,
          originalSnapshot: null,
          errors: [],
        };
      }
      return { ...row, status: "existing" as const };
    }));
  }

  function undoRowDelete(rowId: string) {
    setRows(prev => prev.map(row => {
      if (row.rowId !== rowId || row.status !== "deleted") return row;
      return { ...row, status: "existing" as const };
    }));
  }

  function validateRows(): boolean {
    let valid = true;

    const keyCount = new Map<string, number>();
    for (const row of rows) {
      if (row.status === "deleted") continue;
      const count = keyCount.get(row.key) || 0;
      keyCount.set(row.key, count + 1);
    }

    const validatedRows = rows.map(row => {
      const errors: string[] = [];
      if (row.status !== "deleted") {
        if (!row.key.trim()) {
          errors.push("key_required");
          valid = false;
        }
        if (row.key && (keyCount.get(row.key) || 0) > 1) {
          errors.push("duplicate_key_warning");
          valid = false;
        }
        if (row.masked && row.value.length < 8) {
          errors.push("masked_min_length_warning");
          valid = false;
        }
      }
      return { ...row, errors };
    });

    setRows(validatedRows);
    return valid;
  }

  const hasUnsavedChanges = rows.some(r => r.status !== "existing");

  async function saveAllChanges(instanceId: string, projectId: string): Promise<SaveResult> {
    setIsSaving(true);
    const result: SaveResult = { created: 0, updated: 0, deleted: 0, errors: [] };

    try {
      // 1. Process deletions first
      const deletions = rows.filter(r => r.status === "deleted");
      for (const row of deletions) {
        try {
          await invoke("delete_variable", {
            params: {
              instance_id: instanceId,
              project_id: projectId,
              key: row.originalKey,
              environment_scope: row.environment_scope,
            }
          });
          result.deleted++;
        } catch (e) {
          result.errors.push({ type: "delete", key: row.key, error: String(e) });
        }
      }

      // 2. Process updates
      const updates = rows.filter(r => r.status === "edited");
      for (const row of updates) {
        const isKeyRenamed = row.originalKey !== row.key;

        // Key rename or masked fallback: delete old + create new
        if (isKeyRenamed || row.isMaskedOnServer) {
          try {
            await invoke("delete_variable", {
              params: {
                instance_id: instanceId,
                project_id: projectId,
                key: row.originalKey,
                environment_scope: row.originalSnapshot?.environment_scope ?? row.environment_scope,
              }
            });
            await invoke("create_variable", {
              params: {
                instance_id: instanceId,
                project_id: projectId,
                key: row.key,
                value: row.value,
                variable_type: row.variable_type,
                protected: row.protected,
                masked: row.masked,
                environment_scope: row.environment_scope,
                description: row.description,
              }
            });
            result.updated++;
          } catch (e) {
            result.errors.push({ type: "update", key: row.key, error: String(e) });
          }
        } else {
          try {
            await invoke("update_variable", {
              params: {
                instance_id: instanceId,
                project_id: projectId,
                key: row.key,
                value: row.value,
                variable_type: row.variable_type,
                protected: row.protected,
                masked: row.masked,
                environment_scope: row.environment_scope,
                description: row.description,
              }
            });
            result.updated++;
          } catch (e) {
            result.errors.push({ type: "update", key: row.key, error: String(e) });
          }
        }
      }

      // 3. Process creations
      const creations = rows.filter(r => r.status === "new");
      for (const row of creations) {
        try {
          await invoke("create_variable", {
            params: {
              instance_id: instanceId,
              project_id: projectId,
              key: row.key,
              value: row.value,
              variable_type: row.variable_type,
              protected: row.protected,
              masked: row.masked,
              environment_scope: row.environment_scope,
              description: row.description,
            }
          });
          result.created++;
        } catch (e) {
          result.errors.push({ type: "create", key: row.key, error: String(e) });
        }
      }

      return result;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    rows,
    isLoading,
    isSaving,
    inputMode,
    setInputMode,
    hasUnsavedChanges,
    loadVariables,
    addEmptyRow,
    addRowsFromParsed,
    updateRowField,
    markRowDeleted,
    undoRowEdit,
    undoRowDelete,
    validateRows,
    saveAllChanges,
  };
}
