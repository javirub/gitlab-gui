import { LazyStore } from "@tauri-apps/plugin-store";
import { GitLabInstance, GitLabProject } from "../models";

const store = new LazyStore("config.json", {
  autoSave: true,
  defaults: { instances: [], projects: [] }
});

export function useStore() {
  async function getInstances(): Promise<GitLabInstance[]> {
    const saved = await store.get<GitLabInstance[]>("instances");
    return saved || [];
  }

  async function setInstances(instances: GitLabInstance[]) {
    await store.set("instances", instances);
    await store.save();
  }

  async function getProjects(): Promise<GitLabProject[]> {
    const saved = await store.get<GitLabProject[]>("projects");
    return saved || [];
  }

  async function setProjects(projects: GitLabProject[]) {
    await store.set("projects", projects);
    await store.save();
  }

  return { getInstances, setInstances, getProjects, setProjects };
}
