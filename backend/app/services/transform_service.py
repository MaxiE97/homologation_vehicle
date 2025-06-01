# backend/app/services/transform_service.py
import pandas as pd
from typing import Dict, Optional, List, Any

# Importamos tus clases y configuraciones de transformación
from ..data_transformation.transform_site1 import VehicleDataTransformer_site1, DEFAULT_CONFIG_1
from ..data_transformation.transform_site2 import VehicleDataTransformer_site2, DEFAULT_CONFIG_2
from ..data_transformation.transform_site3 import VehicleDataTransformer_site3, DEFAULT_CONFIG_3

# Creamos instancias de los transformadores
transformer1 = VehicleDataTransformer_site1(DEFAULT_CONFIG_1)
transformer2 = VehicleDataTransformer_site2(DEFAULT_CONFIG_2)
transformer3 = VehicleDataTransformer_site3(DEFAULT_CONFIG_3)

# Usaremos las ordered_keys de uno de los configs como base.
# Asegúrate de que todas tus configs usen las mismas claves finales.
MASTER_ORDERED_KEYS = DEFAULT_CONFIG_1.ordered_keys

def apply_transformations(
    scraped_data: Dict[str, Optional[pd.DataFrame]]
) -> Dict[str, Optional[pd.DataFrame]]:
    """
    Aplica las transformaciones a cada DataFrame scrapeado.
    """
    transformed_data = {}

    if "site1" in scraped_data and scraped_data["site1"] is not None:
        print("Aplicando transformación al Sitio 1...")
        transformed_data["site1"] = transformer1.transform(scraped_data["site1"])
    else:
        transformed_data["site1"] = None

    if "site2" in scraped_data and scraped_data["site2"] is not None:
        print("Aplicando transformación al Sitio 2...")
        transformed_data["site2"] = transformer2.transform(scraped_data["site2"])
    else:
        transformed_data["site2"] = None

    if "site3" in scraped_data and scraped_data["site3"] is not None:
        print("Aplicando transformación al Sitio 3...")
        transformed_data["site3"] = transformer3.transform(scraped_data["site3"])
    else:
        transformed_data["site3"] = None

    print("Transformaciones aplicadas.")
    return transformed_data

def merge_and_prioritize(
    transformed_data: Dict[str, Optional[pd.DataFrame]]
) -> pd.DataFrame:
    """
    Fusiona los DataFrames transformados y aplica la lógica de prioridad.
    Esta función adapta la lógica de tu 'merge_dataframes' original.
    """
    print("Iniciando fusión y priorización...")
    dfs_to_merge = {
        "site1": transformed_data.get("site1"),
        "site2": transformed_data.get("site2"),
        "site3": transformed_data.get("site3"),
    }

    # Filtra los DataFrames que no son None
    valid_dfs = {name: df for name, df in dfs_to_merge.items() if df is not None and not df.empty}

    if not valid_dfs:
        print("No hay DataFrames válidos para fusionar.")
        return pd.DataFrame(columns=["Key", "Valor Sitio 1", "Valor Sitio 2", "Valor Sitio 3", "Valor Final"])

    # Toma el primer DataFrame válido como base (o crea uno vacío con las Keys)
    base_df_name = list(valid_dfs.keys())[0]
    merged_df = valid_dfs[base_df_name][['Key', 'Value']].copy()
    merged_df = merged_df.rename(columns={'Value': f'Value_{base_df_name}'})

    # Fusiona los demás
    for name, df in valid_dfs.items():
        if name != base_df_name:
            df_renamed = df[['Key', 'Value']].rename(columns={'Value': f'Value_{name}'})
            merged_df = pd.merge(merged_df, df_renamed, on='Key', how='outer')

    # Añade las claves que podrían faltar de la lista maestra
    existing_keys = set(merged_df['Key'].values)
    missing_keys_data = [
        {"Key": key}
        for key in MASTER_ORDERED_KEYS if key not in existing_keys
    ]
    if missing_keys_data:
        merged_df = pd.concat([merged_df, pd.DataFrame(missing_keys_data)], ignore_index=True)


    # Asegura que todas las columnas Value_siteX existan, rellenando con None
    for i in range(1, 4):
        col_name = f'Value_site{i}'
        if col_name not in merged_df.columns:
            merged_df[col_name] = None

    # Rellena NaN con None (o string 'None' si prefieres, pero None es mejor para JSON)
    merged_df = merged_df.fillna(pd.NA).where(pd.notna(merged_df), None)


    # Define la función de prioridad (S2 > S1 > S3)
    def get_final_value(row):
        s2 = row.get('Value_site2')
        s1 = row.get('Value_site1')
        s3 = row.get('Value_site3')

        if s2 is not None and str(s2).strip() != 'None' and str(s2).strip() != '': return s2
        if s1 is not None and str(s1).strip() != 'None' and str(s1).strip() != '': return s1
        if s3 is not None and str(s3).strip() != 'None' and str(s3).strip() != '': return s3
        # Fallback si todos son None o 'None'
        return s2 if s2 is not None else (s1 if s1 is not None else s3)


    merged_df['Valor Final'] = merged_df.apply(get_final_value, axis=1)

    # Renombra columnas para la salida final
    merged_df = merged_df.rename(columns={
        'Value_site1': 'Valor Sitio 1',
        'Value_site2': 'Valor Sitio 2',
        'Value_site3': 'Valor Sitio 3',
    })

    # Ordena según las claves maestras
    merged_df['Key'] = pd.Categorical(
        merged_df['Key'],
        categories=MASTER_ORDERED_KEYS,
        ordered=True
    )
    merged_df = merged_df.sort_values("Key").reset_index(drop=True)

    # Selecciona y reordena las columnas finales
    final_columns = ['Key', 'Valor Sitio 1', 'Valor Sitio 2', 'Valor Sitio 3', 'Valor Final']
    # Asegura que solo se seleccionen columnas que existen
    final_columns_exist = [col for col in final_columns if col in merged_df.columns]
    merged_df = merged_df[final_columns_exist]

    print("Fusión y priorización completadas.")
    # Rellenar NaN/NA finales con None para consistencia JSON
    return merged_df.fillna(pd.NA).where(pd.notna(merged_df), None)