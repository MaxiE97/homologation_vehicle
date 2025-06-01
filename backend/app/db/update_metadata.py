# update_metadata.py
from supabase import create_client, Client
from decouple import config

# Si usas un archivo .env para tus claves:
# from decouple import config
# SUPABASE_URL = config("SUPABASE_URL")
# SUPABASE_SERVICE_KEY = config("SUPABASE_SERVICE_KEY")

# Si no, ponlas directamente (SOLO para este script local, no en tu API):
SUPABASE_URL = config("SUPABASE_URL")
SUPABASE_SERVICE_KEY = config("SUPABASE_SERVICE_KEY")

USER_ID_TO_UPDATE = "0270ca36-acf4-456c-8a47-76ca6dc26dfc" # El ID es: 3d7360ca-ec1a-4159-937f-95403e968370
USERNAME_TO_SET = "coc_user" # Elige el username que quieras para maxi

# Crea un cliente admin
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

try:
    # Primero, obtenemos los metadatos existentes para no borrarlos
    get_user_response = supabase_admin.auth.admin.get_user_by_id(USER_ID_TO_UPDATE)

    if not get_user_response.user:
        print(f"Error: No se pudo encontrar el usuario con ID {USER_ID_TO_UPDATE}")
    else:
        current_metadata = get_user_response.user.user_metadata or {}
        print(f"Metadatos actuales: {current_metadata}")

        # Añadimos o actualizamos el username
        current_metadata['username'] = USERNAME_TO_SET

        # Actualizamos los metadatos del usuario
        update_response = supabase_admin.auth.admin.update_user_by_id(
            USER_ID_TO_UPDATE,
            {"user_metadata": current_metadata}
        )

        if update_response.user:
            print(f"\n¡Éxito! Metadatos actualizados para el usuario ID {USER_ID_TO_UPDATE}")
            print(f"Nuevos metadatos: {update_response.user.user_metadata}")
        else:
            print(f"\nError al actualizar metadatos: {update_response.error}")

except Exception as e:
    print(f"Ocurrió un error general: {e}")