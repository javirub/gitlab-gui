import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { GitLabProject } from "../models";
import { useStore } from "./useStore";

export function useGitLabProjects() {
  const { getProjects, setProjects: storeProjects } = useStore();
  const [projects, setProjects] = useState<GitLabProject[]>([]);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projName, setProjName] = useState("");
  const [projId, setProjId] = useState("");
  const [projInstId, setProjInstId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [discoveredProjects, setDiscoveredProjects] = useState<GitLabProject[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const loadProjects = useCallback(async () => {
    const saved = await getProjects();
    setProjects(saved);
    return saved;
  }, []);

  async function saveProject(p?: GitLabProject) {
    let updated: GitLabProject[];
    if (editingProjectId) {
      updated = projects.map(proj =>
        proj.id === editingProjectId
          ? { ...proj, name: projName.trim(), project_id: projId.trim(), instance_id: projInstId }
          : proj
      );
      setEditingProjectId(null);
    } else {
      const newProject: GitLabProject = p ? {
        ...p,
        id: crypto.randomUUID(),
      } : {
        id: crypto.randomUUID(),
        instance_id: projInstId,
        project_id: projId.trim(),
        name: projName.trim()
      };
      updated = [...projects, newProject];
    }
    setProjects(updated);
    await storeProjects(updated);
    setProjName("");
    setProjId("");
  }

  async function deleteProject(id: string): Promise<boolean> {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    await storeProjects(updated);
    return true;
  }

  function startEditProject(proj: GitLabProject) {
    setEditingProjectId(proj.id);
    setProjName(proj.name);
    setProjId(proj.project_id);
    setProjInstId(proj.instance_id);
  }

  function cancelEdit() {
    setEditingProjectId(null);
    setProjName("");
    setProjId("");
  }

  async function handleSearch() {
    if (!projInstId) return;
    setIsSearching(true);
    try {
      const results = await invoke<GitLabProject[]>("search_projects", {
        instanceId: projInstId,
        query: searchQuery || null
      });
      setDiscoveredProjects(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  }

  return {
    projects,
    setProjects,
    editingProjectId,
    projName, setProjName,
    projId, setProjId,
    projInstId, setProjInstId,
    searchQuery, setSearchQuery,
    discoveredProjects,
    isSearching,
    loadProjects,
    saveProject,
    deleteProject,
    startEditProject,
    cancelEdit,
    handleSearch,
  };
}
