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
            merged_df[col_name] = "-"
            
    merged_df = merged_df.fillna("-")

    # Define la función de prioridad con tu lógica especial
    def get_final_value(row):
        # Primero, obtén los valores de las columnas para usarlos fácilmente
        s1 = row.get('Valor Sitio 1')
        s2 = row.get('Valor Sitio 2')
        s3 = row.get('Valor Sitio 3')
        
        # --- INICIO DE LA MODIFICACIÓN: LÓGICA ESPECIAL ---

        # Comprueba si estamos en la fila de 'Fuel'
        if row['Key'] == 'Fuel':
            # Convierte a string para evitar errores si el valor es None
            s2_value = str(s2)
            
            # Condición 1: Si S2 es híbrido, combina con S3
            if "Diesel / Electric" in s2_value: 
                main_fuel = s2_value.split(' / ')[0]
                return f"{main_fuel}/{s3} "

            if "Gasoline / Electric" in s2_value:
                return f"Petrol/{s3} "
            
            # Condición 2: Si S2 es solo Diesel o Gasoline, úsalo directamente
            if "Diesel" in s2_value:
                return s2_value

            if "Gasoline" in s2_value:
                return "Petrol" 

        # --- FIN DE LA MODIFICACIÓN ---

        # Lógica de prioridad por defecto (S2 > S1 > S3)
        # Si la lógica especial de arriba no se aplicó, se ejecuta esto.
        if s2 is not None and str(s2) not in ['-', 'None']:
            return s2
        if s1 is not None and str(s1) not in ['-', 'None']:
            return s1
        if s3 is not None and str(s3) not in ['-', 'None']:
            return s3
            
        return "-"

    merged_df['Valor Final'] = merged_df.apply(get_final_value, axis=1)

    merged_df['Key'] = pd.Categorical(merged_df['Key'], categories=MASTER_ORDERED_KEYS, ordered=True)
    merged_df = merged_df.sort_values("Key").reset_index(drop=True)

    final_columns = ['Key', 'Valor Sitio 1', 'Valor Sitio 2', 'Valor Sitio 3', 'Valor Final']
    return merged_df[final_columns]