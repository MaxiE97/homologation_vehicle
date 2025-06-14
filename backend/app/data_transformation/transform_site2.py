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

class VehicleDataTransformer_site2:
    """Clase para transformar datos de vehículos."""

    def __init__(self, config: VehicleDataConfig):
        self.config = config

    def transform(self, df_input: pd.DataFrame) -> pd.DataFrame:
        """Método principal que orquesta la transformación de datos."""
        df = df_input.copy()
        df = self._rename_columns(df)
        df = self._process_axle_tracks(df)
        df = self._add_powered_axles(df)
        df = self._process_trailer_masses(df)
        df = self._process_mass_distribution(df)
        df = self._process_maximum_vertical_load(df)
        df = self._process_engine_manufacturer(df)
        df = self._process_max_power(df)
        df = self._process_transmission(df)
        df = self._process_drive_ratio(df)
        df = self._process_Rear_overhang(df)
        df = self._process_maximum_speed(df)
        df = self._process_emissions(df)
        df = self._transform_emissions_values(df)
        df = self._process_dimensions(df)
        df = self._add_number_and_arrangement_of_cylinders(df)
        df = self._add_direct_injection(df)
        df = self._add_working_principle(df)
        

        df = self._add_missing_keys(df)
        #df["Key"] = df["Key"].map(lambda key_interna: FINAL_KEY_MAP.get(key_interna, key_interna))
        df = self._sort_and_clean(df)
        return df

    def _rename_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Renombra las columnas según el mapeo configurado y asegura que todas las claves estén presentes."""
        # Renombrar las columnas según el mapeo
        df["Key"] = df["Key"].map(lambda x: self.config.column_mapping.get(x, x))

        # Verificar claves faltantes y agregar filas con "None"
        missing_keys = [
            self.config.column_mapping[key]
            for key in self.config.column_mapping.keys()
            if self.config.column_mapping[key] not in df["Key"].values
        ]

        if missing_keys:
            missing_rows = [{"Key": key, "Value": "None"} for key in missing_keys]
            df = pd.concat([df, pd.DataFrame(missing_rows)], ignore_index=True)

        return df

    def _process_axle_tracks(self, df: pd.DataFrame) -> pd.DataFrame:
        """Procesa y combina la información de los ejes."""
        if "Axle(s) track – 1" in df["Key"].values and "Axle(s) track – 2" in df["Key"].values:
            track1 = df[df["Key"] == "Axle(s) track – 1"]["Value"].values[0]
            track2 = df[df["Key"] == "Axle(s) track – 2"]["Value"].values[0]

            max_track1 = self._get_max_value(track1)
            max_track2 = self._get_max_value(track2)

            df = df[df["Key"] != "Axle(s) track – 2"]
            mask = df["Key"] == "Axle(s) track – 1"
            df.loc[mask, "Value"] = f"{max_track1}/{max_track2}"
            df.loc[mask, "Key"] = "Axle(s) track – 1 / 2"

        return df

    def _add_powered_axles(self, df: pd.DataFrame) -> pd.DataFrame:
        """Añade información sobre ejes motorizados."""
        if "Powered axles" in df["Key"].values:
          actual_value = df[df["Key"] == "Powered axles"]["Value"].values[0]

          if actual_value == "All-wheel drive":
            df.loc[df["Key"] == "Powered axles", "Value"] = "2"
          else:
            df.loc[df["Key"] == "Powered axles", "Value"] = "1"

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


    def _process_trailer_masses(self, df: pd.DataFrame) -> pd.DataFrame:
        """Procesa y combina la información de masas del remolque, tomando el máximo valor de cada par."""
        if "Braked trailer" in df["Key"].values and "Unbraked trailer" in df["Key"].values:
            # Obtiene los valores originales
            braked = df[df["Key"] == "Braked trailer"]["Value"].values[0]      # ej: "600 / 1000"
            unbraked = df[df["Key"] == "Unbraked trailer"]["Value"].values[0]  # ej: "450 / 1222"

            # Obtiene el máximo de cada par
            braked_max = self._get_max_from_pair(braked, '/')     # resultado: 1000
            unbraked_max = self._get_max_from_pair(unbraked, '/') # resultado: 1222

            # Elimina las filas originales
            df = df[~df["Key"].isin(["Braked trailer", "Unbraked trailer"])]

            # Crea una nueva fila con los máximos
            new_row = pd.DataFrame({
                "Key": ["Maximum mass of trailer – braked / unbraked"],
                "Value": [f"{braked_max}/{unbraked_max}"]  # Resultado: "1000 / 1222"
            })

            df = pd.concat([df, new_row], ignore_index=True)

        return df

    def _process_Rear_overhang(self, df: pd.DataFrame) -> pd.DataFrame:
        """Procesa y combina la información de Rear overhang"""
        if "Rear overhang" in df["Key"].values:
            rear = df[df["Key"] == "Rear overhang"]["Value"].values[0]

            # elimina el primer "/" de "/ 869 - 869"
            rear = rear.split("/")[1]

            # guarda el nuevo valor
            df.loc[df["Key"] == "Rear overhang", "Value"] = rear


        return df

    #def Maximum vertical load at the coupling point for a trailer
    def _process_maximum_vertical_load(self, df: pd.DataFrame) -> pd.DataFrame:
        """Procesa y transforma Maximum vertical load at the coupling point for a trailer"""
        if "Support load" in df["Key"].values:
            # Obtiene los valores originales
            vertical_values = df[df["Key"] == "Support load"]["Value"].values[0]      # ej: "600 / 1000"

            # Obtiene el máximo de cada par
            vertical_value_max = self._get_max_from_pair(vertical_values, '/')     # resultado: 1000

            # Elimina las filas originales
            df = df[~df["Key"].isin(["Support load"])]

            # Crea una nueva fila con los máximos
            new_row = pd.DataFrame({
                "Key": ["Maximum vertical load at the coupling point for a trailer"],
                "Value": [f"{vertical_value_max}"]  # Resultado: "1000 / 1222"
            })

            df = pd.concat([df, new_row], ignore_index=True)

        return df

    def _process_max_power(self, df: pd.DataFrame) -> pd.DataFrame:
        """Procesa y combina la información la capacidad maxima."""
        if "Maximum net power" in df["Key"].values:
            power = df[df["Key"] == "Maximum net power"]["Value"].values[0]

            num1 = float(self._get_value_slash(power, 0))
            num2 = float(self._get_value_slash(power, 1))

            num1 = int(num1) if num1.is_integer() else num1
            num2 = int(num2) if num2.is_integer() else num2


            new_value = f"{num1}/{num2}"


            df.loc[df["Key"] == "Maximum net power", "Value"] = new_value

        return df
    

    



    def _add_working_principle(self, df: pd.DataFrame) -> pd.DataFrame:
        """Añade la clave 'Working principle' con el valor correspondiente."""
        if "Fuel" in df["Key"].values:
            fuel_value = df[df["Key"] == "Fuel"]["Value"].values[0]

            if fuel_value == "Diesel / Electric" or fuel_value == "Diesel":
                new_row = pd.DataFrame({
                    "Key": ["Working principle"],
                    "Value": ["Common Rail"]
                })
            elif fuel_value == "Gasoline / Electric" or fuel_value == "Gasoline":
                new_row = pd.DataFrame({
                    "Key": ["Working principle"],
                    "Value": ["Spark Ignition, 4-stroke"]
                })
            elif fuel_value == "Electric":
                new_row = pd.DataFrame({
                    "Key": ["Working principle"],
                    "Value": ["BEV"]
                })
            else:
                new_row = pd.DataFrame()  # En caso de que no coincida con nada

            if not new_row.empty:
                df = pd.concat([df, new_row], ignore_index=True)

        return df


                


    def _add_number_and_arrangement_of_cylinders(self, df: pd.DataFrame) -> pd.DataFrame:
        """Añade la clave 'Number and arrangement of cylinders' con el valor correspondiente."""
        if "Design type" in df["Key"].values:
            parts = [part.strip() for part in df[df["Key"] == "Design type"]["Value"].values[0].split("/")]
            cyl_value = parts[2] 

            if "Reihe" in parts[3]:
                new_value = f"{cyl_value}, in line"
            if "V" in parts[3]:
                new_value = f"{cyl_value}, in V"
            if "W" in parts[3]:
                new_value = f"{cyl_value}, in W"

            new_row = pd.DataFrame({
                "Key": ["Number and arrangement of cylinders"],
                "Value": [new_value]
            })

            df = pd.concat([df, new_row], ignore_index=True)

        return df            
    


    def _add_direct_injection(self, df: pd.DataFrame) -> pd.DataFrame:
        """Añade la clave 'Direct injection' con el valor correspondiente."""
        if "Design type" in df["Key"].values:
            parts = [part.strip() for part in df[df["Key"] == "Design type"]["Value"].values[0].split("/")]

            if "Reihe-Inj-T" in parts[3]:
                new_value = "Yes"
            else:
                new_value = "No"

            new_row = pd.DataFrame({
                "Key": ["Direct injection"],
                "Value": [new_value]
            })

            df = pd.concat([df, new_row], ignore_index=True)

        return df


    def _add_hybrid_electric_vecicle(self, df: pd.DataFrame) -> pd.DataFrame:
        """Nos dice si es hibrido o no"""

        if "Fuel" in df["Key"].values:
            fuel_value = df[df["Key"] == "Fuel"]["Value"].values[0]

            if "Diesel / Electric" in fuel_value or "Gasoline / Electric" in fuel_value:
                new_row = pd.DataFrame({
                    "Key": ["Hybrid [electric] vehicle"],
                    "Value": ["Yes"]
                })
            else:
                new_row = pd.DataFrame({
                    "Key": ["Hybrid [electric] vehicle"],
                    "Value": ["No"]
                })

            df = pd.concat([df, new_row], ignore_index=True)

        return df




                


                    



    def _process_mass_distribution(self, df: pd.DataFrame) -> pd.DataFrame:
        """Procesa y combina la información de distribución de masas."""
        key1 = "Distribution of this mass among the axles - 1"
        key2 = "Distribution of this mass among the axles - 2"

        if key1 in df["Key"].values and key2 in df["Key"].values:
            mass1_pair = df[df["Key"] == key1]["Value"].values[0]
            mass2_pair = df[df["Key"] == key2]["Value"].values[0]

            mass1 = self._get_max_from_pair(mass1_pair, '-')
            mass2 = self._get_max_from_pair(mass2_pair, '-')

            df = df[~df["Key"].isin([key1, key2])]

            new_row_1 = pd.DataFrame({
                "Key": ["Distribution of this mass among the axles – 1 / 2"],
                "Value": [f"{mass1}/{mass2}"]
            })
            df = pd.concat([df, new_row_1], ignore_index=True)

            new_row_2 = pd.DataFrame({
                "Key": ["Technically permissible max mass on each axle – 1 / 2"],
                "Value": [f"{mass1}/{mass2}"]
            })
            df = pd.concat([df, new_row_2], ignore_index=True)

        return df

    def _process_engine_manufacturer(self, df: pd.DataFrame) -> pd.DataFrame:
      """Obtiene la marca del motor"""
      if "Brand / Type" in df["Key"].values:
        brandType = df[df["Key"] == "Brand / Type"]["Value"].values[0]

        brand = self._get_value_slash(brandType, 0)

        parts = [part.strip() for part in brandType.split("/")]
        type_Name = " / ".join(parts[1:])

        new_row = pd.DataFrame({
            "Key": ["Engine manufacturer"],
            "Value": [f"{brand}"]
        })
        df = pd.concat([df, new_row], ignore_index=True)

        new_row2 = pd.DataFrame({
              "Key": ["Engine code as marked on the enginee"],
              "Value": [f"{type_Name}"]
          })
        df = pd.concat([df, new_row2], ignore_index=True)

        df = df[~df["Key"].isin(["Brand / Type"])]
      return df


    def _process_transmission(self, df: pd.DataFrame) -> pd.DataFrame:
        """Procesa la información de transmission y agrega nuevos registros según el formato especificado.

        Casos contemplados:
          1. Formato 'mXa': se interpreta como Dual clutch (automatico). Se extrae el número X.
            - 28. Clutch /type => "Dual clutch"
            - 29. Gearbox (type) => "Automatic"
            - 29.1 Gear: => número X

          2. Formato 'aX': se interpreta como Single plate dry (automatico). Se extrae el número X.
            - 28. Clutch /type => "Single plate dry"
            - 29. Gearbox (type) => "Automatic"
            - 29.1 Gear: => número X

          3. Formato 'mX': se interpreta como Single plate dry (manual).
            - 28. Clutch /type => "Single plate dry"
            - 29. Gearbox (type) => "Manual"
            - (No se agrega Gear)

          4. Valor 's': se interpreta como Continuously Variable (automatico) y se asigna gear 1.
            - 28. Clutch /type => "Continuously Variable"
            - 29. Gearbox (type) => "Automatic"
            - 29.1 Gear: => 1
        """
        if "Transmission/IA" in df["Key"].values:
            transmission = df[df["Key"] == "Transmission/IA"]["Value"].values[0]
            # Extraemos el primer segmento (suponiendo que es el que contiene la info relevante)
            transmission_spec = self._get_value_slash(transmission, 0).strip().lower()

            clutch_type = "Unknown"
            gearbox = "Unknown"
            gear = None

            # Caso 1: 'mXa' (ej: m8a)
            if re.match(r'^m(\d+)a$', transmission_spec):
                clutch_type = "Dual clutch"
                gearbox = "Automatic"
                match = re.match(r'^m(\d+)a$', transmission_spec)
                if match:
                    gear = int(match.group(1))
            # Caso 2: 'aX' (ej: a8)
            elif re.match(r'^a(\d+)$', transmission_spec):
                clutch_type = "Single plate dry"
                gearbox = "Automatic"
                match = re.match(r'^a(\d+)$', transmission_spec)
                if match:
                    gear = int(match.group(1))
            # Caso 3: 'mX' (ej: m6)
            elif re.match(r'^m(\d+)$', transmission_spec):
                clutch_type = "Single plate dry"
                gearbox = "Manual"
            # Caso 4: 's'
            elif transmission_spec == "s":
                clutch_type = "Continuously Variable"
                gearbox = "Automatic"
                gear = 1

            # Agregar registro para "28. Clutch /type"
            new_row_clutch = pd.DataFrame({
                "Key": ["Clutch"],
                "Value": [clutch_type]
            })
            df = pd.concat([df, new_row_clutch], ignore_index=True)

            # Agregar registro para "29. Gearbox (type)"
            new_row_gearbox = pd.DataFrame({
                "Key": ["Gearbox"],
                "Value": [gearbox]
            })
            df = pd.concat([df, new_row_gearbox], ignore_index=True)

            # Agregar registro para "29.1 Gear:" solo si se pudo extraer un número
            if gear is not None:
                new_row_gear = pd.DataFrame({
                    "Key": ["Gear"],
                    "Value": [str(gear)]
                })
                df = pd.concat([df, new_row_gear], ignore_index=True)

        return df





    def _process_maximum_speed(self, df: pd.DataFrame) -> pd.DataFrame:
      """
      Procesa la velocidad máxima según el tipo de transmisión.

      - Si "29. Gearbox (type)" es "Manual", extrae el valor que sigue a "mech" en "19 Vehicle VMax".
      - Si es "Automatic", extrae el valor que sigue a "autom" en "19 Vehicle VMax".
      - Finalmente, crea un nuevo registro con Key "Maximum speed" y el valor obtenido.
      """
      if "Gearbox" in df["Key"].values and "19 Vehicle VMax" in df["Key"].values:
          gearbox_val = df[df["Key"] == "Gearbox"]["Value"].values[0].strip().lower()
          vmax_val = df[df["Key"] == "19 Vehicle VMax"]["Value"].values[0]

          # Buscar los números asociados a 'mech' y 'autom'
          match_mech = re.search(r'mech\s*(\d+)', vmax_val, re.IGNORECASE)
          match_autom = re.search(r'autom\s*(\d+)', vmax_val, re.IGNORECASE)

          maximum_speed = None
          if gearbox_val == "manual" and match_mech:
              maximum_speed = match_mech.group(1)
          elif gearbox_val == "automatic" and match_autom:
              maximum_speed = match_autom.group(1)
          else:
              # En caso de no encontrarse el valor, se puede optar por asignar alguno o dejarlo en None.
              maximum_speed = "Desconocido"

          # Agregar el registro de "Maximum speed"
          new_row = pd.DataFrame({
              "Key": ["Maximum speed"],
              "Value": [maximum_speed]
          })
          df = pd.concat([df, new_row], ignore_index=True)

      return df

    def _process_emissions(self, df: pd.DataFrame) -> pd.DataFrame:
      """
      Procesa los registros de emisiones.

      - Si existe UN solo grupo de emisiones (una única entrada de "72 Emissions - Transmission"):
          Se recorre cada registro de emisión (por ejemplo, "72 Emissions - HC", "72 Emissions - CO", etc.)
          y se crea un nuevo registro con:
              Key: "Emissions <tipo>" (se remueve el prefijo "72 Emissions - " y cualquier sufijo en paréntesis)
              Value: el valor original.

      - Si existen DOS grupos (es decir, dos entradas de "72 Emissions - Transmission"):
          Se consulta el valor de "29. Gearbox (type)" y, según éste:
            • Si es "Manual", se seleccionan los registros que contengan "(mec)".
            • Si es "Automatic", se seleccionan los registros que contengan "(autom)".
          Luego se "limpia" la key removiendo el sufijo y se crea el nuevo registro.
      """
      new_rows = []

      # Contar cuántos registros de Transmission hay
      transmissions = df[df["Key"].str.contains("72 Emissions - Transmission", regex=False)]
      count_transmissions = len(transmissions)

      if count_transmissions == 1:
          # Solo hay un grupo: se procesan todos los registros de emisiones (excepto el de Transmission)
          for index, row in df.iterrows():
              key = row["Key"]
              if key.startswith("72 Emissions -") and "Transmission" not in key:
                  # Eliminar el prefijo "72 Emissions - " y quitar cualquier sufijo entre paréntesis
                  emission_type = re.sub(r'72 Emissions -\s*', '', key)
                  emission_type = re.sub(r'\s*\(.*\)', '', emission_type)
                  new_key = f"Emissions {emission_type}"
                  new_rows.append({"Key": new_key, "Value": row["Value"]})
      elif count_transmissions == 2:
          # Se consultará el valor del Gearbox para decidir qué grupo usar
          gearbox_row = df[df["Key"] == "Gearbox"]
          if not gearbox_row.empty:
              gearbox_val = gearbox_row["Value"].values[0].strip().lower()
              # Seleccionar el sufijo según el tipo de caja
              chosen_suffix = "(mec)" if gearbox_val == "manual" else "(autom)" if gearbox_val == "automatic" else ""
              for index, row in df.iterrows():
                  key = row["Key"]
                  if key.startswith("72 Emissions -") and chosen_suffix in key:
                      # Quitar el prefijo y el sufijo elegido
                      emission_type = re.sub(r'72 Emissions -\s*', '', key)
                      emission_type = emission_type.replace(chosen_suffix, "").strip()
                      new_key = f"Emissions {emission_type}"
                      new_rows.append({"Key": new_key, "Value": row["Value"]})

      # Se crean los nuevos registros y se concatenan al DataFrame original
      if new_rows:
          new_df = pd.DataFrame(new_rows)
          df = pd.concat([df, new_df], ignore_index=True)

      return df


    def _transform_emissions_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Transforma los valores de los registros limpios de emisiones:

        - Para cada fila cuyo Key comience con "Emissions", se toma el Value.
        - Si el valor numérico es 0.00, se reemplaza por "----".
        - En caso contrario, se divide el valor por 1000 y se formatea con 4 decimales.
        """
        # Filtrar filas cuyos registros comiencen con "Emissions"
        emissions_mask = df["Key"].str.startswith("Emissions")

        for idx in df[emissions_mask].index:
            valor = df.loc[idx, "Value"]
            try:
                # Convertir el valor a float
                num = float(valor)
                if num == 0.0:
                    df.loc[idx, "Value"] = "- - - -"
                else:
                    # Dividir el valor por 1000 y formatear a 4 decimales
                    nuevo_valor = num / 1000
                    df.loc[idx, "Value"] = f"{nuevo_valor:.4f}"
            except ValueError:
                # Si no se puede convertir a número, se deja el valor original
                continue
        return df





    def _process_drive_ratio(self, df: pd.DataFrame) -> pd.DataFrame:
        """Procesa la drive ratio"""
        if "Transmission/IA" in df["Key"].values:
            drive = df[df["Key"] == "Transmission/IA"]["Value"].values[0]

            drive_value = self._get_value_slash(drive, 1)

            # Si el valor extraído contiene un "+", tomar solo el primer número antes del "+"
            drive_value = drive_value.split("+")[0].strip()

            # Reemplazar coma por punto
            drive_value = drive_value.replace(",", ".")

            new_row = pd.DataFrame({
                "Key": ["Final drive ratio"],
                "Value": [f"{drive_value}"]
            })
            df = pd.concat([df, new_row], ignore_index=True)
            df = df[~df["Key"].isin(["Transmission/IA"])]

        return df


    def _process_dimensions(self, df: pd.DataFrame) -> pd.DataFrame:
        """Procesa las dimensiones y extrae el primer número en caso de rango.
        El segundo número, si existe, se guarda como un 'remark' correspondiente.
        Si no existe, se guarda 'None' en el remark.
        """

        key_remark_map = {
            "Length": "remarks_6_1",
            "Width": "remarks_7_1",
            "Height": "remarks_8",
            "Rear overhang": "remarks_11",
            "Mass of the vehicle with bodywork in running order": "remarks_12"
        }

        for key, remark_key in key_remark_map.items():
            mask = df["Key"] == key
            values = df.loc[mask, "Value"].astype(str)

            for idx, val in values.items():
                parts = [p.strip() for p in val.split("-")]

                # Tomar primer número
                first_val = parts[0] if len(parts) > 0 else None
                df.at[idx, "Value"] = first_val

                # Tomar segundo número si existe, si no asignar None
                second_val = parts[1] if len(parts) > 1 else None

                # Agregar fila para remark
                new_row = pd.DataFrame({
                    "Key": [remark_key],
                    "Value": [second_val if second_val else "None"]
                })
                df = pd.concat([df, new_row], ignore_index=True)

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
DEFAULT_CONFIG_2 = VehicleDataConfig(
    column_mapping={
        "14 Axles/Wheels": "Number of axles / wheels",
        "16 Final drive": "Powered axles",
        "44 Distance axis 1-2": "Wheelbase",
        "47 Track Axis 1": "Axle(s) track – 1",
        "48 Track Axis 2": "Axle(s) track – 2",
        "40 Length": "Length",
        "41 Width": "Width",
        "42 Height": "Height",
        "43 Überhange f/b": "Rear overhang",
        "52 Netweight": "Mass of the vehicle with bodywork in running order",
        "Wet Weigh Kg": "Technically permissible maximum laden mass",
        "54 Axle guarantees v.": "Distribution of this mass among the axles - 1",
        "54 Axle guarantees b.": "Distribution of this mass among the axles - 2",
        "55 Roof load": "Maximum permissible roof load",
        "57 braked": "Braked trailer",
        "58 unbraked": "Unbraked trailer",
        "67 Support load": "Support load",
        "25 Brand / Type": "Brand / Type",
        "26 Design type": "Design type",
        "27 Capacity:": "Capacity",
        "28 Power / n": "Maximum net power",
        "18 Transmission/IA": "Transmission/IA",
        "Tow hitch": "EC type approval mark of couplind device if fitted",
        "Fuel code": "Fuel",

    },
    ordered_keys = MASTER_ORDERED_KEYS 

)

