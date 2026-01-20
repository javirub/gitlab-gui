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
