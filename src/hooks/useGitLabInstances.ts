import { useState, useCallback } from "react";
import { GitLabInstance, GitLabProject } from "../models";
import { useStore } from "./useStore";

export function useGitLabInstances() {
  const { getInstances, setInstances: storeInstances, getProjects, setProjects: storeProjects } = useStore();
  const [instances, setInstances] = useState<GitLabInstance[]>([]);
  const [editingInstanceId, setEditingInstanceId] = useState<string | null>(null);
  const [instName, setInstName] = useState("");
  const [instUrl, setInstUrl] = useState("https://gitlab.com");
  const [instUser, setInstUser] = useState("");
  const [instToken, setInstToken] = useState("");

  const loadInstances = useCallback(async () => {
    const saved = await getInstances();
    setInstances(saved);
    return saved;
  }, []);

  async function saveInstance() {
    let updated: GitLabInstance[];
    if (editingInstanceId) {
      updated = instances.map(inst =>
        inst.id === editingInstanceId
          ? { ...inst, name: instName.trim(), url: instUrl.trim(), username: instUser.trim(), token: instToken.trim() }
          : inst
      );
      setEditingInstanceId(null);
    } else {
      const newInstance: GitLabInstance = {
        id: crypto.randomUUID(),
        name: instName.trim(),
        url: instUrl.trim(),
        username: instUser.trim(),
        token: instToken.trim()
      };
      updated = [...instances, newInstance];
    }
    setInstances(updated);
    await storeInstances(updated);
    resetForm();
  }

  async function deleteInstance(id: string): Promise<GitLabProject[]> {
    const updatedInstances = instances.filter(i => i.id !== id);
    const allProjects = await getProjects();
    const updatedProjects = allProjects.filter(p => p.instance_id !== id);
    setInstances(updatedInstances);
    await storeInstances(updatedInstances);
    await storeProjects(updatedProjects);
    return updatedProjects;
  }

  function startEditInstance(inst: GitLabInstance) {
    setEditingInstanceId(inst.id);
    setInstName(inst.name);
    setInstUrl(inst.url);
    setInstUser(inst.username);
    setInstToken(inst.token);
  }

  function resetForm() {
    setInstName("");
    setInstUrl("https://gitlab.com");
    setInstUser("");
    setInstToken("");
    setEditingInstanceId(null);
  }

  function cancelEdit() {
    resetForm();
  }

  return {
    instances,
    setInstances,
    editingInstanceId,
    instName, setInstName,
    instUrl, setInstUrl,
    instUser, setInstUser,
    instToken, setInstToken,
    loadInstances,
    saveInstance,
    deleteInstance,
    startEditInstance,
    cancelEdit,
  };
}
