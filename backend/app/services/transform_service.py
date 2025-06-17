# backend/app/services/transform_service.py
import pandas as pd
from typing import Dict, Optional, List, Any
import logging

# Importamos las clases y configs de transformación
from ..data_transformation.transform_site1 import VehicleDataTransformer_site1, DEFAULT_CONFIG_1
from ..data_transformation.transform_site2 import VehicleDataTransformer_site2, DEFAULT_CONFIG_2
from ..data_transformation.transform_site3 import VehicleDataTransformer_site3, DEFAULT_CONFIG_3
# Importamos la lista maestra de claves
from ..data_transformation.master_keys import MASTER_ORDERED_KEYS

# Creamos instancias de los transformadores
transformer1 = VehicleDataTransformer_site1(DEFAULT_CONFIG_1)
transformer2 = VehicleDataTransformer_site2(DEFAULT_CONFIG_2)
transformer3 = VehicleDataTransformer_site3(DEFAULT_CONFIG_3)

logger = logging.getLogger(__name__)

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
    merged_df = pd.DataFrame(MASTER_ORDERED_KEYS, columns=['Key'])

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

    # La función get_final_value ahora incluye la lógica especial para 'Fuel'
    def get_final_value(row):
        s1 = row.get('Valor Sitio 1')
        s2 = row.get('Valor Sitio 2')
        s3 = row.get('Valor Sitio 3')
        
        # --- INICIO: LÓGICA ESPECIAL PARA 'Fuel' (REINTEGRADA) ---
        if row['Key'] == 'Fuel':
            s2_value = str(s2)
            if "Diesel / Electric" in s2_value: 
                main_fuel = s2_value.split(' / ')[0]
                return f"{main_fuel}/{s3}" # Se corrigió el espacio extra
            if "Gasoline / Electric" in s2_value:
                # Se asume que "Gasoline" debe convertirse en "Petrol" para consistencia
                return f"Petrol/{s3}"
            if "Diesel" in s2_value:
                return s2_value
            if "Gasoline" in s2_value:
                return "Petrol"
        # --- FIN: LÓGICA ESPECIAL PARA 'Fuel' ---

        # Para Particulates, la prioridad es Columna 1
        if row['Key'] == 'Particulates for CI':
            if s1 is not None and str(s1) not in ['-', 'None']:
                return s1
        
        # Lógica de prioridad por defecto (S2 > S1 > S3) para todo lo demás
        if s2 is not None and str(s2) not in ['-', 'None']:
            return s2
        if s1 is not None and str(s1) not in ['-', 'None']:
            return s1
        if s3 is not None and str(s3) not in ['-', 'None']:
            return s3
            
        return "-"

    # 1. Se calcula un 'Valor Final' INICIAL para todas las filas
    merged_df['Valor Final'] = merged_df.apply(get_final_value, axis=1)

    # --- INICIO: BLOQUE DE LÓGICA ESPECIAL PARA OTRAS EMISIONES (POST-PROCESAMIENTO) ---
    try:
        logger.info("Aplicando lógica especial para emisiones.")
        fuel_row = merged_df[merged_df['Key'] == 'Fuel']
        emissions_row = merged_df[merged_df['Key'] == 'Emissions standard']

        if not fuel_row.empty and not emissions_row.empty:
            fuel_value = fuel_row['Valor Sitio 2'].iloc[0] # Se usa el 'Valor Final' ya calculado para Fuel
            emissions_value = emissions_row['Valor Sitio 1'].iloc[0]

            emission_fields_group_a = ['Emissions CO', 'Emissions HC', 'Emissions NOx', 'Emissions HC NOx']
            particulates_field_group_b = 'Emissions particulates'
            euro_standards = ["EURO 1", "EURO 2", "EURO 3", "EURO 4"]

            # Aplicar Grupo de Reglas 1
            if emissions_value in euro_standards:
                for field_key in emission_fields_group_a:
                    original_value_str = str(merged_df.loc[merged_df['Key'] == field_key, 'Valor Sitio 2'].iloc[0])
                    try:
                        num_value = float(original_value_str)
                        new_value = f"{num_value:.3f}"
                        merged_df.loc[merged_df['Key'] == field_key, 'Valor Final'] = new_value
                    except (ValueError, TypeError):
                        pass

            # Aplicar Grupo de Reglas 2
            original_particulates_str = str(merged_df.loc[merged_df['Key'] == particulates_field_group_b, 'Valor Sitio 1'].iloc[0])
            if "Gasoline" in str(fuel_value) or "Petrol" in str(fuel_value):
                merged_df.loc[merged_df['Key'] == particulates_field_group_b, 'Valor Final'] = "- - - -"
            elif "Diesel" in str(fuel_value):
                try:
                    num_value = float(original_particulates_str)
                    new_value = f"{num_value:.3f}"
                    merged_df.loc[merged_df['Key'] == particulates_field_group_b, 'Valor Final'] = new_value
                except (ValueError, TypeError):
                    pass
        else:
            logger.warning("No se encontraron las filas 'Fuel' o 'Emissions standard' para aplicar la lógica especial.")
    except Exception as e:
        logger.error(f"Error crítico aplicando la lógica especial de emisiones: {e}", exc_info=True)
    # --- FIN: BLOQUE DE LÓGICA ESPECIAL ---

    # Ordenar y seleccionar columnas finales
    merged_df['Key'] = pd.Categorical(merged_df['Key'], categories=MASTER_ORDERED_KEYS, ordered=True)
    merged_df = merged_df.sort_values("Key").reset_index(drop=True)

    final_columns = ['Key', 'Valor Sitio 1', 'Valor Sitio 2', 'Valor Sitio 3', 'Valor Final']
    return merged_df[final_columns]