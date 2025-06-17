# backend/app/api/v1/profile.py

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from postgrest.exceptions import APIError as PostgrestAPIError

# Importamos los modelos y dependencias necesarios
from .schemas import AuthenticatedUser, UserProfileResponse, DownloadHistoryItem
from .auth import get_current_user
from ...db.supabase_client import get_supabase_admin_client

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get(
    "/", 
    response_model=UserProfileResponse, 
    tags=["Profile"],
    summary="Get User Profile and Download History"
)
async def get_user_profile(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db_admin: Client = Depends(get_supabase_admin_client)
):
    """
    Retrieves the profile information for the currently authenticated user,
    including their download history.
    """
    logger.info(f"Fetching profile for user ID: {current_user.id}")

    try:
        # Consultar el historial de descargas para el usuario actual
        downloads_response = db_admin.table("downloads").select(
            "cds_identifier, downloaded_at"
        ).eq(
            "user_id", str(current_user.id)
        ).order(
            "downloaded_at", desc=True
        ).execute()

        if not downloads_response.data:
            logger.info(f"No download history found for user ID: {current_user.id}")
            download_history = []
        else:
            # Mapear los resultados al modelo Pydantic DownloadHistoryItem
            download_history = [
                DownloadHistoryItem(
                    cds_identifier=item.get('cds_identifier', 'N/A'),
                    downloaded_at=item.get('downloaded_at')
                )
                for item in downloads_response.data
            ]

        # Construir la respuesta final del perfil
        user_profile = UserProfileResponse(
            email=current_user.email,
            username=current_user.user_metadata.get('username', 'N/A'),
            downloads=download_history
        )

        return user_profile

    except PostgrestAPIError as e:
        logger.error(f"Database error fetching profile for user ID {current_user.id}: {e.message}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}"
        )
    except Exception as e:
        logger.error(f"Unexpected error fetching profile for user ID {current_user.id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred."
        )