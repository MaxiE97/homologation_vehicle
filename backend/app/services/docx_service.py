# backend/app/services/docx_service.py
import logging
import io
from typing import Dict, Optional, List, Any
from supabase import Client
from docxtpl import DocxTemplate

logger = logging.getLogger(__name__)

try:
    from .marcadores_map import KEY_TO_JINJA_VARIABLE_MAP
except ImportError:
    logger.error("CRÍTICO: No se pudo importar KEY_TO_JINJA_VARIABLE_MAP desde .marcadores_map.")
    KEY_TO_JINJA_VARIABLE_MAP: Dict[str, str] = {}

# Conjunto de todos los posibles valores afirmativos ("Sí") en los idiomas soportados.
AFFIRMATIVE_VALUES = {
    "yes", "ja", "si", "oui", "da", "tak", "ano", "sim"
}

# Diccionario central para las etiquetas de las "remarks" que necesitan traducción.
REMARK_LABELS = {
    "label_electric_1": {
        "en": "Nominal continuous electrical power:",
        "de": "Elektrische Nennleistung:",
        "pt": "Potência elétrica nominal contínua:",
        "it": "Potenza elettrica nominale continua:",
        "fr": "Puissance électrique continue nominale :",
        "nl": "Nominale continue elektrische vermogen:",
        "sv": "Nominell kontinuerlig elektrisk effekt:",
        "ro": "Putere electrică nominală continuă:",
        "pl": "Nominalna ciągła moc elektryczna:",
        "cs": "Jmenovitý trvalý elektrický výkon:",
        "default": "Nominal continuous electrical power:"
    },
    "label_electric_2": {
        "en": "Net maximum electrical power:",
        "de": "Maximale Nettoleistung:",
        "pt": "Potência elétrica máxima líquida:",
        "it": "Potenza elettrica massima netta:",
        "fr": "Puissance électrique maximale nette :",
        "nl": "Netto maximale elektrische vermogen:",
        "sv": "Nettomaximal elektrisk effekt:",
        "ro": "Putere electrică maximă netă:",
        "pl": "Maksymalna netto moc elektryczna:",
        "cs": "Čistý maximální elektrický výkon:",
        "default": "Net maximum electrical power:"
    },
    "label_electric_3": {
        "en": "Electrical power over 60 minutes:",
        "de": "Elektrische Leistung über 60 Minuten:",
        "pt": "Potência elétrica durante 60 minutos:",
        "it": "Potenza elettrica su 60 minuti:",
        "fr": "Puissance électrique sur 60 minutes :",
        "nl": "Elektrisch vermogen over 60 minuten:",
        "sv": "Elektrisk effekt över 60 minuter:",
        "ro": "Putere electrică pe o durată de 60 de minute:",
        "pl": "Moc elektryczna przez 60 minut:",
        "cs": "Elektrický výkon po dobu 60 minut:",
        "default": "Electrical power over 60 minutes:"
    },
}


