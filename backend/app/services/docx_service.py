# backend/app/services/docx_service.py
import logging
import io
from typing import Dict, Optional, List, Any
from supabase import Client
from docxtpl import DocxTemplate

logger = logging.getLogger(__name__)

# Importamos el mapeo desde el archivo marcadores_map.py
# Asumiendo que marcadores_map.py está en el mismo directorio 'services'
try:
    from .marcadores_map import KEY_TO_JINJA_VARIABLE_MAP
except ImportError:
    logger.error("CRÍTICO: No se pudo importar KEY_TO_JINJA_VARIABLE_MAP desde .marcadores_map.")
    KEY_TO_JINJA_VARIABLE_MAP: Dict[str, str] = {}


async def generate_vehicle_docx(
    data_to_render: List[Dict[str, Any]], # Lista de {"Key": ..., "Valor Final": ...}
    language: str,
    supabase_admin_client: Client
) -> Optional[bytes]:
    """
    Genera un documento DOCX, descargando la plantilla desde Supabase Storage
    y usando docxtpl con Jinja2 para el reemplazo. Incluye lógica especial
    para formatear la sección 'Remarks'.
    """
    BUCKET_NAME = "plantillas-docx"

    LANGUAGE_TO_FILENAME_MAP = {
        "en": "planillaIngles.docx",
        "de": "planillaAleman.docx",
        "pt": "planillaPortugues.docx",
        "it": "planillaItaliano.docx",
        "fr": "planillaFrances.docx",
        "nl": "planillaHolandes.docx",
        "sv": "planillaSueco.docx",
        "ro": "planillaRumania.docx",
        "pl": "planillaPolaco.docx",
        "cs": "planillaCheco.docx",


    }
    normalized_language = language.lower()

    if normalized_language not in LANGUAGE_TO_FILENAME_MAP:
        logger.error(f"Idioma '{language}' no tiene una plantilla DOCX mapeada.")
        return None
    
    template_file_name_in_bucket = LANGUAGE_TO_FILENAME_MAP[normalized_language]
    logger.info(f"Intentando descargar plantilla DOCX: '{template_file_name_in_bucket}' del bucket '{BUCKET_NAME}'")

    docx_template_bytes: Optional[bytes] = None
    try:
        response_bytes = supabase_admin_client.storage.from_(BUCKET_NAME).download(template_file_name_in_bucket)
        if response_bytes:
            docx_template_bytes = response_bytes
            logger.info(f"Plantilla DOCX '{template_file_name_in_bucket}' descargada.")
        else:
            logger.error(f"La descarga de la plantilla DOCX devolvió None o vacío.")
            return None
    except Exception as e:
        logger.error(f"Error descargando plantilla DOCX: {e}", exc_info=True)
        return None

    # --- Preparación del Contexto Jinja2 ---
    context = {}
    
    # 1. Procesar todos los datos de entrada para los marcadores estándar (Bxx, etc.)
    final_values_map = {item.get("Key"): str(item.get("Valor Final", "")) for item in data_to_render}
    
    for data_key, jinja_var_name in KEY_TO_JINJA_VARIABLE_MAP.items():
        # Si la key existe en los datos, usar su valor; si no, dejar que Jinja2 lo reemplace por vacío.
        if data_key in final_values_map:
            context[jinja_var_name] = final_values_map[data_key]

    # --- INICIO: LÓGICA ESPECIAL PARA LA SECCIÓN 'REMARKS' ---
    logger.info("Procesando lógica especial para la sección 'Remarks'.")
    
    # Define la estructura de las "Remarks": La "Key" de tus datos y la etiqueta
    remarks_definitions = [
        {"key": "remarks_6_1", "label": "Zu* 6.1.:"},
        {"key": "remarks_7_1", "label": "Zu* 7.1.:"},
        {"key": "remarks_8", "label": "Zu* 8.:"},
        {"key": "remarks_11", "label": "Zu* 11.:"},
    ]
    # Nombres de las variables Jinja2 para las 4 líneas de remarks en la plantilla
    remark_jinja_vars = ["A16", "A17", "A18", "A19"]

    # Filtra y formatea solo las "remarks" que tienen un dato válido
    valid_formatted_remarks = []
    for remark_def in remarks_definitions:
        data_key = remark_def["key"]
        value = final_values_map.get(data_key) # Busca el valor en los datos ya procesados
        
        # Un dato es válido si existe y no es una cadena vacía o un guion
        if value and value.strip() and value.strip() != "-":
            formatted_line = f"{remark_def['label']} {value}"
            valid_formatted_remarks.append(formatted_line)
            logger.debug(f"Remark válida encontrada y formateada: '{formatted_line}'")

    # Asigna las líneas formateadas y los guiones de relleno a las variables Jinja A16-A19
    for i, jinja_var in enumerate(remark_jinja_vars):
        if i < len(valid_formatted_remarks):
            context[jinja_var] = valid_formatted_remarks[i]
        else:
            context[jinja_var] = "-" # Relleno para las ranuras restantes
        logger.debug(f"Contexto Jinja (Remarks): Var '{jinja_var}' = '{context[jinja_var]}'")
    
    # --- FIN DE LA LÓGICA ESPECIAL ---

    logger.info(f"Contexto Jinja2 final preparado con {len(context)} variables.")

    try:
        template_stream = io.BytesIO(docx_template_bytes)
        doc = DocxTemplate(template_stream)

        logger.info("Renderizando plantilla DOCX con contexto...")
        doc.render(context)
        logger.info("Plantilla DOCX renderizada.")

        output_stream = io.BytesIO()
        doc.save(output_stream)
        output_stream.seek(0)
        
        logger.info("Documento DOCX generado y guardado en stream de bytes.")
        return output_stream.getvalue()

    except Exception as e:
        logger.error(f"Error crítico durante la generación del documento DOCX: {e}", exc_info=True)
        return None