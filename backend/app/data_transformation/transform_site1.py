import pandas as pd
from typing import Dict, List, Optional
from dataclasses import dataclass
import re
from .master_keys import MASTER_ORDERED_KEYS
from decimal import Decimal




@dataclass
class VehicleDataConfig:
    """Configuración para la transformación de datos del vehículo."""
    column_mapping: Dict[str, str]
    ordered_keys: List[str]

class VehicleDataTransformer_site1:
    """Clase para transformar datos de vehículos."""

    def __init__(self, config: VehicleDataConfig):
        self.config = config

    def transform(self, df_input: pd.DataFrame) -> pd.DataFrame:
        """Método principal que orquesta la transformación de datos."""
        df = df_input.copy()
        df = self._rename_columns(df)
        df = self.clean_values(df)
        df = self.process_make_commercial_name(df)
        df = self._add_axles(df)
        df = self._add_axle_track(df)
        df = self._process_axles_distribution_maxmass(df)
        df = self._add_max_trailer_mass(df)
        df = self._add_emissions_standard(df)
        df = self._add_emissions_exhaust(df)
        df = self._add_particulates(df)
        df = self._add_smoke_absorption(df)
        df = self._add_noise_stationary(df)
        df = self._process_nedc_values_co2(df)
        df = self._process_nedc_values_fuel(df)
        df = self._process_wltp_co_values(df)
        df = self._process_wltp_fuel_consumption_values(df)
        df = self._process_remarks_electric(df)
        df = self._add_power_consumption(df)
        df = self._process_electric_range(df)

        df = self._add_missing_keys(df)




        df = self._sort_and_clean(df)
        return df

    def _rename_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Renombra las columnas según el mapeo configurado."""
        df["Key"] = df["Key"].map(lambda x: self.config.column_mapping.get(x, x))
        return df


#    "make",                                                   # A1
#    "commercial_name",                                        # A5

    def process_make_commercial_name(self, df: pd.DataFrame) -> pd.DataFrame:
        """Procesa y renombra las columnas 'make' y 'commercial_name'."""
        if "make" in df["Key"].values:
            #transformar valor en mayúsculas
            df.loc[df["Key"] == "make", "Value"] = df.loc[df["Key"] == "make", "Value"].str.upper()

        if "commercial_name" in df["Key"].values:
            #transformar valor en mayúsculas
            df.loc[df["Key"] == "commercial_name", "Value"] = df.loc[df["Key"] == "commercial_name", "Value"].str.upper()

        return df

    
#    "Number of axles / wheels": "axles",                            # B1

    def _add_axles(self, df: pd.DataFrame) -> pd.DataFrame:
        """Procesa y combina la información de los ejes y ruedas."""
        if "wheel" in df["Key"].values:
            wheel = df[df["Key"] == "wheel"]["Value"].values[0]

            new_value = f"{2}/{wheel}"

            new_row = pd.DataFrame({
                    "Key": ["Number of axles / wheels"],
                    "Value": [f"{new_value}"]
                })

            df = pd.concat([df, new_row], ignore_index=True)
        return df





#   "Axle(s) track – 1 / 2": "axle_track",                          # B4

    def _add_axle_track(self, df: pd.DataFrame) -> pd.DataFrame:
        """Procesa y combina la información de las bases de los ejes."""
        if "Axle track  1" in df["Key"].values and "Axle track  2" in df["Key"].values:
          axle_1 = df[df["Key"] == "Axle track  1"]["Value"].values[0]
          axle_2 = df[df["Key"] == "Axle track  2"]["Value"].values[0]

          new_value = f"{axle_1}/{axle_2}"

          new_row = pd.DataFrame({
                  "Key": ["axle_track"],
                  "Value": [f"{new_value}"]
              })

          df = pd.concat([df, new_row], ignore_index=True)
        return df
    

#    "Distribution of this mass among the axles – 1 / 2": "mass_distribution",      # B11
#    "Technically permissible max mass on each axle – 1 / 2": "max_axle_mass",      # B12

    def _process_axles_distribution_maxmass(self, df: pd.DataFrame) -> pd.DataFrame:
        """Procesa y combina la información de la distribución de los ejes."""
        if "Distribution of this mass among the axles – 1" in df["Key"].values and "Distribution of this mass among the axles – 2" in df["Key"].values:
          axle_1 = df[df["Key"] == "Distribution of this mass among the axles – 1"]["Value"].values[0]
          axle_2 = df[df["Key"] == "Distribution of this mass among the axles – 2"]["Value"].values[0]

          new_value = f"{axle_1}/{axle_2}"

          new_row = pd.DataFrame({
                  "Key": ["mass_distribution"],
                  "Value": [f"{new_value}"]
              })

          df = pd.concat([df, new_row], ignore_index=True)

          new_row_2 = pd.DataFrame({
                  "Key": ["max_axle_mass"],
                  "Value": [f"{new_value}"]
              })

          df = pd.concat([df, new_row_2], ignore_index=True)


        return df



#   "Maximum mass of trailer – braked / unbraked": "max_trailer_mass",             # B14

    def _add_max_trailer_mass(self, df: pd.DataFrame) -> pd.DataFrame:
        """Procesa y combina la información del peso máximo del camión."""
        if "Braked" in df["Key"].values and "Unbraked" in df["Key"].values:
          braked = df[df["Key"] == "Braked"]["Value"].values[0]
          unbraked = df[df["Key"] == "Unbraked"]["Value"].values[0]

          new_value = f"{braked}/{unbraked}"

          new_row = pd.DataFrame({
                  "Key": ["max_trailer_mass"],
                  "Value": [f"{new_value}"]
              })
          df = pd.concat([df, new_row], ignore_index=True)

        return df

# "Stationary (dB(A)) at engine speed": "noise_stationary",                      # B42

    def _add_noise_stationary(self, df: pd.DataFrame) -> pd.DataFrame:
        """Crea un nuevo registro a partir de los registros 'Stationary' y 'Engine speed'.

        El nuevo registro tendrá:
          Key: "Stationary (dB(A)) at engine speed"
          Value: "<valor de Stationary> at <valor de Engine speed>"
        """
        # Filtra los registros correspondientes
        stationary_mask = df["Key"] == "Stationary"
        engine_mask = df["Key"] == "Engine speed"

        # Extrae los valores (se asume que cada registro es único)
        if not df.loc[stationary_mask, "Value"].empty and not df.loc[engine_mask, "Value"].empty:
            stationary_val = df.loc[stationary_mask, "Value"].iloc[0]
            engine_val = df.loc[engine_mask, "Value"].iloc[0]

            # Crea el nuevo registro con el formato solicitado
            new_value = f"{stationary_val} at {engine_val}"
            new_row = {"Key": "noise_stationary", "Value": new_value}

            # Agrega el nuevo registro al DataFrame
            df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        return df
    

#   "Emissions standard": "emissions_standard",                                    # B44

    def _add_emissions_standard(self, df: pd.DataFrame) -> pd.DataFrame:
        """Agrega la palabra EURO a la emisión estándar, priorizando valores numéricos."""

        emissions_op1 = None
        emissions_op2 = None

        if "Emissions_standard_op1" in df["Key"].values:
            emissions_op1 = df[df["Key"] == "Emissions_standard_op1"]["Value"].values[0].strip()
        if "Emissions_standard_op2" in df["Key"].values:
            emissions_op2 = df[df["Key"] == "Emissions_standard_op2"]["Value"].values[0].strip()

        # Lógica de prioridad
        emissions_value = None
        if emissions_op1 and emissions_op1 != "Z" and emissions_op1.isdigit():
            emissions_value = f"EURO {emissions_op1}"
        elif emissions_op2 and emissions_op2 != "Z" and emissions_op2.isdigit():
            emissions_value = f"EURO {emissions_op2}"
        elif emissions_op1 == "Z" and emissions_op2 == "Z":
            emissions_value = "EURO Z"
        elif emissions_op1 and emissions_op1 != "Z":
            emissions_value = f"EURO {emissions_op1}"
        elif emissions_op2 and emissions_op2 != "Z":
            emissions_value = f"EURO {emissions_op2}"
        else:
            emissions_value = "EURO Z"  # Valor por defecto si todo falla

        # Agregar la fila al dataframe
        new_row = pd.DataFrame({
            "Key": ["emissions_standard"],
            "Value": [emissions_value]
        })
        df = pd.concat([df, new_row], ignore_index=True)

        return df



#   "Exhaust emission": "emissions_exhaust",                                       # B45

    def _add_emissions_exhaust(self, df: pd.DataFrame) -> pd.DataFrame:
      """Renombra la clave y convierte a mayúsculas el valor solo para los registros específicos."""
      mask = df["Key"] == "emissions_exhaust"
      df.loc[mask, "Key"] = "emissions_exhaust"
      df.loc[mask, "Value"] = df.loc[mask, "Value"].str.upper()
      return df
    

#    "Emissions particulates": "particulates",                                      # B50

    def _add_particulates(self, df: pd.DataFrame) -> pd.DataFrame:
        """Limpia el valor de 'Emissions particulates', eliminando 'g/km' y dividiendo por 1000.
        Si no existe el registro, lo crea con un valor de "0.00001" (como string).
        """
        mask_particulates = df["Key"] == "particulates"
        
        # Obtenemos el valor real de 'emissions_standard' del DataFrame.
        # Asumimos que '_add_emissions_standard' ya se ejecutó y agregó esta clave.
        emissions_standard_value = None
        emissions_standard_mask = df["Key"] == "emissions_standard"
        if emissions_standard_mask.any():
            emissions_standard_value = df.loc[emissions_standard_mask, "Value"].iloc[0]

        if mask_particulates.any():
            # Si 'particulates' existe, limpiamos el valor, lo redondeamos y lo convertimos a string
            if emissions_standard_value in ["EURO 1", "EURO 2", "EURO 3", "EURO 4"]:
                # Si el estándar de emisiones es EURO 1, 2, 3 o 4, solo eliminamos la unidad
                df.loc[mask_particulates, "Value"] = df.loc[mask_particulates, "Value"].str.replace(" g/km", "", regex=False)
            
            elif emissions_standard_value in ["EURO 5", "EURO 6"]: 
                df.loc[mask_particulates, "Value"] = df.loc[mask_particulates, "Value"].apply(self.ajustar_a_cinco_decimales)

            elif emissions_standard_value in ["EURO Z"]:
                df.loc[mask_particulates, "Value"] = "- - - -"

                                                 
        else:
            if emissions_standard_value in ["EURO Z"]:
                new_row = pd.DataFrame({"Key": ["particulates"], "Value": ["- - - -"]})
            else:    
                new_row = pd.DataFrame({"Key": ["particulates"], "Value": ["0.00001"]})

            df = pd.concat([df, new_row], ignore_index=True)

        return df

    @staticmethod
    def ajustar_a_cinco_decimales(valor):
        try:
            val = str(valor).replace(" g/km", "").strip()
            num = Decimal(val)

            # Convertimos a string y contamos la cantidad de decimales reales
            _, _, decimales = format(num, 'f').partition('.')
            cant_decimales = len(decimales)

            # Aplica la regla según la cantidad de decimales
            if cant_decimales == 1:
                num /= 10000
            elif cant_decimales == 2:
                num /= 1000
            elif cant_decimales == 3:
                num /= 100
            elif cant_decimales == 4:
                num /= 10
            # Si tiene 5 o más, lo dejamos igual

            # Formateamos como string con exactamente 5 decimales
            return f"{num:.5f}"
        except Exception:
            return valor  # Si algo falla, se devuelve el valor original



#    "Smoke": "smoke_absorption",                                                   # B51

    def _add_smoke_absorption(self, df: pd.DataFrame) -> pd.DataFrame:
        """Limpia el valor de 'Smoke', eliminando 'g/km' y formateándolo a 2 decimales."""
        if "smoke_absorption" in df["Key"].values:
            mask = df["Key"] == "smoke_absorption"
            df.loc[mask, "Value"] = df.loc[mask, "Value"].str.replace(" g/km", "", regex=False).astype(float).map("{:.2f}".format)
        return df



#   "Power consumption weighted/combined": "power_consumption",                    # B68
#   "Electric range": "electric_range",                                            # B69
#   "Electric range in city": "electric_range_city",                               # B70

    def _process_remarks_electric(self, df: pd.DataFrame) -> pd.DataFrame:
        """Limpia los datos de los remarks electric sacando el (num pk) y reemplazando coma decimal por punto"""
        for key in ["remark_electric_1", "remark_electric_2", "remark_electric_3"]:
            if key in df["Key"].values:
                df.loc[df["Key"] == key, "Value"] = (
                    df.loc[df["Key"] == key, "Value"]
                    .str.replace(r"\(.*?\)", "", regex=True)  # elimina (xxx pk)
                    .str.replace(",", ".", regex=False)       # reemplaza coma por punto decimal
                    .str.strip()                              # elimina espacios adicionales
                )
        return df




#    "NEDC CO2 combined": "co2_combined_nedc",                                      # B52
#    "NEDC CO2 extra-urban conditions": "co2_extra_urban_nedc",                     # B53
#    "NEDC CO2 urban conditions": "co2_urban_nedc",                                 # B54


    def _process_nedc_values_co2(self, df: pd.DataFrame) -> pd.DataFrame:
        """Limpia el valor de 'NEDC CO2 combined' eliminando 'g/km' y crea dos nuevos registros:
        - 'NEDC CO2 urban conditions' con el valor original + 12
        - 'NEDC CO2 extra-urban conditions' con el valor original - 12
        Los valores se mantienen como enteros.
        """
        mask = df["Key"] == "co2_combined_nedc"

        # Limpiamos el valor, eliminando " g/km", lo convertimos a float y luego a entero
        df.loc[mask, "Value"] = df.loc[mask, "Value"].str.replace(" g/km", "", regex=False).astype(float).astype(int)

        # Creamos los nuevos registros basándonos en el valor limpio
        new_rows = []
        for valor in df.loc[mask, "Value"]:
            new_rows.append({
                "Key": "co2_urban_nedc",
                "Value": int(valor + 12)
            })
            new_rows.append({
                "Key": "co2_extra_urban_nedc",
                "Value": int(valor - 12)
            })

        # Concatenamos los nuevos registros al DataFrame original
        df = pd.concat([df, pd.DataFrame(new_rows)], ignore_index=True)
        return df

#    "NEDC Fuel consumption combined": "fuel_combined_nedc",                        # B55
#    "NEDC Fuel consumption extra-urban conditions": "fuel_extra_urban_nedc",       # B56
#    "NEDC Fuel consumption urban conditions": "fuel_urban_nedc",                   # B57

    def _process_nedc_values_fuel(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Limpia el valor de los registros de consumo NEDC, asegurando formato string con un decimal.

        Para cada registro con key:
            - 'fuel_combined_nedc'
            - 'fuel_urban_nedc'
            - 'fuel_extra_urban_nedc'

        Si en el valor se encuentra la palabra "liter", extrae el número anterior,
        reemplaza la coma decimal por punto y lo convierte a número con un decimal como string.
        En caso de que el valor ya sea numérico (como en '7.4'), lo deja como string formateado.
        """
        nedc_keys = {
            "fuel_combined_nedc",
            "fuel_urban_nedc",
            "fuel_extra_urban_nedc"
        }

        keys_presentes = nedc_keys.intersection(set(df["Key"].unique()))
        if not keys_presentes:
            return df

        mask = df["Key"].isin(keys_presentes)

        def extract_value(text):
            try:
                if isinstance(text, str) and "liter" in text:
                    match = re.search(r'([\d,]+)\s*liter', text)
                    if match:
                        val = float(match.group(1).replace(",", "."))
                        return f"{val:.1f}"
                else:
                    val = float(text)
                    return f"{val:.1f}"
            except Exception:
                return text  # Devuelve el valor original si no se puede convertir

        df.loc[mask, "Value"] = df.loc[mask, "Value"].apply(extract_value)
        return df



 #   "WLTP CO2 combined": "co2_combined_wltp",                                       # B58
 #   "WLTP CO2 Maximum Value": "co2_maximum_value_wltp",                             # B59
 #   "WLTP CO2 High": "co2_high_wltp",                                               # B60
 #   "WLTP CO2 Medium": "co2_medium_wltp",                                           # B61
 #   "WLTP CO2 Low": "co2_low_wltp",                                                 # B62

    def _process_wltp_co_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Limpia el valor de 'co2_combined_wltp' eliminando ' g/km' y crea nuevos registros:
        """
        mask = df["Key"] == "co2_combined_wltp"   # SEGUIR CON OTROS VALORES CUANDO VENGA DE COMER 

        # Limpiar el valor eliminando " g/km" y convertirlo a entero
        df.loc[mask, "Value"] = df.loc[mask, "Value"].str.replace(" g/km", "", regex=False).astype(float).astype(int)

        # Obtener el/los valor(es) originales
        original_values = df.loc[mask, "Value"].tolist()
        new_rows = []
        for valor in original_values:
            new_rows.append({"Key": "co2_low_wltp", "Value": valor + 6})
            new_rows.append({"Key": "co2_medium_wltp", "Value": valor - 3})
            new_rows.append({"Key": "co2_high_wltp", "Value": valor - 6})
            new_rows.append({"Key": "co2_maximum_value_wltp", "Value": valor + 3})

        # Agregamos los nuevos registros al DataFrame original
        df = pd.concat([df, pd.DataFrame(new_rows)], ignore_index=True)
        return df

#    "WLTP Fuel consumption combined": "fuel_combined_wltp",                        # B63
#    "WLTP Fuel consumption Maximum Value": "fuel_maximum_value_wltp",              # B64
#    "WLTP Fuel consumption High": "fuel_high_wltp",                                # B65
#    "WLTP Fuel consumption Medium": "fuel_medium_wltp",                            # B66
#    "WLTP Fuel consumption Low": "fuel_low_wltp",                                  # B67
    def _process_wltp_fuel_consumption_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Limpia el valor de 'WLTP Fuel consumption combined', extrayendo el número antes de 'liter',
        reemplazando la coma decimal por punto y convirtiéndolo a string con un decimal fijo.
        Luego, crea nuevos registros derivados también como string.
        """
        mask = df["Key"] == "fuel_combined_wltp"

        def extract_value(text):
            try:
                if isinstance(text, str):
                    # Busca un número (con , o . decimal) seguido de 'liter' o 'g/km'
                    match = re.search(r'([\d.,]+)\s*(liter|g/km)', text)
                    if match:
                        val = float(match.group(1).replace(",", "."))
                        return f"{val:.1f}"
                # Si no contiene unidades conocidas, intenta convertir directamente
                val = float(str(text).replace(",", "."))
                return f"{val:.1f}"
            except Exception:
                return text

        # Limpia el valor original
        df.loc[mask, "Value"] = df.loc[mask, "Value"].apply(extract_value)

        # Genera nuevos registros derivados
        original_values = df.loc[mask, "Value"].tolist()
        new_rows = []
        for valor_str in original_values:
            try:
                valor = float(valor_str)
                new_rows.append({
                    "Key": "fuel_low_wltp",
                    "Value": f"{round(valor + 0.6, 1):.1f}"
                })
                new_rows.append({
                    "Key": "fuel_medium_wltp",
                    "Value": f"{round(valor - 0.3, 1):.1f}"
                })
                new_rows.append({
                    "Key": "fuel_high_wltp",
                    "Value": f"{round(valor - 0.6, 1):.1f}"
                })
                new_rows.append({
                    "Key": "fuel_maximum_value_wltp",
                    "Value": f"{round(valor + 0.3, 1):.1f}"
                })
            except Exception:
                continue  # En caso de error, no agregar nada

        df = pd.concat([df, pd.DataFrame(new_rows)], ignore_index=True)
        return df

 
