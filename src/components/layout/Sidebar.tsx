import { Zap, Server, FolderGit2, KeyRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { View } from "../../models";
import "./Sidebar.css";

interface SidebarProps {
  view: View;
  setView: (view: View) => void;
}

const navItems: { key: View; icon: typeof Zap; labelKey: string }[] = [
  { key: "actions", icon: Zap, labelKey: "actions" },
  { key: "instances", icon: Server, labelKey: "instances" },
  { key: "projects", icon: FolderGit2, labelKey: "projects" },
  { key: "env-vars", icon: KeyRound, labelKey: "env_vars" },
];

export function Sidebar({ view, setView }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">{t("title")}</div>
      {navItems.map(item => {
        const Icon = item.icon;
        return (
          <div
            key={item.key}
            className={`nav-item ${view === item.key ? "active" : ""}`}
            onClick={() => setView(item.key)}
          >
            <Icon size={18} />
            {t(item.labelKey)}
          </div>
        );
      })}
    </div>
  );
}
