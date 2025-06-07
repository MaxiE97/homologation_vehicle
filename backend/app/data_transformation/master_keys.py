# backend/app/data_transformation/master_keys.py
# This is now the single source of truth for all data keys.

MASTER_ORDERED_KEYS = [

    # Del A1 al A23
        "CdS",     #23 
        "Make",    #A1
        "Type",    #A2
        "Variant", #A3
        "Version", #A4
        "Commercial name", #A5
        "Category", #A6
        "manufacturer_base_vehicle", #A7
        "manufacturer_address_line1", #A8
        "manufacturer_address_line2", #A9
        "manufacturer_address_line3", #A10
        "Homologation number", #A11
        "vin_location", #A12
        "implication_number",   #A13
        "type_described", #A14
        "date",     #A15
        "remarks_6_1", #A16
        "remarks_7_1", #A17
        "remarks_8", #A18
        "remarks_11", #A19
        "alternative_type_1",  #A20
        "alternative_type_2",  #A21
        "alternative_type_3", #A22 

    # Del B1 al B29
        "Number of axles / wheels", #B1
        "Powered axles", #B2
        "Wheelbase", #B3
        "Axle(s) track – 1 / 2", #B4
        "Length", #B5
        "Width",   #B6
        "Height", #B7
        "Rear overhang", #B8
        "Mass of the vehicle with bodywork in running order", #B9 
        "Technically permissible maximum laden mass", #B10
        "Distribution of this mass among the axles – 1 / 2", #B11 
        "Technically permissible max mass on each axle – 1 / 2", #B12
        "Maximum permissible roof load", #B13
        "Maximum mass of trailer – braked / unbraked", #B14
        "Maximum mass of combination", #B15
        "Maximum vertical load at the coupling point for a trailer", #B16
        "Engine manufacturer",  #B17
        "Engine code as marked on the enginee", #B18
        "Working principle", #B19
        "Direct injection", #B20
        "Pure electric", #B21
        "Hybrid [electric] vehicle", #B22
        "Number and arrangement of cylinders", #B23
        "Capacity", #B24
        "Fuel", #B25
        "Maximum net power", #B26
        "Clutch", #B27
        "Gearbox", #B28
        "Gear", #B29

    # Del B30 al B70    
        "Final drive ratio", #B30
        "Tyres on wheels 1", #B31
        "Tyres on wheels 2", #B32
        "Steering, method of assistance", #B33
        "Suspension", #B34 Brief description of the braking system (line 1)
        "Brakes", #35 Brief description of the braking system (line 2)"
        "Type of body", #B36
        "Color veihcle", #B37
        "Number and configuration of doors", #B38
        "Number and position of seats", #B39
        "EC type approval mark of couplind device if fitted", #B40
        "Maximum speed", #B41
        "Stationary (dB(A)) at engine speed", #B42
        "Drive by", #B43
        "Emissions standard", #B44
        "Exhaust emission", #B45
        "Emissions CO", #B46
        "Emissions HC", #B47
        "Emissions NOx", #B48
        "Emissions HC NOx", #B49
        "Emissions particulates", #B50
        "Smoke", #B51
        "NEDC CO2 urban conditions", #B54
        "NEDC CO2 extra-urban conditions", #B53
        "NEDC CO2 combined", #B52
        "NEDC Fuel consumption urban conditions", #B57
        "NEDC Fuel consumption extra-urban conditions", #B56
        "NEDC Fuel consumption combined", #B55
        "WLTP CO2 Low", #B62  
        "WLTP CO2 Medium", #B61
        "WLTP CO2 High", #B60
        "WLTP CO2 Maximum Value", #B59
        "WLTP CO2 combined", #B58
        "WLTP Fuel consumption Low", #B67
        "WLTP Fuel consumption Medium", #B66
        "WLTP Fuel consumption High", #B65
        "WLTP Fuel consumption Maximum Value", #B64
        "WLTP Fuel consumption combined", #B63
        "Power consumption weighted/combined", #B68
        "Electric range", #B69
        "Electric range in city", #B70

        
        
         
 ]