async def generate_vehicle_docx(
    data_to_render: List[Dict[str, Any]], 
    language: str,
    supabase_admin_client: Client
) -> Optional[bytes]:
    """
    Genera un documento DOCX, descargando la plantilla desde Supabase Storage
    y usando docxtpl con Jinja2 para el reemplazo. Incluye lógica especial
    para formatear y mostrar condicionalmente las secciones de 'Remarks'.
    """
    BUCKET_NAME = "plantillas-docx"

    LANGUAGE_TO_FILENAME_MAP = {
        "en": "planillaIngles.docx", "de": "planillaAleman.docx", "pt": "planillaPortugues.docx",
        "it": "planillaItaliano.docx", "fr": "planillaFrances.docx", "nl": "planillaHolandes.docx",
        "sv": "planillaSueco.docx", "ro": "planillaRumania.docx", "pl": "planillaPolaco.docx",
        "cs": "planillaCheco.docx",
    }
    
    normalized_language = language.lower()
    if normalized_language not in LANGUAGE_TO_FILENAME_MAP:
        logger.error(f"Idioma '{language}' no tiene una plantilla DOCX mapeada.")
        return None
    
    template_file_name_in_bucket = LANGUAGE_TO_FILENAME_MAP[normalized_language]
    logger.info(f"Intentando descargar plantilla DOCX: '{template_file_name_in_bucket}' del bucket '{BUCKET_NAME}'")

    try:
        response_bytes = supabase_admin_client.storage.from_(BUCKET_NAME).download(template_file_name_in_bucket)
        if not response_bytes:
            logger.error(f"La descarga de la plantilla DOCX devolvió None o vacío.")
            return None
        docx_template_bytes = response_bytes
        logger.info(f"Plantilla DOCX '{template_file_name_in_bucket}' descargada.")
    except Exception as e:
        logger.error(f"Error descargando plantilla DOCX: {e}", exc_info=True)
        return None

    # --- Preparación del Contexto Jinja2 ---
    context = {}
    final_values_map = {item.get("Key"): str(item.get("Valor Final", "")) for item in data_to_render}
    
    for data_key, jinja_var_name in KEY_TO_JINJA_VARIABLE_MAP.items():
        if data_key in final_values_map:
            context[jinja_var_name] = final_values_map[data_key]

    # --- INICIO: LÓGICA PARA REMARKS ---
    logger.info("Procesando lógica para remarks eléctricos y estándar.")

    # 1. Determinar si el vehículo es eléctrico o híbrido.
    hybrid_value = final_values_map.get("hybrid", "no").lower()
    pure_electric_value = final_values_map.get("pure_electric", "no").lower()

    is_electric_or_hybrid = (
        hybrid_value in AFFIRMATIVE_VALUES or
        pure_electric_value in AFFIRMATIVE_VALUES
    )
    context["is_electric_or_hybrid"] = is_electric_or_hybrid
    logger.info(f"Vehículo detectado como eléctrico/híbrido: {is_electric_or_hybrid}")

    # 2. Procesar las "remarks eléctricas" con etiquetas traducidas.
    if is_electric_or_hybrid:
        electric_remarks_defs = [
            {"key": "remark_electric_1", "label_key": "label_electric_1"},
            {"key": "remark_electric_2", "label_key": "label_electric_2"},
            {"key": "remark_electric_3", "label_key": "label_electric_3"},
        ]
        electric_jinja_vars = ["A24", "A25", "A26"]

        valid_electric_remarks = []
        for remark_def in electric_remarks_defs:
            data_key = remark_def["key"]
            value = final_values_map.get(data_key)
            
            if value and value.strip() and value.strip() != "-":
                label_key = remark_def["label_key"]
                label_translations = REMARK_LABELS.get(label_key, {})
                translated_label = label_translations.get(language, label_translations.get("default", ""))
                valid_electric_remarks.append(f"{translated_label} {value}")
        
        for i, jinja_var in enumerate(electric_jinja_vars):
            if i < len(valid_electric_remarks):
                context[jinja_var] = valid_electric_remarks[i]
            else:
                context[jinja_var] = "-"
    
    # 3. Procesar las "remarks estándar" con etiquetas fijas.
    remarks_definitions = [
        {"key": "remarks_6_1", "label": "Zu* 6.1.:"},
        {"key": "remarks_7_1", "label": "Zu* 7.1.:"},
        {"key": "remarks_8", "label": "Zu* 8.:"},
        {"key": "remarks_11", "label": "Zu* 11.:"},
        {"key": "remarks_12", "label": "Zu* 12.1.:"},
    ]
    remark_jinja_vars = ["A16", "A17", "A18", "A19", "A27"]

    valid_formatted_remarks = []
    for remark_def in remarks_definitions:
        data_key = remark_def["key"]
        value = final_values_map.get(data_key)

        if value and value.strip() and value.strip() != "-":
            formatted_line = f"{remark_def['label']} {value}"
            valid_formatted_remarks.append(formatted_line)

    for i, jinja_var in enumerate(remark_jinja_vars):
        if i < len(valid_formatted_remarks):
            context[jinja_var] = valid_formatted_remarks[i]
        else:
            context[jinja_var] = "-"
    
    # --- FIN DE LA LÓGICA PARA REMARKS ---

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