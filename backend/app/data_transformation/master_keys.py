# This is now the single source of truth for all data keys for the frontend.

MASTER_ORDERED_KEYS = [

    # CLAVES DE IDENTIFICACIÓN
    "CdS",
    "remark_electric_1",
    "remark_electric_2",
    "remark_electric_3",
    "make",
    "type",
    "variant",
    "version",
    "commercial_name",
    "category",
    "manufacturer_base_vehicle",
    "manufacturer_address_line1",
    "manufacturer_address_line2",
    "manufacturer_address_line3",
    "vin",                         #13 sale en el lugar del 11, el vin es el 11
    "vin_location",
    "implication_number", 
    "type_described",
    "date",
    "remarks_6_1",
    "remarks_7_1",
    "remarks_8",
    "remarks_11",
    "remarks_12",
    "alternative_type_1",
    "alternative_type_2",
    "alternative_type_3",

    # CLAVES DE DIMENSIONES
    "axles",
    "powered_axles",
    "wheelbase",
    "axle_track",
    "length",
    "width",
    "height",
    "rear_overhang",

    # CLAVES DE MASAS
    "running_mass",
    "max_mass",
    "mass_distribution",
    "max_axle_mass",
    "max_roof_load",
    "max_trailer_mass",
    "max_combination_mass",
    "max_coupling_load",
    
    # CLAVES DE MOTOR
    "engine_manufacturer",
    "engine_code",
    "working_principle",
    "direct_injection",
    "pure_electric",
    "hybrid",
    "cylinders",
    "capacity",
    "fuel",
    "max_power",
    
    # CLAVES DE TRANSMISIÓN Y CHASIS
    "clutch_type",
    "gearbox_type",
    "gear",
    "final_drive_ratio",
    "tyres_wheels_1",
    "tyres_wheels_2",
    "steering_assistance",
    "braking_system_1", 
    "braking_system_2", 

    # CLAVES DE CARROCERÍA Y CARACTERÍSTICAS
    "body_type",
    "vehicle_color",
    "doors_config",
    "seats_config",
    "coupling_approval",
    "max_speed",

    # CLAVES DE EMISIONES Y REGULACIONES
    "noise_stationary",
    "noise_drive_by",
    "emissions_standard",
    "emissions_exhaust",
    "co_emissions",
    "hc_emissions",
    "nox_emissions",
    "hc_nox_emissions",
    "particulates",
    "smoke_absorption",

    # CLAVES DE CONSUMO Y EFICIENCIA - NEDC
    "co2_urban_nedc",
    "co2_extra_urban_nedc",
    "co2_combined_nedc",
    "fuel_urban_nedc",
    "fuel_extra_urban_nedc",
    "fuel_combined_nedc",
    
    # CLAVES DE CONSUMO Y EFICIENCIA - WLTP
    "co2_low_wltp",
    "co2_medium_wltp",
    "co2_high_wltp",
    "co2_maximum_value_wltp",
    "co2_combined_wltp",
    "fuel_low_wltp",
    "fuel_medium_wltp",
    "fuel_high_wltp",
    "fuel_maximum_value_wltp",
    "fuel_combined_wltp",

    # CLAVES DE VEHÍCULOS ELÉCTRICOS
    "power_consumption",
    "electric_range",
    "electric_range_city",
]
