import pandas as pd
from typing import Dict, List, Optional
from dataclasses import dataclass
import re
from .master_keys import MASTER_ORDERED_KEYS


@dataclass
class VehicleDataConfig:
    """Configuración para la transformación de datos del vehículo."""
    column_mapping: Dict[str, str]
    ordered_keys: List[str]

class VehicleDataTransformer_site3:
    """Clase para transformar datos de vehículos."""

    def __init__(self, config: VehicleDataConfig):
        self.config = config

    def transform(self, df_input: pd.DataFrame) -> pd.DataFrame:
        """Método principal que orquesta la transformación de datos."""
        df = df_input.copy()
        df = self._rename_columns(df)
        df = self._add_fuel(df)
        df = self._add_braking_system_1(df)
        df = self._add_braking_system_2(df)







        df = self._add_missing_keys(df)
        df = self._sort_and_clean(df)
        return df

    def _rename_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Renombra las columnas según el mapeo configurado."""
        df["Key"] = df["Key"].map(lambda x: self.config.column_mapping.get(x, x))
        return df
    

#    "Fuel": "fuel",                                                                # B25
    def _add_fuel(self, df: pd.DataFrame) -> pd.DataFrame:
        """Añade la clave 'Fuel' con el valor correspondiente."""
        if "Fuel" in df["Key"].values:
            raw_value = df[df["Key"] == "Fuel"]["Value"].values[0].strip()
            # Buscar las siglas HEV, FHEV, PHEV o MHEV
            match = re.search(r'\b(FHEV|PHEV|MHEV|HEV)\b', raw_value)
            if match:
                new_value = match.group(1)
                df.loc[df["Key"] == "fuel", "Value"] = new_value
            else:
                 df.loc[df["Key"] == "fuel", "Value"] = "-"    
        return df


#    "Suspension": "braking_system_1",                                              # B34

    def _add_braking_system_1(self, df: pd.DataFrame) -> pd.DataFrame:
        
            if "Front suspension" in df["Key"].values and "Rear suspension" in df["Key"].values:
                front_val = df[df["Key"] == "Front suspension"]["Value"].values[0].split("-")[0].strip()
                rear_val = df[df["Key"] == "Rear suspension"]["Value"].values[0].split("-")[0].strip()

                
                new_row = pd.DataFrame({
                    "Key": ["braking_system_1"],
                    "Value": [f"{front_val}/{rear_val}"]
                })

            else:
            
                new_row = pd.DataFrame({
                        "Key": ["braking_system_1"],
                        "Value": [f"Independent type McPherson/Semi independent multilink"]
                    })
                    

            df = pd.concat([df, new_row], ignore_index=True)  

            

            return df

#    "Brakes": "braking_system_2",                                                  # B35

    def _add_braking_system_2(self, df: pd.DataFrame) -> pd.DataFrame:
            
                if "Front brakes" in df["Key"].values and "Rear brakes" in df["Key"].values:
                    front_val = df[df["Key"] == "Front brakes"]["Value"].values[0]
                    rear_val = df[df["Key"] == "Rear brakes"]["Value"].values[0]

                    
                    new_row = pd.DataFrame({
                        "Key": ["braking_system_2"],
                        "Value": [f"{front_val}/{rear_val}"]
                    })

                else:
                
                    new_row = pd.DataFrame({
                            "Key": ["braking_system_2"],
                            "Value": [f"Ventilated discs/Ventilated discs"]
                        })
                        

                df = pd.concat([df, new_row], ignore_index=True)  

                

                return df
       
                      



    def _add_missing_keys(self, df: pd.DataFrame) -> pd.DataFrame:
        """Añade información sobre claves faltantes, asegurando que se incluyan todas las ordered_keys."""
        missing_rows = [
            {"Key": key, "Value": "None"}
            for key in self.config.ordered_keys if key not in df["Key"].values
        ]
        if missing_rows:
            df = pd.concat([df, pd.DataFrame(missing_rows)], ignore_index=True)
        return df



    def _sort_and_clean(self, df: pd.DataFrame) -> pd.DataFrame:
        df["Key"] = pd.Categorical(df["Key"], categories=self.config.ordered_keys, ordered=True)
        return df.dropna(subset=['Key']).sort_values("Key").reset_index(drop=True)

    



# Configuración predeterminada
DEFAULT_CONFIG_3 = VehicleDataConfig(
    column_mapping={
        "Type of body": "body_type",
        "Steering, method of assistance": "steering_assistance",
        "Number and configuration of doors": "doors_config",
        "Number and position of seats": "seats_config",
        "Powertrain architecture" : "fuel",
        

    },

    ordered_keys = MASTER_ORDERED_KEYS
)


