# app/db/update_metadata.py (Versión Mejorada)

from supabase import create_client, Client
from decouple import config
import logging

# Configuración básica para ver mejor los mensajes
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- CONFIGURACIÓN ---
# Carga tus variables de entorno de forma segura
SUPABASE_URL = config("SUPABASE_URL")
SUPABASE_SERVICE_KEY = config("SUPABASE_SERVICE_KEY")

# --- DATOS DEL USUARIO A ACTUALIZAR ---
# Cambia estos valores cada vez que ejecutes el script para un nuevo usuario
USER_ID_TO_UPDATE = "0270ca36-acf4-456c-8a47-76ca6dc26dfc" # <-- Pega aquí el ID del nuevo usuario
USERNAME_TO_SET = "coc_user" # <-- Elige el username para este usuario

# --- EJECUCIÓN DEL SCRIPT ---
logging.info("Iniciando script para actualizar usuario y crear perfil...")
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

try:
    # --- PASO 1: ACTUALIZAR LOS METADATOS DEL USUARIO (Tu lógica original) ---
    logging.info(f"Intentando actualizar metadatos para el usuario ID: {USER_ID_TO_UPDATE}")
    
    get_user_response = supabase_admin.auth.admin.get_user_by_id(USER_ID_TO_UPDATE)

    if not get_user_response.user:
        logging.error(f"Error: No se pudo encontrar el usuario con ID {USER_ID_TO_UPDATE}")
    else:
        current_metadata = get_user_response.user.user_metadata or {}
        current_metadata['username'] = USERNAME_TO_SET

        # Actualizamos los metadatos del usuario en Supabase Auth
        update_response = supabase_admin.auth.admin.update_user_by_id(
            USER_ID_TO_UPDATE,
            {"user_metadata": current_metadata}
        )

        if update_response.user:
            logging.info("¡Éxito! Metadatos actualizados en 'auth.users'.")
            logging.info(f"Nuevos metadatos: {update_response.user.user_metadata}")

            # --- PASO 2: CREAR O ACTUALIZAR EL PERFIL PÚBLICO (Nueva lógica) ---
            logging.info("Procediendo a crear/actualizar el registro en la tabla 'profiles'.")
            
            # Usamos 'upsert' para que el script funcione tanto si el perfil no existe (lo crea)
            # como si ya existe y solo queremos asegurarnos de que el username está correcto (lo actualiza).
            profile_data_to_sync = {
                'id': USER_ID_TO_UPDATE,       # Vincula con el usuario de auth
                'username': USERNAME_TO_SET   # Establece el username para el login
                # La columna 'user_role' usará su valor por defecto ('trial') la primera vez.
            }
            
            profile_response = supabase_admin.table('profiles').upsert(profile_data_to_sync).execute()
            
            # La respuesta de upsert puede variar, pero si no hay error, todo está bien.
            if profile_response.data:
                 logging.info("¡Éxito! Perfil en 'public.profiles' creado/actualizado correctamente.")
                 logging.info(f"Datos del perfil sincronizado: {profile_response.data[0]}")
            else:
                 # PostgREST a veces devuelve data vacía en upsert exitoso si no se especifica 'returning=representation'.
                 # Si no hay un error explícito, asumimos que funcionó.
                 logging.info("Operación de 'upsert' en 'profiles' completada sin errores.")

        else:
            logging.error(f"Error al actualizar metadatos en 'auth.users': {getattr(update_response, 'error', 'Error desconocido')}")

except Exception as e:
    logging.exception(f"Ocurrió un error general durante la ejecución del script.")