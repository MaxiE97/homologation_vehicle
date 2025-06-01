# backend/app/api/v1/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from postgrest.exceptions import APIError as PostgrestAPIError 
from typing import Optional
import logging 

# Importamos los modelos y los clientes Supabase
from .schemas import UserLogin, TokenResponse, AuthenticatedUser
from ...db.supabase_client import get_supabase_client, get_supabase_admin_client

# Configuramos un logger para este módulo
logger = logging.getLogger(__name__) 

router = APIRouter()
bearer_scheme = HTTPBearer()

@router.post("/login", response_model=TokenResponse)
async def login_for_access_token(
    form_data: UserLogin,
    admin_db: Client = Depends(get_supabase_admin_client),
    auth_db: Client = Depends(get_supabase_client)
):
    logger.info(f"Intento de login para username: {form_data.username}") # <--- INFO: Inicio de intento de login
    user_email = None
    try:
        # 1. Buscar el email asociado al username usando admin.list_users()
        users_list_from_supabase = admin_db.auth.admin.list_users() # Síncrono

        found_user_object = None
        # El siguiente bloque de debug sobre el tipo de users_list_from_supabase
        # podría ser un logger.debug si se quiere mantener, o eliminarse.
        # logger.debug(f"Tipo de users_list_from_supabase: {type(users_list_from_supabase)}")

        if isinstance(users_list_from_supabase, list):
            for user_in_list in users_list_from_supabase:
                if hasattr(user_in_list, 'user_metadata') and user_in_list.user_metadata and \
                   user_in_list.user_metadata.get("username") == form_data.username:
                    found_user_object = user_in_list
                    break
        elif hasattr(users_list_from_supabase, 'users') and users_list_from_supabase.users is not None:
            logger.warning("list_users() devolvió un objeto con atributo .users, iterando sobre él.") # <--- WARNING: Comportamiento inesperado
            for user_in_list in users_list_from_supabase.users:
                 if hasattr(user_in_list, 'user_metadata') and user_in_list.user_metadata and \
                   user_in_list.user_metadata.get("username") == form_data.username:
                    found_user_object = user_in_list
                    break
        else:
            logger.error(f"Respuesta inesperada o vacía de list_users(): {users_list_from_supabase}") # <--- ERROR: Fallo en obtener usuarios

        if not found_user_object:
            logger.warning(f"Login fallido: Username '{form_data.username}' no encontrado.") # <--- WARNING: Username no encontrado
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
            )

        if not hasattr(found_user_object, 'email') or not found_user_object.email:
            logger.error(f"Error de datos: Objeto usuario encontrado para '{form_data.username}' no tiene email. Objeto: {found_user_object}") # <--- ERROR: Inconsistencia de datos
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User record incomplete (missing email attribute)",
            )
        user_email = found_user_object.email
        
        logger.info(f"Email encontrado para {form_data.username}: {user_email}") # <--- INFO: Email encontrado

        # 2. Intentar iniciar sesión con el email encontrado y la contraseña
        auth_response = auth_db.auth.sign_in_with_password({ # Síncrono
            "email": user_email,
            "password": form_data.password
        })

        if auth_response.session and auth_response.session.access_token:
            logger.info(f"Login exitoso para username: {form_data.username}, user_id: {auth_response.user.id if auth_response.user else 'N/A'}") # <--- INFO: Login exitoso
            return TokenResponse(access_token=auth_response.session.access_token)
        else:
            # Este caso es menos probable si sign_in_with_password no lanza una excepción antes,
            # pero se mantiene por si la librería cambia o hay un caso borde.
            logger.warning(f"Login fallido para {form_data.username} (email: {user_email}): sign_in_with_password no devolvió sesión/token pero no lanzó excepción.") # <--- WARNING
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

    except PostgrestAPIError as e:
        logger.error(f"Error de base de datos (Postgrest) durante login para {form_data.username}: {e.message}", exc_info=True) # <--- ERROR: exc_info=True añade traceback
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}",
        )
    except Exception as e:
        error_message = str(e)
        # Logueamos el error real para nosotros, pero no lo exponemos directamente al usuario.
        logger.error(f"Excepción no manejada durante login para {form_data.username} (email: {user_email}): {error_message} (Tipo: {type(e)})", exc_info=True) # <--- ERROR
        
        auth_failure_indicators = ["invalid login credentials", "invalid grant", "user not found", "email not confirmed"]
        is_auth_failure = any(indicator in error_message.lower() for indicator in auth_failure_indicators)

        if is_auth_failure or "invalid_grant" in error_message:
            # No es necesario loguear de nuevo como error, ya que es un fallo de autenticación esperado.
            # Se podría usar logger.info o logger.warning si se quiere registrar el intento fallido.
            # logger.warning(f"Intento de login fallido (credenciales) para {form_data.username}: {error_message}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Si no es un error de autenticación conocido, es un error del servidor
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during login.", # Mensaje genérico para el cliente
        )

async def get_current_user(
    auth_credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Client = Depends(get_supabase_client)
) -> AuthenticatedUser:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = auth_credentials.credentials
    try:
        user_response = db.auth.get_user(token) # Síncrono

        if user_response.user:
            user_data = user_response.user
            # No es necesario loguear aquí en cada petición exitosa,
            # el log en el endpoint protegido es suficiente.
            return AuthenticatedUser(
                id=user_data.id,
                aud=user_data.aud,
                role=user_data.role,
                email=user_data.email,
                user_metadata=user_data.user_metadata or {},
                created_at=user_data.created_at
            )
        # Si user_response.user es None, es un token inválido.
        logger.warning(f"Validación de token fallida: get_user no devolvió un usuario. Token (primeros/últimos chars): {token[:10]}...{token[-10:] if len(token)>20 else ''}") # <--- WARNING
        raise credentials_exception
    except Exception as e: # Captura cualquier error de get_user (token malformado, error de red, etc.)
        error_message = str(e)
        logger.error(f"Error durante validación de token (get_user): {error_message} (Tipo: {type(e)}). Token (primeros/últimos chars): {token[:10]}...{token[-10:] if len(token)>20 else ''}", exc_info=True) # <--- ERROR
        
        token_failure_indicators = ["invalid token", "jwt expired", "invalid jwt", "tokenisinvalid", "invalid signature"]
        is_token_failure = any(indicator in error_message.lower().replace(" ", "") for indicator in token_failure_indicators)

        if is_token_failure:
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        # Si el error no es uno de los indicadores de token conocidos,
        # podría ser un problema de red o algo inesperado.
        raise 
    
    
@router.get("/users/me", response_model=AuthenticatedUser, tags=["Authentication"])
async def read_users_me(current_user: AuthenticatedUser = Depends(get_current_user)):
    """
    Devuelve la información del usuario actualmente autenticado.
    """
    # current_user ya es un objeto AuthenticatedUser gracias a la dependencia
    logger.info(f"Solicitud de /users/me para usuario ID: {current_user.id}")
    return current_user