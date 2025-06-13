# backend/app/data_transformation/key_map.py

"""
Este diccionario traduce la clave interna y consistente del backend a la 'key' 
programática del campo en el frontend.
Esta estrategia es más robusta y preferible al mapeo por etiquetas de UI.
Cada clave tiene su código de referencia (Axx/Bxx) de la planilla original.
"""

FINAL_KEY_MAP = {
    # --- MAPEO COMPLETO DE CLAVES ---
    # Formato: { "Clave_Interna_Backend": "key_de_campo_frontend" }

    # --- CLAVES DE IDENTIFICACIÓN ---
    "CdS": "CdS",                                                   # A23
    "remark_electric_1": "remark_electric_1",                       # A24
    "remark_electric_2": "remark_electric_2",                       # A25
    "remark_electric_3": "remark_electric_3",                       # A26
    "remarks_12": "remarks_12",                                     # A27

    "Make": "make",                                                 # A1
    "Type": "type",                                                 # A2
    "Variant": "variant",                                           # A3
    "Version": "version",                                           # A4
    "Commercial name": "commercial_name",                           # A5
    "Category": "category",                                         # A6
    "manufacturer_base_vehicle": "manufacturer_base_vehicle",       # A7
    "manufacturer_address_line1": "manufacturer_address_line1",     # A8
    "manufacturer_address_line2": "manufacturer_address_line2",     # A9
    "manufacturer_address_line3": "manufacturer_address_line3",     # A10
    "implication_number": "implication_number",                     # A11 
    "vin_location": "vin_location",                                 # A12
    "Homologation number": "vin",                                   # A13 
    "type_described": "type_described",                             # A14
    "date": "date",                                                 # A15
    "remarks_6_1": "remarks_6_1",                                   # A16
    "remarks_7_1": "remarks_7_1",                                   # A17
    "remarks_8": "remarks_8",                                       # A18
    "remarks_11": "remarks_11",                                     # A19
    "alternative_type_1": "alternative_type_1",                     # A20
    "alternative_type_2": "alternative_type_2",                     # A21
    "alternative_type_3": "alternative_type_3",                     # A22

    # --- CLAVES DE DIMENSIONES ---
    "Number of axles / wheels": "axles",                            # B1
    "Powered axles": "powered_axles",                               # B2
    "Wheelbase": "wheelbase",                                       # B3
    "Axle(s) track – 1 / 2": "axle_track",                          # B4
    "Length": "length",                                             # B5
    "Width": "width",                                               # B6
    "Height": "height",                                             # B7
    "Rear overhang": "rear_overhang",                               # B8

    # --- CLAVES DE MASAS ---
    "Mass of the vehicle with bodywork in running order": "running_mass",          # B9
    "Technically permissible maximum laden mass": "max_mass",                      # B10
    "Distribution of this mass among the axles – 1 / 2": "mass_distribution",      # B11
    "Technically permissible max mass on each axle – 1 / 2": "max_axle_mass",      # B12
    "Maximum permissible roof load": "max_roof_load",                              # B13
    "Maximum mass of trailer – braked / unbraked": "max_trailer_mass",             # B14
    "Maximum mass of combination": "max_combination_mass",                         # B15
    "Maximum vertical load at the coupling point for a trailer": "max_coupling_load", # B16
    
    # --- CLAVES DE MOTOR ---
    "Engine manufacturer": "engine_manufacturer",                                  # B17
    "Engine code as marked on the enginee": "engine_code",                         # B18 
    "Working principle": "working_principle",                                      # B19
    "Direct injection": "direct_injection",                                        # B20
    "Pure electric": "pure_electric",                                              # B21
    "Hybrid [electric] vehicle": "hybrid",                                         # B22
    "Number and arrangement of cylinders": "cylinders",                            # B23
    "Capacity": "capacity",                                                        # B24
    "Fuel": "fuel",                                                                # B25
    "Maximum net power": "max_power",                                              # B26
    
    # --- CLAVES DE TRANSMISIÓN Y CHASIS ---
    "Clutch": "clutch_type",                                                       # B27
    "Gearbox": "gearbox_type",                                                     # B28
    "Gear": "gear",                                                                # B29
    "Final drive ratio": "final_drive_ratio",                                      # B30
    "Tyres on wheels 1": "tyres_wheels_1",                                         # B31
    "Tyres on wheels 2": "tyres_wheels_2",                                         # B32
    "Steering, method of assistance": "steering_assistance",                       # B33
    "Suspension": "braking_system_1",                                              # B34
    "Brakes": "braking_system_2",                                                  # B35

    # --- CLAVES DE CARROCERÍA Y CARACTERÍSTICAS ---
    "Type of body": "body_type",                                                   # B36
    "Color vehicle": "vehicle_color",                                              # B37
    "Number and configuration of doors": "doors_config",                           # B38
    "Number and position of seats": "seats_config",                                # B39
    "EC type approval mark of couplind device if fitted": "coupling_approval",     # B40
    "Maximum speed": "max_speed",                                                  # B41

    # --- CLAVES DE EMISIONES Y REGULACIONES ---
    "Stationary (dB(A)) at engine speed": "noise_stationary",                      # B42
    "Drive by": "noise_drive_by",                                                  # B43
    "Emissions standard": "emissions_standard",                                    # B44
    "Exhaust emission": "emissions_exhaust",                                       # B45
    "Emissions CO": "co_emissions",                                                # B46
    "Emissions HC": "hc_emissions",                                                # B47
    "Emissions NOx": "nox_emissions",                                              # B48
    "Emissions HC NOx": "hc_nox_emissions",                                        # B49
    "Emissions particulates": "particulates",                                      # B50
    "Smoke": "smoke_absorption",                                                   # B51

    # --- CLAVES DE CONSUMO Y EFICIENCIA - NEDC ---
    "NEDC CO2 urban conditions": "co2_urban_nedc",                                 # B54
    "NEDC CO2 extra-urban conditions": "co2_extra_urban_nedc",                     # B53
    "NEDC CO2 combined": "co2_combined_nedc",                                      # B52
    "NEDC Fuel consumption urban conditions": "fuel_urban_nedc",                   # B57
    "NEDC Fuel consumption extra-urban conditions": "fuel_extra_urban_nedc",       # B56
    "NEDC Fuel consumption combined": "fuel_combined_nedc",                        # B55
    
    # --- CLAVES DE CONSUMO Y EFICIENCIA - WLTP ---
    "WLTP CO2 Low": "co2_low_wltp",                                                 # B62
    "WLTP CO2 Medium": "co2_medium_wltp",                                           # B61
    "WLTP CO2 High": "co2_high_wltp",                                               # B60
    "WLTP CO2 Maximum Value": "co2_maximum_value_wltp",                             # B59
    "WLTP CO2 combined": "co2_combined_wltp",                                      # B58
    "WLTP Fuel consumption Low": "fuel_low_wltp",                                  # B67
    "WLTP Fuel consumption Medium": "fuel_medium_wltp",                            # B66
    "WLTP Fuel consumption High": "fuel_high_wltp",                                # B65
    "WLTP Fuel consumption Maximum Value": "fuel_maximum_value_wltp",              # B64
    "WLTP Fuel consumption combined": "fuel_combined_wltp",                        # B63

    # --- CLAVES DE VEHÍCULOS ELÉCTRICOS ---
    "Power consumption weighted/combined": "power_consumption",                    # B68
    "Electric range": "electric_range",                                            # B69
    "Electric range in city": "electric_range_city",                               # B70
}