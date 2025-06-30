# backend/app/api/v1/export.py

# --- INICIO DEL CÓDIGO COMPLETO Y REFACTORIZADO ---
import logging
import io
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
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
    user_id = current_user.id
    logger.info(f"Solicitud de exportación DOCX para idioma '{payload.language}' por usuario ID: {user_id}")

    if not payload.final_data:
        logger.warning(f"Intento de exportación DOCX sin datos por usuario ID: {user_id}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No 'final_data' provided for export.")

    try:
        # ==============================================================================
        # --- INICIO DE LA NUEVA LÓGICA DE VERIFICACIÓN DE PERMISOS ---
        # ==============================================================================

        # 1. Obtener el ROL del usuario desde la tabla 'profiles'.
        logger.debug(f"Verificando perfil y rol para el usuario ID: {user_id}")
        profile_response = db_admin.table('profiles').select('user_role').eq('id', user_id).single().execute()

        if not profile_response.data:
            logger.error(f"¡Crítico! No se pudo encontrar un perfil para el usuario autenticado con ID: {user_id}")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found.")

        user_role = profile_response.data.get('user_role')
        logger.info(f"Usuario {user_id} tiene el rol: '{user_role}'.")

        # 2. Si el rol es 'trial', verificar el límite de descargas.
        if user_role == 'trial':
            logger.info(f"Rol 'trial' detectado. Verificando el contador de descargas para el usuario {user_id}.")
            # Contamos las filas en la tabla 'downloads' para este usuario.
            # 'count='exact'' es muy eficiente, solo devuelve el número, no los datos.
            count_response = db_admin.table('downloads').select('id', count='exact').eq('user_id', user_id).execute()

            download_count = count_response.count
            logger.info(f"El usuario {user_id} tiene {download_count} descargas registradas.")

            # Límite estricto de 20 descargas.
            if download_count is not None and download_count >= 20:
                logger.warning(f"Límite de descargas alcanzado para el usuario 'trial' {user_id}. Descarga denegada.")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN, # 403 Forbidden es el código correcto para permisos insuficientes.
                    detail="Download limit reached for trial users. Please contact the administrator."
                )

        # Si el rol no es 'trial' o si es 'trial' pero no ha alcanzado el límite, el código continúa.
        logger.info(f"Verificación de permisos superada para el usuario {user_id}.")

        # ==============================================================================
        # --- FIN DE LA LÓGICA DE VERIFICACIÓN. INICIO DE LA LÓGICA DE GENERACIÓN. ---
        # ==============================================================================

        data_for_service = [item.model_dump(by_alias=True) for item in payload.final_data]

        # 3. Generar el documento DOCX (lógica existente).
        docx_bytes = await docx_service.generate_vehicle_docx(
            data_to_render=data_for_service,
            language=payload.language,
            supabase_admin_client=db_admin
        )

        if docx_bytes is None:
            logger.error(f"Fallo al generar DOCX para usuario ID: {user_id}, idioma: {payload.language}.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate DOCX document."
            )

        # 4. Registrar la nueva descarga en la base de datos (lógica existente).
        flat_data_dict = {item["Key"]: item["Valor Final"] for item in data_for_service}
        cds_identifier_value = flat_data_dict.get("CdS", "N/A")

        download_log_entry = {
            "user_id": str(user_id),
            "template_language": payload.language,
            "exported_data_snapshot": data_for_service,
            "cds_identifier": cds_identifier_value,
            "status": "Ok"
        }

        try:
            db_admin.table("downloads").insert(download_log_entry).execute()
            logger.info(f"Registro de descarga (DOCX) guardado para el usuario {user_id}.")
        except Exception as db_error:
            # Si falla el registro, no detenemos la descarga, pero es importante saberlo.
            logger.error(f"Error guardando el registro de descarga para el usuario {user_id}: {db_error}", exc_info=True)

        # 5. Preparar y enviar la respuesta con el archivo (lógica existente).
        file_stream = io.BytesIO(docx_bytes)
        file_name = f"homologacion_{cds_identifier_value.replace(' ', '_')}.docx"
        headers = {'Content-Disposition': f'attachment; filename="{file_name}"'}

        logger.info(f"Enviando archivo DOCX '{file_name}' ({len(docx_bytes)} bytes) al usuario {user_id}")
        return StreamingResponse(
            file_stream,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers=headers
        )

    except HTTPException:
        # Re-lanzar las excepciones HTTP (como la 403) para que FastAPI las maneje.
        raise
    except Exception as e:
        logger.exception(f"Error inesperado durante la exportación a DOCX para el usuario {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during DOCX export."
        )

# --- FIN DEL CÓDIGO COMPLETO Y REFACTORIZADO ---