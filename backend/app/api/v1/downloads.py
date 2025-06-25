# backend/app/api/v1/downloads.py

import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from .schemas import StatusUpdateRequest, AuthenticatedUser
from .auth import get_current_user
from ...db.supabase_client import get_supabase_admin_client

logger = logging.getLogger(__name__)
router = APIRouter()

@router.patch(
    "/{download_id}/status",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Downloads"],
    summary="Update the status of a download record"
)
async def update_download_status(
    download_id: uuid.UUID,
    status_update: StatusUpdateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db_admin: Client = Depends(get_supabase_admin_client)
):
    """
    Updates the status of a specific download record.
    A user can only update the status of their own downloads.
    """
    try:
        logger.info(f"User {current_user.id} attempting to update status for download {download_id} to '{status_update.status}'")

        # Actualiza la fila solo si el user_id coincide, por seguridad.
        update_response = db_admin.table("downloads").update(
            {"status": status_update.status}
        ).eq(
            "id", str(download_id)
        ).eq(
            "user_id", str(current_user.id) # ¡MUY IMPORTANTE PARA LA SEGURIDAD!
        ).execute()

        if not update_response.data:
            logger.warning(f"Download {download_id} not found for user {current_user.id} or no change needed.")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Download record not found or you do not have permission to edit it."
            )
        
        logger.info(f"Successfully updated status for download {download_id}")

    except Exception as e:
        logger.error(f"Error updating status for download {download_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while updating status."
        )