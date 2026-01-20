import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "actions": "Actions",
            "instances": "Instances",
            "projects": "Projects",
            "title": "GitLab GUI",
            "available_actions": "Available Actions",
            "package_upload": "Package Registry Upload",
            "package_upload_desc": "Upload files to GitLab Generic Package Registry.",
            "register_instance": "Register GitLab Instance",
            "friendly_name": "Friendly Name",
            "gitlab_url": "GitLab URL",
            "username": "Username",
            "token_password": "Token / Password",
            "register_btn": "Register",
            "registered_instances": "Registered Instances",
            "register_project": "Register GitLab Project",
            "project_id_label": "Project ID (Numeric or Path)",
            "select_instance": "Select Instance",
            "registered_projects": "Registered Projects",
            "search_projects": "Search Projects",
            "search_placeholder": "Search by name...",
            "found_projects": "Found Projects",
            "no_projects_found": "No projects found.",
            "add_selected": "Add Selected",
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
            "success": "Success",
            "error": "Error",
            "selected": "Selected",
            "edit": "Edit",
            "delete": "Delete",
            "cancel": "Cancel",
            "update_btn": "Update",
            "confirm_delete_inst": "Deleting an instance will also remove all its linked projects. Continue?",
            "confirm_delete_proj": "Are you sure you want to delete this project?"
        }
    },
    es: {
        translation: {
            "actions": "Acciones",
            "instances": "Instancias",
            "projects": "Proyectos",
            "title": "GitLab GUI",
            "available_actions": "Acciones Disponibles",
            "package_upload": "Subir al Registro de Paquetes",
            "package_upload_desc": "Sube archivos al Registro de Paquetes Genérico de GitLab.",
            "register_instance": "Registrar Instancia de GitLab",
            "friendly_name": "Nombre descriptivo",
            "gitlab_url": "URL de GitLab",
            "username": "Usuario",
            "token_password": "Token / Contraseña",
            "register_btn": "Registrar",
            "registered_instances": "Instancias Registradas",
            "register_project": "Registrar Proyecto de GitLab",
            "project_id_label": "ID del Proyecto (Numérico o Ruta)",
            "select_instance": "Seleccionar Instancia",
            "registered_projects": "Proyectos Registrados",
            "search_projects": "Buscar Proyectos",
            "search_placeholder": "Buscar por nombre...",
            "found_projects": "Proyectos Encontrados",
            "no_projects_found": "No se encontraron proyectos.",
            "add_selected": "Añadir Seleccionado",
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
            "success": "Éxito",
            "error": "Error",
            "selected": "Seleccionado",
            "edit": "Editar",
            "delete": "Eliminar",
            "cancel": "Cancelar",
            "update_btn": "Actualizar",
            "confirm_delete_inst": "Al eliminar una instancia también se eliminarán todos sus proyectos vinculados. ¿Continuar?",
            "confirm_delete_proj": "¿Estás seguro de que quieres eliminar este proyecto?"
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
