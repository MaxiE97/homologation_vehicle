# backend/app/db/supabase_client.py
from supabase import create_client, Client
from decouple import config

# Carga las variables desde .env
SUPABASE_URL = config("SUPABASE_URL")
SUPABASE_ANON_KEY = config("SUPABASE_ANON_KEY") # <-- Clave pública para operaciones de usuario
SUPABASE_SERVICE_KEY = config("SUPABASE_SERVICE_KEY") # <-- Clave de servicio para operaciones admin

def get_supabase_client() -> Client:
    """
    Retorna un cliente Supabase configurado con la ANON_KEY.
    Usado para operaciones estándar de autenticación del lado del cliente/usuario.
    """
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

def get_supabase_admin_client() -> Client:
    """
    Retorna un cliente Supabase configurado con la SERVICE_KEY.
    Usado para operaciones de backend que requieren privilegios de administrador.
    """
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

