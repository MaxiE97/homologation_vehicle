# backend/app/services/transform_service.py
import pandas as pd
from typing import Dict, Optional, List, Any

# Importamos las clases y configs de transformación
from ..data_transformation.transform_site1 import VehicleDataTransformer_site1, DEFAULT_CONFIG_1
from ..data_transformation.transform_site2 import VehicleDataTransformer_site2, DEFAULT_CONFIG_2
from ..data_transformation.transform_site3 import VehicleDataTransformer_site3, DEFAULT_CONFIG_3
# Importamos la lista maestra de claves PROGRAMÁTICAS
from ..data_transformation.master_keys import MASTER_ORDERED_KEYS

# Creamos instancias de los transformadores
transformer1 = VehicleDataTransformer_site1(DEFAULT_CONFIG_1)
transformer2 = VehicleDataTransformer_site2(DEFAULT_CONFIG_2)
transformer3 = VehicleDataTransformer_site3(DEFAULT_CONFIG_3)

def apply_transformations(
    scraped_data: Dict[str, Optional[pd.DataFrame]]
) -> Dict[str, Optional[pd.DataFrame]]:
    """Aplica las transformaciones a cada DataFrame scrapeado."""
    transformed_data = {}

    if "site1" in scraped_data and scraped_data["site1"] is not None and not scraped_data["site1"].empty:
        transformed_data["site1"] = transformer1.transform(scraped_data["site1"])
    else:
        transformed_data["site1"] = None

    if "site2" in scraped_data and scraped_data["site2"] is not None and not scraped_data["site2"].empty:
        transformed_data["site2"] = transformer2.transform(scraped_data["site2"])
    else:
        transformed_data["site2"] = None

    if "site3" in scraped_data and scraped_data["site3"] is not None and not scraped_data["site3"].empty:
        transformed_data["site3"] = transformer3.transform(scraped_data["site3"])
    else:
        transformed_data["site3"] = None

    return transformed_data

def merge_and_prioritize(
    transformed_data: Dict[str, Optional[pd.DataFrame]]
) -> pd.DataFrame:
    """Fusiona los DataFrames transformados y aplica la lógica de prioridad."""
    # Crea un DataFrame base con todas las claves programáticas esperadas
    merged_df = pd.DataFrame(MASTER_ORDERED_KEYS, columns=['Key'])

    # Itera sobre cada DataFrame transformado y lo fusiona con el base
    for i in range(1, 4):
        site_name = f'site{i}'
        df = transformed_data.get(site_name)
        col_name = f'Valor Sitio {i}'

        if df is not None and not df.empty:
            df_renamed = df[['Key', 'Value']].rename(columns={'Value': col_name})
            merged_df = pd.merge(merged_df, df_renamed, on='Key', how='left')
        else:
            # Si el DataFrame no existe, crea la columna con valores por defecto
            merged_df[col_name] = "-"
            
    # Rellena cualquier valor nulo con el default "-"
    merged_df = merged_df.fillna("-")

    # Define la función de prioridad (S2 > S1 > S3)
    def get_final_value(row):
        s2 = row.get('Valor Sitio 2')
        s1 = row.get('Valor Sitio 1')
        s3 = row.get('Valor Sitio 3')
        
        # Prioridad S2 > S1 > S3.
        # Ahora considera tanto "-" como "None" (string) como valores no válidos.
        if s2 is not None and str(s2) not in ['-', 'None']:
            return s2
        if s1 is not None and str(s1) not in ['-', 'None']:
            return s1
        if s3 is not None and str(s3) not in ['-', 'None']:
            return s3
            
        # Si todos son inválidos, puedes decidir qué devolver. 
        # Devolver "-" es consistente con los valores por defecto.
        return "-"

    merged_df['Valor Final'] = merged_df.apply(get_final_value, axis=1)

    # El orden ya está definido por el DataFrame base inicial, pero re-categorizamos para asegurar.
    merged_df['Key'] = pd.Categorical(merged_df['Key'], categories=MASTER_ORDERED_KEYS, ordered=True)
    merged_df = merged_df.sort_values("Key").reset_index(drop=True)

    final_columns = ['Key', 'Valor Sitio 1', 'Valor Sitio 2', 'Valor Sitio 3', 'Valor Final']
    return merged_df[final_columns]