#    "Power consumption weighted/combined": "power_consumption",                     # B68

    def _add_power_consumption(self, df: pd.DataFrame) -> pd.DataFrame:
        """Reemplaza la coma decimal por punto en los valores de 'power_consumption', si aplica."""
        if "power_consumption" in df["Key"].values:
            mask = df["Key"] == "power_consumption"
            def safe_replace(val):
                try:
                    return val.replace(",", ".")
                except AttributeError:
                    return val  # Si no es una cadena, devuelve el valor original
            df.loc[mask, "Value"] = df.loc[mask, "Value"].apply(safe_replace)
        return df

#    "Electric range": "electric_range",                                            # B69
#    "Electric range in city": "electric_range_city",                               # B70

    def _process_electric_range(self, df: pd.DataFrame) -> pd.DataFrame:
        """saca el km de los valores"""
        if "electric_range" in df["Key"].values:
            mask = df["Key"] == "electric_range"
            df.loc[mask, "Value"] = df.loc[mask, "Value"].str.replace(" km", "", regex=False)

        if "electric_range_city" in df["Key"].values:
            mask = df["Key"] == "electric_range_city"
            df.loc[mask, "Value"] = df.loc[mask, "Value"].str.replace(" km", "", regex=False)

        return df

    def clean_values(self, df: pd.DataFrame) -> pd.DataFrame:
        def process_value(value):
            if pd.isna(value):  # Manejar valores NaN
                return value


            # Eliminar puntos en unidades específicas (como "kg" o "cm³")
            for unit in ['kg', 'cm³', 'dB(A)','Wh/km']:
                if unit in value:
                    value = value.replace('.', '')
                    break

            # Eliminar espacios y otras unidades específicas
            for unit in ['kg', 'cm³', 'dB(A)','Wh/km']:
                if unit in value:
                    value = value.replace(unit, '').strip()


            # Convertir cm a mm usando regex
            if 'cm' in value:
                # Encuentra el número antes de "cm" y multiplica por 10
                value = re.sub(r'(\d+)(?:\.?\d*)\s*cm',
                              lambda m: str(int(float(m.group(1)) * 10)),
                              value)

            return value

        # Aplicar la transformación a la columna seleccionada
        df["Value"] = df["Value"].astype(str).apply(process_value)
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
DEFAULT_CONFIG_1 = VehicleDataConfig(
    column_mapping={

    #DATOS DE Axx 
        "Algemeen - Merk": "make",
        "Algemeen - Type": "type",
        "Algemeen - Variant": "variant",
        "Algemeen - Uitvoering": "version",
        "Algemeen - Model": "commercial_name",
        "Algemeen - Typegoedkeuringsnummer":"implication_number",
        "Brandstof #1 - Nominaal continu elektrisch vermogen": "remark_electric_1",
        "Brandstof #1 - Netto maximaal elektrisch vermogen": "remark_electric_2",
        "Brandstof #1 - Elektrisch vermogen over 60 minuten": "remark_electric_3",

        "Brandstof #2 - Nominaal continu elektrisch vermogen": "remark_electric_1",
        "Brandstof #2 - Netto maximaal elektrisch vermogen": "remark_electric_2",
        "Brandstof #2 - Elektrisch vermogen over 60 minuten": "remark_electric_3",

    #DATOS DE Bxx
        "Afmetingen - Wielbasis": "wheelbase",
        "Afmetingen - Lengte": "length",
        "Afmetingen - Breedte": "width",
        "Massa - Rijklaar gewicht": "running_mass",
        "Massa - Technisch limiet massa": "max_mass",
        "Massa - Maximum massa samenstelling": "max_combination_mass",
        "Motor - Aantal cilinders": "cylinders",
        "Motor - Cilinderinhoud": "capacity",
        "Brandstof #1 - Brandstof	": "fuel",
        "Brandstof #1 - Vermogen": "max_power",
        "Brandstof #1 - Milieuklasse licht": "emissions_exhaust",
        "Brandstof #1 - Roetuitstoot NEDC": "smoke_absorption",

        #Emisiones
        "Brandstof #1 - Uitstoot deeltjes licht NEDC": "particulates",                       # B50
        "Brandstof #1 - Uitstoot deeltjes WLTP": "particulates",                             # B50


        "Brandstof #1 - CO2-uitstoot gecombineerd NEDC": "co2_combined_nedc",                 # B52 
        "Brandstof #1 - CO2-uitstoot gewogen NEDC": "co2_combined_nedc",                      # B52 
        "Brandstof #2 - CO2-uitstoot gecombineerd NEDC": "co2_combined_nedc",                 # B52 
        "Brandstof #2 - CO2-uitstoot gewogen NEDC": "co2_combined_nedc",                      # B52 


        "Brandstof #1 - Brandstofverbruik gecombineerd NEDC": "fuel_combined_nedc",           # B55
        "Brandstof #1 - Brandstofverbruik op snelweg NEDC": "fuel_extra_urban_nedc",          # B56
        "Brandstof #1 - Brandstofverbruik in stad NEDC": "fuel_urban_nedc",                   # B57

        "Brandstof #1 - CO2-uitstoot gecombineerd WLTP": "co2_combined_wltp",                 # B58
        "Brandstof #1 - CO2-uitstoot gewogen WLTP": "co2_combined_wltp",                      # B58
        "Brandstof #2 - CO2-uitstoot gecombineerd WLTP": "co2_combined_wltp",                 # B58
        "Brandstof #2 - CO2-uitstoot gewogen WLTP": "co2_combined_wltp",                      # B58


        
        "Brandstof #1 - Brandstofverbruik gecombineerd WLTP": "fuel_combined_wltp",           # B63
        "Brandstof #1 - Brandstofverbruik gewogen WLTP": "fuel_combined_wltp",                # B63
        "Brandstof #2 - Brandstofverbruik gecombineerd WLTP": "fuel_combined_wltp",           # B63
        "Brandstof #2 - Brandstofverbruik gewogen WLTP": "fuel_combined_wltp",                # B63
        

        "Brandstof #1 - Geluidsniveau rijdend": "noise_drive_by",

        #68 69 70 Hibridos 
        "Brandstof #1 - Hybrideverbruik WLTP": "power_consumption",
        "Brandstof #1 - Hybride actieradius WLTP": "electric_range",
        "Brandstof #1 - Hybride actieradius in stad WLTP": "electric_range_city",
        "Brandstof #2 - Hybrideverbruik WLTP": "power_consumption",
        "Brandstof #2 - Hybride actieradius WLTP": "electric_range",
        "Brandstof #2 - Hybride actieradius in stad WLTP": "electric_range_city",

        #68 69 70 Electricos
        "Brandstof #1 - Elektriciteitsverbruik WLTP": "power_consumption",
        "Brandstof #1 - Elektrische actieradius WLTP": "electric_range",
        "Brandstof #1 - Elektrische actieradius in stad WLTP": "electric_range_city",
        "Brandstof #2 - Elektriciteitsverbruik WLTP": "power_consumption",
        "Brandstof #2 - Elektrische actieradius WLTP": "electric_range",
        "Brandstof #2 - Elektrische actieradius in stad WLTP": "electric_range_city",




    # INTERMEDIO 
        "Eigenschappen - Aantal wielen": "wheel", 
        "As #1 - Spoorbreedte": "Axle track  1",
        "As #2 - Spoorbreedte": "Axle track  2",
        "As #1 - Technisch limiet": "Distribution of this mass among the axles – 1",
        "As #2 - Technisch limiet": "Distribution of this mass among the axles – 2",
        "Trekkracht - Maximaal trekgewicht geremd":"Braked",
        "Trekkracht - Maximaal trekgewicht ongeremd":"Unbraked",
        "Brandstof #1 - Geluidsniveau stationair": "Stationary",
        "Brandstof #1 - Geluidsniveau toerental": "Engine speed",
        "Brandstof #1 - Emissieklasse": "Emissions_standard_op1",
        "Brandstof #2 - Emissieklasse": "Emissions_standard_op2",



        
    },

    ordered_keys= MASTER_ORDERED_KEYS
)



   