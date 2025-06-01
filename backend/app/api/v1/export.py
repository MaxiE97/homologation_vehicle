# backend/app/api/v1/export.py
import logging
import io
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any
from datetime import datetime
#from pydantic import BaseModel
from supabase import Client
from postgrest.exceptions import APIError as PostgrestAPIError 


# Importamos los modelos Pydantic y la dependencia de autenticación
from .schemas import AuthenticatedUser, ExportDataRequest # Quitamos VehicleRow de aquí si no se usa más
from .auth import get_current_user


# CAMBIAMOS LA IMPORTACIÓN AL NUEVO SERVICIO DOCX
from ...services import docx_service # EN LUGAR DE odt_service
from ...db.supabase_client import get_supabase_admin_client

logger = logging.getLogger(__name__)
router = APIRouter()



# Podríamos renombrar el path a /export-docx, pero por ahora mantenemos /export-odt
# y solo cambiamos el tipo de contenido y nombre de archivo.
# O mejor, hagamos uno nuevo para claridad si quieres mantener el de ODT para pruebas.
# Por ahora, modificaré el existente.
@router.post("/export-document", tags=["Export"], response_class=StreamingResponse)
async def export_document_to_docx(
    payload: ExportDataRequest, # <-- CAMBIADO al nuevo modelo
    current_user: AuthenticatedUser = Depends(get_current_user),
    db_admin: Client = Depends(get_supabase_admin_client)
):
    logger.info(f"Solicitud de exportación DOCX para idioma '{payload.language}' por usuario ID: {current_user.id}")

    if not payload.final_data: # <-- CAMBIADO para chequear final_data
        logger.warning(f"Intento de exportación DOCX sin datos en 'final_data' por usuario ID: {current_user.id}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No 'final_data' provided for export.")

    # Convertimos List[KeyValuePair] (modelos Pydantic) a List[Dict[str, Any]]
    # que es lo que espera el docx_service.
    data_for_service = [item.model_dump(by_alias=True) for item in payload.final_data] # <-- CAMBIADO

    try:
        docx_bytes = await docx_service.generate_vehicle_docx(
            data_to_render=data_for_service, # <-- CAMBIADO
            language=payload.language,
            supabase_admin_client=db_admin
        )

        if docx_bytes is None:
            logger.error(f"Fallo al generar DOCX para usuario ID: {current_user.id}, idioma: {payload.language}.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate DOCX document."
            )

        # Persistir información de la descarga
        # exported_data_snapshot ahora es directamente la data_for_service (o payload.final_data en dict)
        download_log_entry = {
            "user_id": str(current_user.id),
            "template_language": payload.language,
            "exported_data_snapshot": data_for_service, # <-- CAMBIADO para guardar los datos simplificados
            # "document_type": "docx" # Si tienes esta columna
        }
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
        current_time_str = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        file_name = f"homologacion_{payload.language.lower()}_{current_time_str}.docx"
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
