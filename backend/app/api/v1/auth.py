# backend/app/api/v1/auth.py

# --- INICIO DEL CÓDIGO CORREGIDO ---
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from gotrue.errors import AuthApiError
from typing import Optional
import logging

# Importamos los modelos y los clientes Supabase
from .schemas import UserLogin, TokenResponse, AuthenticatedUser
from ...db.supabase_client import get_supabase_client, get_supabase_admin_client

# Configuramos un logger para este módulo
logger = logging.getLogger(__name__)

router = APIRouter()
bearer_scheme = HTTPBearer()

@router.post("/login", response_model=TokenResponse, tags=["Authentication"])
async def login_for_access_token(
    form_data: UserLogin,
    admin_db: Client = Depends(get_supabase_admin_client)
):
    """
    Autentica a un usuario usando username y password.
    Este método es seguro, escalable y eficiente.
    """
    logger.info(f"Intento de login para username: {form_data.username}")
    user_id = None # Inicializamos user_id para logging en caso de error

    try:
        # --- LÓGICA DE LOGIN CORREGIDA (3 PASOS) ---

        # PASO 1: Buscar el perfil en 'profiles' para obtener el ID y rol del usuario.
        logger.debug(f"Paso 1: Consultando 'profiles' para el username: {form_data.username}")
        profile_response = admin_db.table('profiles').select('id, user_role').eq('username', form_data.username).single().execute()

        if not profile_response.data:
            logger.warning(f"Login fallido: No se encontró perfil para el username '{form_data.username}'.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_id = profile_response.data['id']
        user_role = profile_response.data.get('user_role')
        logger.info(f"Paso 1 Exitoso: Perfil encontrado para '{form_data.username}'. User ID: {user_id}, Role: {user_role}")

        # PASO 2: Usar el ID para obtener los datos del usuario (incluido el email y metadatos) desde Supabase Auth.
        logger.debug(f"Paso 2: Obteniendo datos del usuario desde Auth con ID: {user_id}")
        user_auth_response = admin_db.auth.admin.get_user_by_id(user_id)
        
        if not user_auth_response or not user_auth_response.user:
            # Esto sería un error de inconsistencia de datos muy raro.
            logger.error(f"Error crítico de datos: Se encontró perfil para {user_id} pero no existe en Supabase Auth.")
            raise HTTPException(status_code=500, detail="User data inconsistency.")

        user_email = user_auth_response.user.email
        current_metadata = user_auth_response.user.user_metadata or {}
        
        # Sincronizar el rol desde la tabla 'profiles' a los metadatos de 'auth.users'
        if user_role and current_metadata.get('role') != user_role:
            current_metadata['role'] = user_role
            admin_db.auth.admin.update_user_by_id(user_id, {"user_metadata": current_metadata})
            logger.info(f"Rol del usuario {user_id} sincronizado a '{user_role}' en los metadatos de Auth.")

        logger.info(f"Paso 2 Exitoso: Email encontrado: {user_email}")

        # PASO 3: Intentar iniciar sesión con el email y la contraseña.
        auth_response = admin_db.auth.sign_in_with_password({
            "email": user_email,
            "password": form_data.password
        })

        if auth_response.session and auth_response.session.access_token:
            logger.info(f"Login exitoso para username: {form_data.username}, user_id: {user_id}")
            return TokenResponse(access_token=auth_response.session.access_token)
        else:
            logger.error(f"Login fallido para {form_data.username}: sign_in_with_password no devolvió sesión/token.")
            raise HTTPException(status_code=401, detail="Incorrect username or password")

    except AuthApiError as e:
        logger.warning(f"Fallo de autenticación de Supabase para {form_data.username} (User ID: {user_id}): {e.message}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.exception(f"Excepción no manejada durante login para {form_data.username}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during login.",
        )


async def get_current_user(
    auth_credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Client = Depends(get_supabase_client)
) -> AuthenticatedUser:
    """
    Valida el token JWT y devuelve los datos del usuario autenticado.
    Esta función no necesita cambios, su lógica es correcta.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = auth_credentials.credentials
    try:
        user_response = db.auth.get_user(token)

        if user_response.user:
            user_data = user_response.user
            return AuthenticatedUser(
                id=user_data.id,
                aud=user_data.aud,
                role=user_data.role,
                email=user_data.email,
                user_metadata=user_data.user_metadata or {},
                created_at=user_data.created_at
            )

        logger.warning(f"Validación de token fallida: get_user no devolvió un usuario.")
        raise credentials_exception

    except Exception as e:
        logger.error(f"Error durante validación de token (get_user): {e}", exc_info=True)
        error_message = str(e).lower().replace(" ", "")
        token_failure_indicators = ["invalidtoken", "jwtexpired", "invalidjwt", "tokenisinvalid", "invalidsignature"]
        is_token_failure = any(indicator in error_message for indicator in token_failure_indicators)

        if is_token_failure:
             raise HTTPException(
                 status_code=status.HTTP_401_UNAUTHORIZED,
                 detail="Invalid or expired token",
                 headers={"WWW-Authenticate": "Bearer"},
             )
        raise credentials_exception


@router.get("/users/me", response_model=AuthenticatedUser, tags=["Authentication"])
async def read_users_me(current_user: AuthenticatedUser = Depends(get_current_user)):
    """
    Devuelve la información del usuario actualmente autenticado.
    Esta función no necesita cambios.
    """
    logger.info(f"Solicitud de /users/me para usuario ID: {current_user.id}")
    return current_user
# --- FIN DEL CÓDIGO CORREGIDO ---