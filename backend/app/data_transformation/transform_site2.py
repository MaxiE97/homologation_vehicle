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

class VehicleDataTransformer_site2:
    """Clase para transformar datos de vehículos."""

    def __init__(self, config: VehicleDataConfig):
        self.config = config

    def transform(self, df_input: pd.DataFrame) -> pd.DataFrame:
        """Método principal que orquesta la transformación de datos."""
        df = df_input.copy()
        df = self._rename_columns(df)

        df = self._add_powered_axles(df)
        df = self._process_dimensions(df)
        df = self._add_axle_track(df)
        df = self._add_rear_overhang(df)
        df = self._process_axles_distribution_maxmass(df)
        df = self._add_max_trailer_mass(df)
        df = self._add_max_coupling_load(df)
        df = self._process_engines(df)
        df = self._add_working_principle(df)
        df = self._add_direct_injection(df)
        df = self._add_electric_vehicle(df)
        df = self._add_hybrid_electric_vehicle(df)
        df = self._add_cylinders(df)
        df = self._add_max_power(df)
        df = self._process_transmission(df)
        df = self._add_final_drive_ratio(df)
        df = self._add_max_speed(df)
        df = self._add_coupling_approval(df)
        df = self._aux_emissions(df)
        df = self._process_emissions_values(df)



        df = self._add_missing_keys(df)
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


    def _add_missing_keys(self, df: pd.DataFrame) -> pd.DataFrame:
        """Añade información sobre claves faltantes, asegurando que se incluyan todas las ordered_keys."""
        missing_rows = [
            {"Key": key, "Value": "None"}
            for key in self.config.ordered_keys if key not in df["Key"].values
        ]
        if missing_rows:
            df = pd.concat([df, pd.DataFrame(missing_rows)], ignore_index=True)
        return df



 #-------------------------------------------------------Funciones           

#   "Powered axles": "powered_axles",                               # B2

    def _add_powered_axles(self, df: pd.DataFrame) -> pd.DataFrame:
        """Añade información sobre ejes motorizados."""
        if "powered_axles" in df["Key"].values:
          actual_value = df[df["Key"] == "powered_axles"]["Value"].values[0]

          if actual_value == "All-wheel drive":
            df.loc[df["Key"] == "powered_axles", "Value"] = "2"
          else:
            df.loc[df["Key"] == "powered_axles", "Value"] = "1"

        return df


 #   "Length": "length",                                             # B5
 #   "Width": "width",                                               # B6
 #   "Height": "height",                                             # B7
 #   "Rear overhang": "rear_overhang",                               # B8
 #   "Mass of the vehicle with bodywork in running order": "running_mass",          # B9
 #   "remarks_6_1": "remarks_6_1",                                   # A16
 #   "remarks_7_1": "remarks_7_1",                                   # A17
 #   "remarks_8": "remarks_8",                                       # A18
 #   "remarks_11": "remarks_11",                                     # A19
 #   "remarks_12": "remarks_12",                                     # A27

    def _process_dimensions(self, df: pd.DataFrame) -> pd.DataFrame:
        """Procesa las dimensiones y extrae el primer número en caso de rango.
        El segundo número, si existe, se guarda como un 'remark' correspondiente.
        Si no existe, se guarda 'None' en el remark.
        """

        key_remark_map = {
            "length": "remarks_6_1",
            "width": "remarks_7_1",
            "height": "remarks_8",
            "rear_overhang": "remarks_11",
            "running_mass": "remarks_12"
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



#    "Axle(s) track – 1 / 2": "axle_track",                          # B4

    def _add_axle_track(self, df: pd.DataFrame) -> pd.DataFrame:
        """Procesa y combina la información de los ejes."""
        if "Axle(s) track – 1" in df["Key"].values and "Axle(s) track – 2" in df["Key"].values:
            track1 = df[df["Key"] == "Axle(s) track – 1"]["Value"].values[0]
            track2 = df[df["Key"] == "Axle(s) track – 2"]["Value"].values[0]

            max_track1 = self._get_max_value(track1)
            max_track2 = self._get_max_value(track2)

            df = df[df["Key"] != "Axle(s) track – 2"]
            mask = df["Key"] == "Axle(s) track – 1"
            df.loc[mask, "Value"] = f"{max_track1}/{max_track2}"
            df.loc[mask, "Key"] = "axle_track"

        return df







#    "Rear overhang": "rear_overhang",                               # B8

    def _add_rear_overhang(self, df: pd.DataFrame) -> pd.DataFrame:
        """Procesa y combina la información de Rear overhang"""
        if "rear_overhang" in df["Key"].values:
            rear = df[df["Key"] == "rear_overhang"]["Value"].values[0]

            # elimina el primer "/" de "/ 869 - 869"
            rear = rear.split("/")[1]

            # guarda el nuevo valor
            df.loc[df["Key"] == "rear_overhang", "Value"] = rear


        return df


#    "Distribution of this mass among the axles – 1 / 2": "mass_distribution",      # B11
#    "Technically permissible max mass on each axle – 1 / 2": "max_axle_mass",      # B12

    def _process_axles_distribution_maxmass(self, df: pd.DataFrame) -> pd.DataFrame:
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
                "Key": ["mass_distribution"],
                "Value": [f"{mass1}/{mass2}"]
            })
            df = pd.concat([df, new_row_1], ignore_index=True)

            new_row_2 = pd.DataFrame({
                "Key": ["max_axle_mass"],
                "Value": [f"{mass1}/{mass2}"]
            })
            df = pd.concat([df, new_row_2], ignore_index=True)

        return df



