# GitLab GUI - Project Memory

## Architecture
- Tauri v2 desktop app: Rust backend + React 18 + TypeScript
- Uses pure CSS with glassmorphism design (no Tailwind)
- i18n: react-i18next with EN/ES translations
- State: `@tauri-apps/plugin-store` via `LazyStore`
- Icons: `lucide-react` (tree-shakeable SVG icons)

## Project Structure
```
src/
  App.tsx           - Slim shell (~50 lines): ToastProvider + Sidebar + view routing
  App.css           - Global CSS variables, resets, shared classes
  models.ts         - All TS interfaces including env vars + View type
  i18n.ts           - EN + ES translations (~100 keys each)
  components/
    layout/Sidebar.tsx    - Nav with lucide icons
    ui/Toast.tsx + ToastContext.tsx  - Toast notification system
    ui/ConfirmDialog.tsx  - Replaces native confirm()
    ui/LoadingSpinner.tsx - Reusable spinner
    views/ActionsView.tsx - Action cards grid
    views/InstancesView.tsx - Instance CRUD
    views/ProjectsView.tsx  - Project CRUD + discovery
    views/RegistryUploadView.tsx - Package upload
    views/EnvironmentVarsView.tsx - Env var management
    env-vars/EnvVarTable.tsx - Variable data table
    env-vars/EnvVarRow.tsx   - Single editable row
    env-vars/EnvVarToolbar.tsx - Mode toggle + action buttons
    env-vars/EnvVarFileImport.tsx - File picker + preview
    env-vars/EnvVarConflictWarning.tsx - Masked var warning
  hooks/
    useStore.ts           - Wraps LazyStore
    useGitLabInstances.ts - Instance CRUD state
    useGitLabProjects.ts  - Project CRUD + search
    useEnvVars.ts         - Env var state + API calls
  utils/
    envParser.ts          - KEY=VALUE text parser
    clipboardDetector.ts  - Clipboard env var detection

src-tauri/src/
  models.rs  - Rust structs (GitLabVariable, Create/Update/DeleteParams)
  gitlab.rs  - GitLabClient with list/create/update/delete_variable methods
  lib.rs     - get_client helper + 6 Tauri commands
```

## Build Commands
- Frontend: `bun run build` (tsc + vite)
- Rust: `cargo build --manifest-path src-tauri/Cargo.toml`
- Dev: `bun run tauri dev`

## Key Patterns
- Views use `ConfirmDialog` instead of native `confirm()`
- Toast notifications via `useToast()` from `ToastContext`
- All views wrapped in `.view-enter` for fade-in animation
- Env var masked update: delete + recreate fallback when update fails
- CSS: per-component files, global vars in App.css
