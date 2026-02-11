# GitLab GUI

A powerful and intuitive desktop application built with **Tauri**, **Rust**, and **React** to simplify complex or repetitive GitLab tasks. Designed with a premium dark-themed UI and extensible architecture.

## Current Capabilities

### Package Registry Upload
- **Generic Package Support**: Easily upload files to the GitLab Generic Package Registry.
- **Preset Management**: Register your most used projects and select them from a dropdown to skip manual ID entry.
- **Manual Overrides**: Still allows manual entry of Instance URL and Project ID for quick, one-off tasks.

### Environment Variables (CI/CD)
- **Full CRUD**: List, create, update, and delete CI/CD variables for any registered project.
- **Inline Editing**: Edit variables directly in the table with real-time status tracking (new, edited, deleted).
- **Undo Support**: Revert individual edits or deletions before saving, restoring original field values.
- **Key Rename Handling**: Renaming a variable key is handled transparently via delete + recreate on the server.
- **Masked Variable Support**: Automatic delete + recreate fallback when updating masked variables. Enforces GitLab's 8-character minimum for masked values with inline validation warnings.
- **Clipboard Import**: Paste environment variables from the clipboard (Ctrl+V or toolbar button). Duplicate keys are merged into existing rows (marked as edited with undo enabled) instead of creating duplicates.
- **File Import**: Import variables from `.env`, `.txt`, `.yml`, `.conf`, or `.properties` files with preview before applying.
- **Duplicate & Validation Checks**: Detects duplicate keys, missing keys, and masked value length issues before saving.
- **Structured Error Reporting**: Save errors are displayed with localized messages per variable.

### Project Discovery
- **Native Search**: Search for projects directly from your registered GitLab instances without leaving the app. Search queries are properly URL-encoded.
- **Quick Registration**: Find your repositories by name and add them to your local shortcuts with a single click.

### Instance & Project Management (CRUD)
- **Full Control**: Create, Read, Update, and Delete both GitLab instances and projects.
- **Data Persistence**: Your configuration is securely stored locally using `tauri-plugin-store`.
- **Smart Cleanup**: Deleting an instance automatically removes its linked projects from both the store and in-memory state.

### Internationalization (i18n)
- **Multi-language**: Seamless support for **English** and **Spanish**.
- **Auto-Detection**: Automatically detects and adapts to your Operating System's language setting upon startup.

## Tech Stack

- **Backend**: Rust (Tauri v2)
  - `reqwest` (blocking, wrapped with `spawn_blocking`) for API communication.
  - `tauri-plugin-store` for persistent configuration.
  - Custom `GitLabClient` for robust API interaction.
- **Frontend**: React 18 + TypeScript
  - `i18next` for translations and language detection.
  - `lucide-react` for tree-shakeable SVG icons.
  - Premium CSS with glassmorphism and GitLab-inspired gradients.
- **State Management**: React Hooks + Tauri Store plugin.

## Getting Started

### Download
Download the latest installer from [GitHub Releases](https://github.com/javirub/gitlab-gui/releases). No additional dependencies required.

### Build from Source

#### Prerequisites
- [Rust](https://www.rust-lang.org/tools/install)
- [Bun](https://bun.sh/)

#### Steps
1. Clone the repository:
   ```bash
   git clone git@github.com:javirub/gitlab-gui.git
   cd gitlab-gui
   ```
2. Install dependencies:
   ```bash
   bun install
   ```
3. Run in development mode:
   ```bash
   bun run tauri dev
   ```

### Authentication Note
For security reasons, this application uses a **Personal Access Token (PAT)** for all GitLab API operations. For full functionality (including CI/CD variables and project management), use a token with `api` scope. If you only intend to use the Package Registry upload feature, a token with the more limited `write_package_registry` scope is sufficient. Standard account passwords are not supported for API operations.

## License
MIT
