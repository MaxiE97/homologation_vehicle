# app/db/change_user_role.py

from supabase import create_client, Client
from decouple import config
import logging

# Configuración del logging para ver los mensajes de forma clara
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- CONFIGURACIÓN ---
# Carga tus variables de entorno de forma segura
SUPABASE_URL = config("SUPABASE_URL")
SUPABASE_SERVICE_KEY = config("SUPABASE_SERVICE_KEY")

# --- DATOS A MODIFICAR ---
# Elige el username del usuario cuyo rol quieres cambiar
USERNAME_TO_CHANGE = "coc_user"
# Elige el nuevo rol que quieres asignarle
NEW_ROLE = "premium" # Puedes usar "premium", "admin", "pro", etc.

# --- EJECUCIÓN DEL SCRIPT ---
logging.info(f"Iniciando script para cambiar el rol del usuario '{USERNAME_TO_CHANGE}' a '{NEW_ROLE}'.")
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

try:
    # 1. Buscar el perfil del usuario para confirmar que existe
    logging.info(f"Buscando el perfil del usuario '{USERNAME_TO_CHANGE}'...")
    profile_response = supabase_admin.table('profiles').select('id', 'user_role').eq('username', USERNAME_TO_CHANGE).single().execute()

    if not profile_response.data:
        logging.error(f"Error: No se pudo encontrar un perfil para el username '{USERNAME_TO_CHANGE}'.")
    else:
        profile = profile_response.data
        user_id = profile['id']
        current_role = profile['user_role']
        logging.info(f"Perfil encontrado. User ID: {user_id}, Rol actual: '{current_role}'.")

        # 2. Actualizar el rol del usuario
        if current_role == NEW_ROLE:
            logging.warning(f"El usuario ya tiene el rol '{NEW_ROLE}'. No se necesita ninguna acción.")
        else:
            logging.info(f"Actualizando rol a '{NEW_ROLE}'...")
            update_response = supabase_admin.table('profiles').update({'user_role': NEW_ROLE}).eq('id', user_id).execute()
            
            if update_response.data:
                logging.info("¡Éxito! El rol del usuario ha sido actualizado correctamente.")
                logging.info(f"Nuevos datos del perfil: {update_response.data[0]}")
            else:
                logging.error(f"Ocurrió un error al intentar actualizar el rol.")

except Exception as e:
    logging.exception("Ocurrió un error general durante la ejecución del script.")