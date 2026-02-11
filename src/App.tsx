import { useState, useEffect } from "react";
import { useGitLabInstances } from "./hooks/useGitLabInstances";
import { useGitLabProjects } from "./hooks/useGitLabProjects";
import { Sidebar } from "./components/layout/Sidebar";
import { ActionsView } from "./components/views/ActionsView";
import { InstancesView } from "./components/views/InstancesView";
import { ProjectsView } from "./components/views/ProjectsView";
import { RegistryUploadView } from "./components/views/RegistryUploadView";
import { EnvironmentVarsView } from "./components/views/EnvironmentVarsView";
import { ToastProvider } from "./components/ui/ToastContext";
import type { View } from "./models";
import "./App.css";

function App() {
  const [view, setView] = useState<View>("actions");
  const instancesHook = useGitLabInstances();
  const projectsHook = useGitLabProjects();

  useEffect(() => {
    instancesHook.loadInstances();
    projectsHook.loadProjects();
  }, []);

  async function handleDeleteInstance(id: string): Promise<boolean> {
    const updatedProjects = await instancesHook.deleteInstance(id);
    projectsHook.setProjects(updatedProjects);
    return true;
  }

  return (
    <ToastProvider>
      <div className="app-container">
        <Sidebar view={view} setView={setView} />
        <main className="main-content">
          {view === "actions" && <ActionsView setView={setView} />}
          {view === "instances" && (
            <InstancesView {...instancesHook} deleteInstance={handleDeleteInstance} />
          )}
          {view === "projects" && (
            <ProjectsView instances={instancesHook.instances} {...projectsHook} />
          )}
          {view === "registry-upload" && (
            <RegistryUploadView
              instances={instancesHook.instances}
              projects={projectsHook.projects}
              setView={setView}
            />
          )}
          {view === "env-vars" && (
            <EnvironmentVarsView
              instances={instancesHook.instances}
              projects={projectsHook.projects}
            />
          )}
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;
