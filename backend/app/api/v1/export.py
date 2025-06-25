# backend/app/api/v1/export.py

import logging
import io
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any
from datetime import datetime
from supabase import Client
from postgrest.exceptions import APIError as PostgrestAPIError 

from .schemas import AuthenticatedUser, ExportDataRequest
from .auth import get_current_user
from ...services import docx_service
from ...db.supabase_client import get_supabase_admin_client

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/export-document", tags=["Export"], response_class=StreamingResponse)
async def export_document_to_docx(
    payload: ExportDataRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db_admin: Client = Depends(get_supabase_admin_client)
):
    logger.info(f"Solicitud de exportación DOCX para idioma '{payload.language}' por usuario ID: {current_user.id}")

    if not payload.final_data:
        logger.warning(f"Intento de exportación DOCX sin datos en 'final_data' por usuario ID: {current_user.id}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No 'final_data' provided for export.")

    data_for_service = [item.model_dump(by_alias=True) for item in payload.final_data]

    try:
        docx_bytes = await docx_service.generate_vehicle_docx(
            data_to_render=data_for_service,
            language=payload.language,
            supabase_admin_client=db_admin
        )

        if docx_bytes is None:
            logger.error(f"Fallo al generar DOCX para usuario ID: {current_user.id}, idioma: {payload.language}.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate DOCX document."
            )

        # --- INICIO DE MODIFICACIÓN ---

        # 1. Convertimos la lista de datos a un diccionario para buscar fácilmente el 'CdS'
        flat_data_dict = {item["Key"]: item["Valor Final"] for item in data_for_service}
        
        # 2. Obtenemos el valor del identificador 'CdS'
        cds_identifier_value = flat_data_dict.get("CdS", "N/A")

        # 3. Persistir información de la descarga, incluyendo el nuevo campo
        download_log_entry = {
            "user_id": str(current_user.id),
            "template_language": payload.language,
            "exported_data_snapshot": data_for_service,
            "cds_identifier": cds_identifier_value,
            "status": "Ok"
        }
        
        # --- FIN DE MODIFICACIÓN ---

        try:
            logger.debug(f"Intentando insertar en tabla 'downloads': {download_log_entry}")
            insert_response = db_admin.table("downloads").insert(download_log_entry).execute()
            if insert_response.data:
                download_id = insert_response.data[0].get('id', 'N/A') if insert_response.data[0] else 'N/A'
                logger.info(f"Registro de descarga (DOCX) guardado. ID: {download_id}")
            else:
                error_info = getattr(insert_response, 'error', None)
                if error_info: logger.error(f"Error guardando descarga (DOCX). Error: {error_info}")
                else: logger.warning(f"Confirmación de guardado de descarga (DOCX) vacía.")
        except PostgrestAPIError as e_db:
            logger.error(f"Error DB (Postgrest) guardando descarga (DOCX): {e_db.message}", exc_info=True)
        except Exception as e_db_generic:
            logger.error(f"Error genérico guardando descarga (DOCX): {e_db_generic}", exc_info=True)

        file_stream = io.BytesIO(docx_bytes)
        
        # --- MODIFICACIÓN: Nombre de archivo mejorado ---
        file_name = f"homologacion_{cds_identifier_value.replace(' ', '_')}.docx"
        
        headers = {'Content-Disposition': f'attachment; filename="{file_name}"'}
        
        logger.info(f"Enviando archivo DOCX '{file_name}' ({len(docx_bytes)} bytes) al usuario ID: {current_user.id}")
        return StreamingResponse(
            file_stream,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
            headers=headers
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error inesperado durante la exportación a DOCX: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during DOCX export."
        )