export interface GitLabInstance {
  id: string;
  name: string;
  url: string;
  username: string;
  token: string;
}

export interface GitLabProject {
  id: string;
  instance_id: string;
  project_id: string;
  name: string;
}

export interface PackageUploadParams {
  project_id: string;
  instance_id: string;
  package_name: string;
  package_version: string;
  file_name: string;
  file_path: string;
}

// Environment Variables
export interface GitLabVariable {
  key: string;
  value: string;
  variable_type: string;
  protected: boolean;
  masked: boolean;
  environment_scope: string;
}

export interface CreateVariableParams {
  instance_id: string;
  project_id: string;
  key: string;
  value: string;
  variable_type: string;
  protected: boolean;
  masked: boolean;
  environment_scope: string;
}

export interface UpdateVariableParams {
  instance_id: string;
  project_id: string;
  key: string;
  value: string;
  variable_type: string;
  protected: boolean;
  masked: boolean;
  environment_scope: string;
}

export interface DeleteVariableParams {
  instance_id: string;
  project_id: string;
  key: string;
  environment_scope: string;
}

export type EnvVarStatus = "existing" | "new" | "edited" | "deleted";

export interface EnvVarRow {
  rowId: string;
  key: string;
  value: string;
  variable_type: string;
  protected: boolean;
  masked: boolean;
  environment_scope: string;
  status: EnvVarStatus;
  originalKey: string;
  isMaskedOnServer: boolean;
  errors: string[];
}

export type View = "actions" | "instances" | "projects" | "registry-upload" | "env-vars";
