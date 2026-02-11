import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            // Navigation
            "actions": "Actions",
            "instances": "Instances",
            "projects": "Projects",
            "env_vars": "Environment Variables",
            "title": "GitLab GUI",

            // Actions view
            "available_actions": "Available Actions",
            "package_upload": "Package Registry Upload",
            "package_upload_desc": "Upload files to GitLab Generic Package Registry.",
            "env_vars_desc": "Manage CI/CD variables for your GitLab projects.",

            // Instances
            "register_instance": "Register GitLab Instance",
            "friendly_name": "Friendly Name",
            "gitlab_url": "GitLab URL",
            "username": "Username",
            "token_password": "Token / Password",
            "register_btn": "Register",
            "registered_instances": "Registered Instances",

            // Projects
            "register_project": "Register GitLab Project",
            "project_id_label": "Project ID (Numeric or Path)",
            "select_instance": "Select Instance",
            "registered_projects": "Registered Projects",
            "search_projects": "Search Projects",
            "search_placeholder": "Search by name...",
            "searching": "Searching...",
            "found_projects": "Found Projects",
            "no_projects_found": "No projects found.",
            "add_selected": "Add Selected",

            // Registry Upload
            "upload_registry_title": "Package Registry Upload",
            "select_project_preset": "Select Project (Presets)",
            "manual_entry_or_select": "Manual Entry or Select Project",
            "instance_manual": "Instance (if manual)",
            "project_id_manual": "Project ID (Manual)",
            "package_name": "Package Name",
            "package_version": "Package Version",
            "click_select_file": "Click to select file to upload",
            "upload_btn": "Upload to Package Registry",
            "back_to_actions": "Back to Actions",
            "uploading": "Uploading...",

            // Common
            "success": "Success",
            "error": "Error",
            "selected": "Selected",
            "edit": "Edit",
            "delete": "Delete",
            "cancel": "Cancel",
            "update_btn": "Update",
            "confirm": "Confirm",
            "are_you_sure": "Are you sure?",
            "confirm_delete_inst": "Deleting an instance will also remove all its linked projects. Continue?",
            "confirm_delete_proj": "Are you sure you want to delete this project?",

            // Environment Variables - View
            "env_vars_title": "Environment Variables",
            "select_project_for_vars": "Select a project to manage its CI/CD variables",
            "loading_variables": "Loading variables...",
            "no_variables": "No variables found for this project.",

            // Environment Variables - Toolbar
            "manual_mode": "Manual",
            "file_mode": "File Import",
            "add_row": "Add Row",
            "paste_clipboard": "Paste from Clipboard",
            "save_changes": "Save Changes",
            "refresh_variables": "Refresh",
            "discard_warning": "You have unsaved changes. Discard them?",

            // Environment Variables - Table Headers
            "var_key": "Key",
            "var_value": "Value",
            "var_type": "Type",
            "var_protected": "Protected",
            "var_masked": "Masked",
            "var_scope": "Scope",
            "var_actions": "Actions",

            // Environment Variables - Row Statuses
            "status_new": "New",
            "status_edited": "Edited",
            "status_existing": "Existing",
            "status_deleted": "Deleted",

            // Environment Variables - Actions
            "undo_edit": "Undo Edit",
            "undo_delete": "Undo Delete",
            "reveal_value": "Reveal Value",
            "hide_value": "Hide Value",

            // Environment Variables - File Import
            "select_env_file": "Select Environment File",
            "file_import_preview": "Import Preview",
            "import_variables": "Import to Table",
            "file_parse_error": "Could not parse the selected file as environment variables.",
            "parsed_count": "{{count}} variables parsed",

            // Environment Variables - Clipboard
            "clipboard_no_data": "No valid environment variable data found in clipboard.",
            "clipboard_imported": "{{count}} variables imported from clipboard.",
            "clipboard_access_denied": "Could not access clipboard. Please check permissions.",

            // Environment Variables - Warnings
            "masked_var_warning": "A masked variable with this key already exists. Saving will overwrite it via delete + recreate.",
            "duplicate_key_warning": "Duplicate key detected in the table.",

            // Environment Variables - Save Results
            "saving_variables": "Saving variables...",
            "save_success": "Variables saved successfully: {{created}} created, {{updated}} updated, {{deleted}} deleted.",
            "save_partial_error": "Some variables failed to save. Check the details below.",
            "var_create_failed": "Failed to create variable '{{key}}': {{error}}",
            "var_update_failed": "Failed to update variable '{{key}}': {{error}}",
            "var_delete_failed": "Failed to delete variable '{{key}}': {{error}}",
            "masked_update_fallback": "Updated masked variable '{{key}}' via delete + recreate."
        }
    },
    es: {
        translation: {
            // Navigation
            "actions": "Acciones",
            "instances": "Instancias",
            "projects": "Proyectos",
            "env_vars": "Variables de Entorno",
            "title": "GitLab GUI",

            // Actions view
            "available_actions": "Acciones Disponibles",
            "package_upload": "Subir al Registro de Paquetes",
            "package_upload_desc": "Sube archivos al Registro de Paquetes Genérico de GitLab.",
            "env_vars_desc": "Gestiona las variables CI/CD de tus proyectos GitLab.",

            // Instances
            "register_instance": "Registrar Instancia de GitLab",
            "friendly_name": "Nombre descriptivo",
            "gitlab_url": "URL de GitLab",
            "username": "Usuario",
            "token_password": "Token / Contraseña",
            "register_btn": "Registrar",
            "registered_instances": "Instancias Registradas",

            // Projects
            "register_project": "Registrar Proyecto de GitLab",
            "project_id_label": "ID del Proyecto (Numérico o Ruta)",
            "select_instance": "Seleccionar Instancia",
            "registered_projects": "Proyectos Registrados",
            "search_projects": "Buscar Proyectos",
            "search_placeholder": "Buscar por nombre...",
            "searching": "Buscando...",
            "found_projects": "Proyectos Encontrados",
            "no_projects_found": "No se encontraron proyectos.",
            "add_selected": "Añadir Seleccionado",

            // Registry Upload
            "upload_registry_title": "Subir al Registro de Paquetes",
            "select_project_preset": "Seleccionar Proyecto (Preajustes)",
            "manual_entry_or_select": "Entrada Manual o Seleccionar Proyecto",
            "instance_manual": "Instancia (si es manual)",
            "project_id_manual": "ID del Proyecto (Manual)",
            "package_name": "Nombre del Paquete",
            "package_version": "Versión del Paquete",
            "click_select_file": "Haz clic para seleccionar el archivo a subir",
            "upload_btn": "Subir al Registro de Paquetes",
            "back_to_actions": "Volver a Acciones",
            "uploading": "Subiendo...",

            // Common
            "success": "Éxito",
            "error": "Error",
            "selected": "Seleccionado",
            "edit": "Editar",
            "delete": "Eliminar",
            "cancel": "Cancelar",
            "update_btn": "Actualizar",
            "confirm": "Confirmar",
            "are_you_sure": "¿Estás seguro?",
            "confirm_delete_inst": "Al eliminar una instancia también se eliminarán todos sus proyectos vinculados. ¿Continuar?",
            "confirm_delete_proj": "¿Estás seguro de que quieres eliminar este proyecto?",

            // Environment Variables - View
            "env_vars_title": "Variables de Entorno",
            "select_project_for_vars": "Selecciona un proyecto para gestionar sus variables CI/CD",
            "loading_variables": "Cargando variables...",
            "no_variables": "No se encontraron variables para este proyecto.",

            // Environment Variables - Toolbar
            "manual_mode": "Manual",
            "file_mode": "Importar Archivo",
            "add_row": "Añadir Fila",
            "paste_clipboard": "Pegar del Portapapeles",
            "save_changes": "Guardar Cambios",
            "refresh_variables": "Refrescar",
            "discard_warning": "Tienes cambios sin guardar. ¿Descartarlos?",

            // Environment Variables - Table Headers
            "var_key": "Clave",
            "var_value": "Valor",
            "var_type": "Tipo",
            "var_protected": "Protegida",
            "var_masked": "Enmascarada",
            "var_scope": "Ámbito",
            "var_actions": "Acciones",

            // Environment Variables - Row Statuses
            "status_new": "Nueva",
            "status_edited": "Editada",
            "status_existing": "Existente",
            "status_deleted": "Eliminada",

            // Environment Variables - Actions
            "undo_edit": "Deshacer Edición",
            "undo_delete": "Deshacer Eliminación",
            "reveal_value": "Mostrar Valor",
            "hide_value": "Ocultar Valor",

            // Environment Variables - File Import
            "select_env_file": "Seleccionar Archivo de Variables",
            "file_import_preview": "Vista Previa de Importación",
            "import_variables": "Importar a la Tabla",
            "file_parse_error": "No se pudo interpretar el archivo seleccionado como variables de entorno.",
            "parsed_count": "{{count}} variables interpretadas",

            // Environment Variables - Clipboard
            "clipboard_no_data": "No se encontraron datos válidos de variables de entorno en el portapapeles.",
            "clipboard_imported": "{{count}} variables importadas del portapapeles.",
            "clipboard_access_denied": "No se pudo acceder al portapapeles. Verifica los permisos.",

            // Environment Variables - Warnings
            "masked_var_warning": "Ya existe una variable enmascarada con esta clave. Al guardar se sobreescribirá mediante eliminar + recrear.",
            "duplicate_key_warning": "Se detectó una clave duplicada en la tabla.",

            // Environment Variables - Save Results
            "saving_variables": "Guardando variables...",
            "save_success": "Variables guardadas: {{created}} creadas, {{updated}} actualizadas, {{deleted}} eliminadas.",
            "save_partial_error": "Algunas variables no se pudieron guardar. Revisa los detalles.",
            "var_create_failed": "Error al crear la variable '{{key}}': {{error}}",
            "var_update_failed": "Error al actualizar la variable '{{key}}': {{error}}",
            "var_delete_failed": "Error al eliminar la variable '{{key}}': {{error}}",
            "masked_update_fallback": "Variable enmascarada '{{key}}' actualizada mediante eliminar + recrear."
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        }
    });

export default i18n;
