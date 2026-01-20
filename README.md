# GitLab GUI

A powerful and intuitive desktop application built with **Tauri**, **Rust**, and **React** to simplify complex or repetitive GitLab tasks. Designed with a premium dark-themed UI and extensible architecture.

## 🚀 Current Capabilities

### 📦 Package Registry Upload
- **Generic Package Support**: Easily upload files to the GitLab Generic Package Registry.
- **Preset Management**: Register your most used projects and select them from a dropdown to skip manual ID entry.
- **Manual Overrides**: Still allows manual entry of Instance URL and Project ID for quick, one-off tasks.

### 🔍 Project Discovery
- **Native Search**: Search for projects directly from your registered GitLab instances without leaving the app.
- **Quick Registration**: Find your repositories by name and add them to your local shortcuts with a single click.

### ⚙️ Instance & Project Management (CRUD)
- **Full Control**: Create, Read, Update, and Delete both GitLab instances and projects.
- **Data Persistence**: Your configuration is securely stored locally using `tauri-plugin-store`.
- **Smart Cleanup**: Deleting an instance automatically handles or warns about orphaned projects.

### 🌍 Internationalization (i18n)
- **Multi-language**: Seamless support for **English** and **Spanish**.
- **Auto-Detection**: Automatically detects and adapts to your Operating System's language setting upon startup.

## 🛠️ Tech Stack

- **Backend**: Rust (Tauri v2)
  - `reqwest` for API communication.
  - `tauri-plugin-store` for persistent configuration.
  - Custom `GitLabClient` for robust API interaction.
- **Frontend**: React + TypeScript
  - `i18next` for translations and language detection.
  - Premium CSS with glassmorphism and GitLab-inspired gradients.
- **State Management**: React Hooks + Tauri Store plugin.

## 🚦 Getting Started

### Prerequisites
- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation) or [bun](https://bun.sh/)

### Installation
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

### 🔐 Authentication Note
For security reasons, this application requires a **Personal Access Token (PAT)** with `api` or `write_package_registry` scopes. Standard account passwords are not supported for API operations.

## 📄 License
MIT
