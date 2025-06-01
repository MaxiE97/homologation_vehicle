# backend/app/services/docx_service.py
import logging
import io
from typing import Dict, Optional, List, Any
from supabase import Client # Para interactuar con Supabase Storage
from docxtpl import DocxTemplate # La librería para DOCX con Jinja2

logger = logging.getLogger(__name__)

# Importamos el mapeo desde el archivo marcadores_map.py
# Asumiendo que marcadores_map.py está en el mismo directorio 'services'
try:
    from .marcadores_map import KEY_TO_JINJA_VARIABLE_MAP
except ImportError:
    logger.error("CRÍTICO: No se pudo importar KEY_TO_JINJA_VARIABLE_MAP desde .marcadores_map. Asegúrate de que el archivo exista y esté en el mismo directorio (services).")
    # Usamos un dict vacío para evitar que la aplicación falle al iniciar,
    # pero la generación de DOCX probablemente no funcionará como se espera.
    KEY_TO_JINJA_VARIABLE_MAP: Dict[str, str] = {}


async def generate_vehicle_docx(
    data_to_render: List[Dict[str, Any]], # Viene del payload del request (lista de KeyValuePair)
    language: str,
    supabase_admin_client: Client
) -> Optional[bytes]:
    """
    Genera un documento DOCX, descargando la plantilla desde Supabase Storage
    y usando docxtpl con Jinja2 para el reemplazo.
    Solo los marcadores definidos en el contexto (basado en data_to_render y KEY_TO_JINJA_VARIABLE_MAP)
    serán reemplazados. El resto, Jinja2 los dejará vacíos por defecto.
    """
    BUCKET_NAME = "plantillas-docx" # Asegúrate que este sea el nombre correcto de tu bucket

    LANGUAGE_TO_FILENAME_MAP = {
        "ingles": "planillaIngles.docx",
        "en": "planillaIngles.docx",
        "prueba": "planillaPrueba.docx",
    }
    normalized_language = language.lower()

    if normalized_language not in LANGUAGE_TO_FILENAME_MAP:
        logger.error(f"Idioma '{language}' (normalizado: '{normalized_language}') no tiene una plantilla DOCX mapeada.")
        return None
    
    template_file_name_in_bucket = LANGUAGE_TO_FILENAME_MAP[normalized_language]
    logger.info(f"Intentando descargar plantilla DOCX: '{template_file_name_in_bucket}' del bucket '{BUCKET_NAME}'")

    docx_template_bytes: Optional[bytes] = None
    try:
        response_bytes = supabase_admin_client.storage.from_(BUCKET_NAME).download(template_file_name_in_bucket)
        if response_bytes:
            docx_template_bytes = response_bytes
            logger.info(f"Plantilla DOCX '{template_file_name_in_bucket}' descargada ({len(docx_template_bytes)} bytes).")
        else:
            logger.error(f"La descarga de la plantilla DOCX '{template_file_name_in_bucket}' devolvió None o vacío.")
            return None
    except Exception as e:
        logger.error(f"Error descargando plantilla DOCX '{template_file_name_in_bucket}' de Supabase Storage: {e}", exc_info=True)
        return None

    # --- Preparar el contexto para Jinja2 (Versión Simplificada) ---
    context = {}
    if not KEY_TO_JINJA_VARIABLE_MAP:
        logger.warning("El mapeo KEY_TO_JINJA_VARIABLE_MAP está vacío. El contexto estará vacío.")
    
    processed_keys_count = 0
    if data_to_render:
        for item_data in data_to_render: # item_data es un dict {"Key": "...", "Valor Final": "..."}
            data_key = item_data.get("Key")
            final_value = str(item_data.get("Valor Final", "-")) # Usar cadena vacía como default si "Valor Final" falta

            if data_key in KEY_TO_JINJA_VARIABLE_MAP:
                jinja_variable_name = KEY_TO_JINJA_VARIABLE_MAP[data_key]
                context[jinja_variable_name] = final_value 
                processed_keys_count += 1
                logger.debug(f"Contexto Jinja: Var '{jinja_variable_name}' (mapeada de Key: '{data_key}') establecida a = '{final_value}'")
            # else:
                # Si una "Key" de los datos no está en el mapa, simplemente se ignora.
                # logger.debug(f"La Clave de datos '{data_key}' no está en KEY_TO_JINJA_VARIABLE_MAP, se ignora para el contexto.")
    else:
        logger.info("No se proporcionaron datos en 'data_to_render', el contexto estará vacío (o solo con defaults de Jinja si los tuviera).")

    logger.info(f"Contexto Jinja2 final preparado. {processed_keys_count} variables establecidas desde datos de entrada. Total variables en contexto: {len(context)}")
    # logger.debug(f"Contexto Jinja2 completo para renderizar: {context}")

    try:
        template_stream = io.BytesIO(docx_template_bytes)
        doc = DocxTemplate(template_stream)

        logger.info("Renderizando plantilla DOCX con contexto...")
        # Si una variable en la plantilla (ej: {{B7}}) no está en el 'context',
        # Jinja2 la reemplazará por una cadena vacía por defecto.
        doc.render(context)
        logger.info("Plantilla DOCX renderizada.")

        output_stream = io.BytesIO()
        doc.save(output_stream)
        output_stream.seek(0)
        
        logger.info("Documento DOCX generado y guardado en stream de bytes.")
        return output_stream.getvalue()

    except Exception as e:
        logger.error(f"Error crítico durante la generación del documento DOCX con docxtpl: {e}", exc_info=True)
        return None