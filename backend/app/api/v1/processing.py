# backend/app/api/v1/processing.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List
import logging


# Importamos los modelos y la dependencia de autenticación
from .schemas import ScrapingRequest, VehicleRow, AuthenticatedUser # <-- AuthenticatedUser
from .auth import get_current_user # <-- Importamos la dependencia

# Importamos los servicios necesarios
from ...services.scraping_service import process_all_urls
from ...services.transform_service import apply_transformations, merge_and_prioritize
from app.data_transformation.key_map import FINAL_KEY_MAP 



logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/process-vehicle", response_model=List[VehicleRow], tags=["Processing"])
async def process_vehicle_data(
    request_data: ScrapingRequest,
    # AÑADIMOS LA DEPENDENCIA DE AUTENTICACIÓN:
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Recibe URLs, ejecuta scraping, transformación y fusión.
    SOLO PARA USUARIOS AUTENTICADOS.
    """
    # Imprimimos para verificar que tenemos el usuario
    username_from_metadata = current_user.user_metadata.get("username", "N/A")
    logger.info(
    f"Petición de /process-vehicle por usuario autenticado: ID={current_user.id}, "
    f"Email={current_user.email}, Username (metadata)={username_from_metadata}"
)

    # Mapea la opción de transmisión
    transmission_manual = None
    if request_data.transmission_option == "Manual":
        transmission_manual = True
    elif request_data.transmission_option == "Automático":
        transmission_manual = False

    # 1. Scraping
    scraped_dfs = await process_all_urls(
        request_data.url1,
        request_data.url2,
        request_data.url3,
        transmission_manual
    )

    if not any(df is not None for df in scraped_dfs.values()):
        raise HTTPException(status_code=400, detail="No se pudo obtener datos de ninguna URL proporcionada.")

    # 2. Transformación
    transformed_dfs = apply_transformations(scraped_dfs)

    # 3. Fusión y Priorización
    final_df = merge_and_prioritize(transformed_dfs)

    if final_df.empty:
        # Podrías devolver una lista vacía si es un resultado válido en algunos casos
        # raise HTTPException(status_code=500, detail="No se pudieron procesar los datos después de la fusión.")
        return []

    if 'Key' in final_df.columns:
        final_df = final_df.rename(columns={'Key': 'key'})    


    # --- INICIO DE LA MODIFICACIÓN ---
    # 4. Mapeo final de claves ANTES de enviar la respuesta
    #    Aquí es donde aplicamos el FINAL_KEY_MAP que quitamos de los transformadores.
    #final_df['key'] = final_df['Key'].map(FINAL_KEY_MAP)
    
    # Nos aseguramos de que si alguna clave no se mapeó, no se envíe como Nula.
    # También nos quedamos con la nueva columna 'key' y eliminamos la 'Key' original.
    #final_df = final_df.dropna(subset=['key'])
    #final_df = final_df.drop(columns=['Key'])
    # --- FIN DE LA MODIFICACIÓN ---

    # Convertimos el DataFrame a una lista de diccionarios.
    # Pydantic usará los alias definidos en VehicleRow para encontrar las columnas correctas.
    results_raw = final_df.where(final_df.notna(), None).to_dict('records')
    
    try:
        # Pydantic valida los datos y crea los objetos de respuesta
        validated_results = [VehicleRow.model_validate(row) for row in results_raw]
    except Exception as e:
        logger.error(f"Error al validar el modelo de respuesta: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error al formatear los datos de respuesta.")

    return validated_results



    