#   "Maximum mass of trailer – braked / unbraked": "max_trailer_mass",             # B14

    def _add_max_trailer_mass(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Procesa y combina la información de masas del remolque,
        manteniendo los pares de valores originales separados por un guion,
        salvo que ambos pares sean 0 / 0.
        """
        if "Braked trailer" in df["Key"].values and "Unbraked trailer" in df["Key"].values:
            # Obtiene los valores originales (ej: "1100 / 1200")
            braked = df.loc[df["Key"] == "Braked trailer", "Value"].values[0]
            unbraked = df.loc[df["Key"] == "Unbraked trailer", "Value"].values[0]

            # Separa los pares en enteros
            braked_vals = [int(x.strip()) for x in braked.split("/")]
            unbraked_vals = [int(x.strip()) for x in unbraked.split("/")]

            # Verifica si ambos pares son 0 / 0
            if braked_vals == [0, 0] and unbraked_vals == [0, 0]:
                return df  # No se agrega nada nuevo

            # Construye el nuevo valor combinado
            combined_value = f"{braked_vals[0]}/{unbraked_vals[0]} - {braked_vals[1]}/{unbraked_vals[1]}"

            # Elimina las filas originales
            df = df[~df["Key"].isin(["Braked trailer", "Unbraked trailer"])]

            # Agrega la nueva fila
            new_row = pd.DataFrame({
                "Key": ["max_trailer_mass"],
                "Value": [combined_value]
            })

            df = pd.concat([df, new_row], ignore_index=True)

        return df



#    "Maximum vertical load at the coupling point for a trailer": "max_coupling_load", # B16


    def _add_max_coupling_load(self, df: pd.DataFrame) -> pd.DataFrame:
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
                "Key": ["max_coupling_load"],
                "Value": [f"{vertical_value_max}"]  # Resultado: "1000 / 1222"
            })

            df = pd.concat([df, new_row], ignore_index=True)

        return df


#    "Engine manufacturer": "engine_manufacturer",                                  # B17
#    "Engine code as marked on the enginee": "engine_code",                         # B18 


    def _process_engines(self, df: pd.DataFrame) -> pd.DataFrame:
      """Obtiene la marca del motor"""
      if "Brand / Type" in df["Key"].values:
        brandType = df[df["Key"] == "Brand / Type"]["Value"].values[0]

        brand = self._get_value_slash(brandType, 0)

        parts = [part.strip() for part in brandType.split("/")]
        type_Name = " / ".join(parts[1:])

        new_row = pd.DataFrame({
            "Key": ["engine_manufacturer"],
            "Value": [f"{brand}"]
        })
        df = pd.concat([df, new_row], ignore_index=True)

        new_row2 = pd.DataFrame({
              "Key": ["engine_code"],
              "Value": [f"{type_Name}"]
          })
        df = pd.concat([df, new_row2], ignore_index=True)

        df = df[~df["Key"].isin(["Brand / Type"])]
      return df


#    "Working principle": "working_principle",                                      # B19

    def _add_working_principle(self, df: pd.DataFrame) -> pd.DataFrame:
        """Añade la clave 'Working principle' con el valor correspondiente."""
        if "fuel" in df["Key"].values:
            fuel_value = df[df["Key"] == "fuel"]["Value"].values[0]

            if fuel_value == "Diesel / Electric" or fuel_value == "Diesel":
                new_row = pd.DataFrame({
                    "Key": ["working_principle"],
                    "Value": ["Common Rail"]
                })
            elif fuel_value == "Gasoline / Electric" or fuel_value == "Gasoline":
                new_row = pd.DataFrame({
                    "Key": ["working_principle"],
                    "Value": ["Spark Ignition, 4-stroke"]
                })
            elif fuel_value == "Electric":
                new_row = pd.DataFrame({
                    "Key": ["working_principle"],
                    "Value": ["BEV"]
                })
            else:
                new_row = pd.DataFrame()  # En caso de que no coincida con nada

            if not new_row.empty:
                df = pd.concat([df, new_row], ignore_index=True)

        return df

# B20: "Direct injection": "direct_injection",

    def _add_direct_injection(self, df: pd.DataFrame) -> pd.DataFrame:
        """Añade la clave 'direct_injection' con el valor correspondiente,
        manejando posibles variaciones en el formato de 'Design type'."""

        if "Design type" in df["Key"].values:
            mask = df["Key"] == "Design type"
            design_type_value = df.loc[mask, "Value"].iloc[0] # Usar .loc y .iloc[0] para mayor seguridad

            if pd.isna(design_type_value): # Manejar NaN
                return df

            parts = [part.strip() for part in str(design_type_value).split("/")]

            new_value = "No" # Inicializar con un valor por defecto

            # Verificar si hay suficientes partes antes de acceder a parts[3]
            if len(parts) > 3 and "Reihe-Inj-T" in parts[3]:
                new_value = "Yes"
            # else: new_value ya es "No" por defecto

            new_row = pd.DataFrame({
                "Key": ["direct_injection"],
                "Value": [new_value]
            })

            df = pd.concat([df, new_row], ignore_index=True)

        return df


#    "Pure electric": "pure_electric",                                              # B21    
    def _add_electric_vehicle(self, df: pd.DataFrame) -> pd.DataFrame:
            """Añade la clave 'Electric vehicle' con el valor correspondiente."""
            if "fuel" in df["Key"].values:
                fuel_value = df[df["Key"] == "fuel"]["Value"].values[0]

                if fuel_value == "Electric":
                    new_row = pd.DataFrame({
                        "Key": ["pure_electric"],
                        "Value": ["Yes"]
                    })
                else:
                    new_row = pd.DataFrame({
                        "Key": ["pure_electric"],
                        "Value": ["No"]
                    })

                df = pd.concat([df, new_row], ignore_index=True)

            return df        
    

#    "Hybrid [electric] vehicle": "hybrid",                                         # B22

    def _add_hybrid_electric_vehicle(self, df: pd.DataFrame) -> pd.DataFrame:
        """Nos dice si es hibrido o no"""

        if "fuel" in df["Key"].values:
            fuel_value = df[df["Key"] == "fuel"]["Value"].values[0]

            if "Diesel / Electric" in fuel_value or "Gasoline / Electric" in fuel_value:
                new_row = pd.DataFrame({
                    "Key": ["hybrid"],
                    "Value": ["Yes"]
                })
            else:
                new_row = pd.DataFrame({
                    "Key": ["hybrid"],
                    "Value": ["No"]
                })

            df = pd.concat([df, new_row], ignore_index=True)

        return df

# B23: "Number and arrangement of cylinders": "cylinders",

    def _add_cylinders(self, df: pd.DataFrame) -> pd.DataFrame:
        """Añade la clave 'cylinders' con el valor correspondiente,
        manejando posibles variaciones en el formato de 'Design type'."""

        if "Design type" in df["Key"].values:
            mask = df["Key"] == "Design type"
            design_type_value = df.loc[mask, "Value"].iloc[0]

            if pd.isna(design_type_value):
                return df

            parts = [part.strip() for part in str(design_type_value).split("/")]

            cyl_value = "N/A" # Valor por defecto para los cilindros
            new_value = "Unknown" # Valor por defecto para la descripción completa

            # Verificar si hay suficientes partes antes de acceder a parts[2] y parts[3]
            if len(parts) > 2: # Necesitamos al menos 3 partes para parts[2]
                cyl_value = parts[2]

                if len(parts) > 3: # Necesitamos al menos 4 partes para parts[3]
                    if "Reihe" in parts[3]:
                        new_value = f"{cyl_value}, in line"
                    elif "V" in parts[3]:
                        new_value = f"{cyl_value}, in V"
                    elif "W" in parts[3]:
                        new_value = f"{cyl_value}, in W"
                    # Si ninguna coincide, new_value sigue siendo "Unknown"
                else:
                    # Si no hay parts[3], solo podemos usar el valor de cilindros
                    new_value = str(cyl_value) # Convertir a str por si cyl_value es un número

            # Si 'cyl_value' no pudo ser extraído (len(parts) <= 2), 'new_value' permanece "Unknown"

            new_row = pd.DataFrame({
                "Key": ["cylinders"],
                "Value": [new_value]
            })

            df = pd.concat([df, new_row], ignore_index=True)

        return df  
    

#   "Maximum net power": "max_power",                                              # B26

    def _add_max_power(self, df: pd.DataFrame) -> pd.DataFrame:
        """Procesa y combina la información la capacidad maxima."""
        if "max_power" in df["Key"].values:
            power = df[df["Key"] == "max_power"]["Value"].values[0]

            num1 = float(self._get_value_slash(power, 0))
            num2 = float(self._get_value_slash(power, 1))

            num1 = int(num1) if num1.is_integer() else num1
            num2 = int(num2) if num2.is_integer() else num2


            new_value = f"{num1}/{num2}"


            df.loc[df["Key"] == "max_power", "Value"] = new_value

        return df
    

    

#    "Clutch": "clutch_type",                                                       # B27
#    "Gearbox": "gearbox_type",                                                     # B28
#    "Gear": "gear",                                                                # B29

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
                match = re.match(r'^m(\d+)$', transmission_spec)
                if match:
                    gear = int(match.group(1))
            # Caso 4: 's'
            elif transmission_spec == "s":
                clutch_type = "Continuously Variable"
                gearbox = "Automatic"
                gear = 1

            # Agregar registro para "28. Clutch /type"
            new_row_clutch = pd.DataFrame({
                "Key": ["clutch_type"],
                "Value": [clutch_type]
            })
            df = pd.concat([df, new_row_clutch], ignore_index=True)

            # Agregar registro para "29. Gearbox (type)"
            new_row_gearbox = pd.DataFrame({
                "Key": ["gearbox_type"],
                "Value": [gearbox]
            })
            df = pd.concat([df, new_row_gearbox], ignore_index=True)

            # Agregar registro para "29.1 Gear:" solo si se pudo extraer un número
            if gear is not None:
                new_row_gear = pd.DataFrame({
                    "Key": ["gear"],
                    "Value": [str(gear)]
                })
                df = pd.concat([df, new_row_gear], ignore_index=True)

        return df


#    "Final drive ratio": "final_drive_ratio",                                      # B30

    def _add_final_drive_ratio(self, df: pd.DataFrame) -> pd.DataFrame:
        """Procesa la drive ratio"""
        if "Transmission/IA" in df["Key"].values:
            drive = df[df["Key"] == "Transmission/IA"]["Value"].values[0]

            drive_value = self._get_value_slash(drive, 1)

            # Si el valor extraído contiene un "+", tomar solo el primer número antes del "+"
            drive_value = drive_value.split("+")[0].strip()

            # Reemplazar coma por punto
            drive_value = drive_value.replace(",", ".")

            new_row = pd.DataFrame({
                "Key": ["final_drive_ratio"],
                "Value": [f"{drive_value}"]
            })
            df = pd.concat([df, new_row], ignore_index=True)
            df = df[~df["Key"].isin(["Transmission/IA"])]

        return df

#   "EC type approval mark of couplind device if fitted": "coupling_approval",     # B40

    def _add_coupling_approval(self, df: pd.DataFrame) -> pd.DataFrame:
        """Añade la clave 'coupling_approval' con el valor correspondiente."""
        if "Remark 56" in df["Key"].values:            
            coupling_value = df[df["Key"] == "Remark 56"]["Value"].values[0]
            #Utiliza la funcion extract_marks_simple para extraer el valor de Remark 56
            coupling_value = self.extract_marks_simple(coupling_value)

            new_row = pd.DataFrame({
                "Key": ["coupling_approval"],
                "Value": [coupling_value]
            })
            df = pd.concat([df, new_row], ignore_index=True)

        return df


    @staticmethod
    def extract_marks_simple(text: str) -> str:
        claves = [
            'Konformitätszeichen',
            'Genehmigungszeichen',
            'Genehmigungsnummer'
        ]
        resultados: List[str] = []

        # 1) Si hay alguna clave, extraer desde la clave hasta 3 espacios consecutivos o fin de línea
        for clave in claves:
            patron_clave = re.compile(
                rf'{re.escape(clave)}\s*[:\-]?\s*(.+?)(?=\s{{3,}}|$)',
                flags=re.IGNORECASE
            )
            for frag in patron_clave.findall(text):
                frag_limpio = frag.strip()
                if frag_limpio:
                    resultados.append(frag_limpio)

        # 2) Si NO encontramos nada con clave, aplicar regex general
        if not resultados:
            # Empieza por e/E + dígitos, captura todo hasta 3 espacios o final de línea
            patron_global = re.compile(r'\b[eE]\d+.*?(?=\s{3,}|$)')
            for m in patron_global.findall(text):
                cad = m.strip()
                # Verificar longitud mínima para evitar falsos positivos
                if len(cad) > 4:
                    resultados.append(cad)

        # 3) Si no hubo nada en ninguno de los dos pasos, devolvemos cadena vacía
        if not resultados:
            return ''

        # Quitar duplicados manteniendo orden
        vistos = set()
        unicos: List[str] = []
        for r in resultados:
            if r not in vistos:
                vistos.add(r)
                unicos.append(r)


        return ', '.join(unicos) if resultados else "Check on website"


#    "Maximum speed": "max_speed",                                                  # B41


    def _add_max_speed(self, df: pd.DataFrame) -> pd.DataFrame:
      """
      Procesa la velocidad máxima según el tipo de transmisión.

      - Si "29. Gearbox (type)" es "Manual", extrae el valor que sigue a "mech" en "19 Vehicle VMax".
      - Si es "Automatic", extrae el valor que sigue a "autom" en "19 Vehicle VMax".
      - Finalmente, crea un nuevo registro con Key "Maximum speed" y el valor obtenido.
      """

            
      if "gearbox_type" in df["Key"].values and "19 Vehicle VMax" in df["Key"].values:
          gearbox_val = df[df["Key"] == "gearbox_type"]["Value"].values[0].strip().lower()
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
               if df[df["Key"] == "fuel"]["Value"].values[0] == "Electric":
                  maximum_speed = match_mech.group(1)
               else:
                  maximum_speed = "-"

          # Agregar el registro de "Maximum speed"
          new_row = pd.DataFrame({
              "Key": ["max_speed"],
              "Value": [maximum_speed]
          })
          df = pd.concat([df, new_row], ignore_index=True)

      return df




    def _aux_emissions(self, df: pd.DataFrame) -> pd.DataFrame:
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
          gearbox_row = df[df["Key"] == "gearbox_type"]
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



# B46: "Emissions CO": "co_emissions",
# B47: "Emissions HC": "hc_emissions",
# B48: "Emissions NOx": "nox_emissions",
# B49: "Emissions HC NOx": "hc_nox_emissions",
# B50: "Emissions particulates": "particulates",

    def _process_emissions_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Transforma y renombra los valores de los registros de emisiones.

        - Renombra las claves de emisiones según un mapeo interno.
        - Para cada fila de emisión renombrada, se toma el Value.
        - Si el valor numérico es 0.00, se reemplaza por "----".
        - En caso contrario, se divide el valor por 1000 y se formatea con 4 decimales.
        """
        # Mapeo interno para las claves de emisión
        emissions_key_mapping = {
            "Emissions CO": "co_emissions",
            "Emissions HC": "hc_emissions",
            "Emissions NOx": "nox_emissions",
            "Emissions HC NOx": "hc_nox_emissions",
            "Emissions PM": "particulates",
        }

        # Aplicar el mapeo de claves antes de procesar los valores
        # Esto asegura que operamos en las claves finales
        for old_key, new_key in emissions_key_mapping.items():
            if old_key in df["Key"].values:
                # Encuentra la máscara para la clave antigua
                mask_old = df["Key"] == old_key
                # Asigna la nueva clave
                df.loc[mask_old, "Key"] = new_key

        # Ahora, procesar los valores para las claves ya renombradas
        # Filtrar filas cuyas claves renombradas comiencen con "co_", "hc_", "nox_", "particulates"
        # o directamente las nuevas claves si no quieres depender del prefijo
        # Aquí es importante ser específico si "Emissions" ya no está en la clave
        emissions_processed_mask = df["Key"].isin(emissions_key_mapping.values())

        for idx in df[emissions_processed_mask].index:
            valor = df.loc[idx, "Value"]
            try:
                # Convertir el valor a float
                num = float(valor)
                if num == 0.0:
                    df.loc[idx, "Value"] = "- - - -"
                else:
                    #Si no es particulates entonces dividir el valor por 1000 y formatear a 5 decimales
                    if "particulates" == df.loc[idx, "Key"]:
                        nuevo_valor = num / 1000
                        df.loc[idx, "Value"] = f"{nuevo_valor:.5f}"
                    else:    
                        nuevo_valor = num / 1000
                        df.loc[idx, "Value"] = f"{nuevo_valor:.4f}"
            except (ValueError, TypeError): # Añadido TypeError para manejar mejor NaN o non-numeric
                # Si no se puede convertir a número, se deja el valor original
                continue
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
    #Bxx    
        "14 Axles/Wheels": "axles",
        "16 Final drive": "powered_axles",
        "27 Capacity:": "capacity",
        "40 Length": "length",
        "41 Width": "width",
        "42 Height": "height",
        "43 Überhange f/b": "rear_overhang",
        "44 Distance axis 1-2": "wheelbase",
        "52 Netweight": "running_mass",
        "Wet Weigh Kg": "max_mass",
        "55 Roof load": "max_roof_load",
        "28 Power / n": "max_power",
        "Fuel code": "fuel",
        "Tow hitch": "coupling_approval",



    #Intermedio
        "47 Track Axis 1": "Axle(s) track – 1",
        "48 Track Axis 2": "Axle(s) track – 2",
        "54 Axle guarantees v.": "Distribution of this mass among the axles - 1",
        "54 Axle guarantees b.": "Distribution of this mass among the axles - 2",
        "57 braked": "Braked trailer",
        "58 unbraked": "Unbraked trailer",
        "67 Support load": "Support load",
        "25 Brand / Type": "Brand / Type",
        "26 Design type": "Design type",
        "18 Transmission/IA": "Transmission/IA",

    },
    ordered_keys = MASTER_ORDERED_KEYS 

)

