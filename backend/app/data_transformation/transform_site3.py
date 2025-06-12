import pandas as pd
from typing import Dict, List, Optional
from dataclasses import dataclass
import re
from .master_keys import MASTER_ORDERED_KEYS
from .key_map import FINAL_KEY_MAP


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
        df = self._create_suspension(df)
        df = self._create_brakes(df)
        df = self._add_fuel(df)





        df = self._add_missing_keys(df)
        #df["Key"] = df["Key"].map(lambda key_interna: FINAL_KEY_MAP.get(key_interna, key_interna))
        df = self._sort_and_clean(df)
        return df

    def _rename_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Renombra las columnas según el mapeo configurado."""
        df["Key"] = df["Key"].map(lambda x: self.config.column_mapping.get(x, x))
        return df
    

    def _create_suspension(self, df: pd.DataFrame) -> pd.DataFrame:
        
            if "Front suspension" in df["Key"].values and "Rear suspension" in df["Key"].values:
                front_val = df[df["Key"] == "Front suspension"]["Value"].values[0].split("-")[0].strip()
                rear_val = df[df["Key"] == "Rear suspension"]["Value"].values[0].split("-")[0].strip()

                
                new_row = pd.DataFrame({
                    "Key": ["Suspension"],
                    "Value": [f"{front_val}/{rear_val}"]
                })

            else:
            
                new_row = pd.DataFrame({
                        "Key": ["Suspension"],
                        "Value": [f"Independent type McPherson/Semi independent multilink"]
                    })
                    

            df = pd.concat([df, new_row], ignore_index=True)  

            

            return df


    def _create_brakes(self, df: pd.DataFrame) -> pd.DataFrame:
            
                if "Front brakes" in df["Key"].values and "Rear brakes" in df["Key"].values:
                    front_val = df[df["Key"] == "Front brakes"]["Value"].values[0]
                    rear_val = df[df["Key"] == "Rear brakes"]["Value"].values[0]

                    
                    new_row = pd.DataFrame({
                        "Key": ["Brakes"],
                        "Value": [f"{front_val}/{rear_val}"]
                    })

                else:
                
                    new_row = pd.DataFrame({
                            "Key": ["Brakes"],
                            "Value": [f"Ventilated discs/Ventilated discs"]
                        })
                        

                df = pd.concat([df, new_row], ignore_index=True)  

                

                return df

    def _add_fuel(self, df: pd.DataFrame) -> pd.DataFrame:
        """Añade la clave 'Fuel' con el valor correspondiente."""
        if "Fuel" in df["Key"].values:
            raw_value = df[df["Key"] == "Fuel"]["Value"].values[0].strip()
            # Buscar las siglas HEV, FHEV, PHEV o MHEV
            match = re.search(r'\b(FHEV|PHEV|MHEV|HEV)\b', raw_value)
            if match:
                new_value = match.group(1)
                df.loc[df["Key"] == "Fuel", "Value"] = new_value
            else:
                 df.loc[df["Key"] == "Fuel", "Value"] = "-"    
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

    @staticmethod
    def _get_max_value(value: str) -> str:
        """Obtiene el valor máximo de un rango."""
        return value.split("-")[-1].strip()

    @staticmethod
    def _get_value_slash(value: str, spot: int) -> str:
        """Obtiene el valor en un lugar entre las barras"""
        return value.split("/")[spot].strip()

    @staticmethod
    def _get_max_from_pair(value: str, delimitador: str) -> int:
        """Obtiene el máximo valor de un par de números separados por un delimitador.
        Si solo se pasa un número, devuelve ese número."""
        if delimitador in value:
            num1, num2 = map(int, value.split(delimitador))
            return max(num1, num2)
        else:
            return int(value)



# Configuración predeterminada
DEFAULT_CONFIG_3 = VehicleDataConfig(
    column_mapping={
        "Type of body": "Type of body",
        "Steering, method of assistance": "Steering, method of assistance",
        "Number and configuration of doors": "Number and configuration of doors",
        "Number and position of seats": "Number and position of seats",
        "Powertrain architecture" : "Fuel",
        

    },

    ordered_keys = MASTER_ORDERED_KEYS
)


