// frontend/src/constants/vehicleFormSections.tsx

import { Car, Gauge, Zap, Settings, Palette, Shield, Fuel, TextSearch, IdCard   } from 'lucide-react';
// We import the new types we just defined
import type { SectionConfig, TableGroupConfig } from '../types/vehicleSpecs'; //

// Definition of the table group for Consumption (NEDC) - CORRECTED
const consumoTableGroup: TableGroupConfig = {
  id: "consumoCO2Fuel_nedc",
  title: "47. CO2 emissions/fuel consumption NEDC values",
  columnHeaders: [
    { key: "condition", label: "Condition" },
    { key: "co2", label: "CO₂ (g/km)" },
    { key: "fuel", label: "Consumption (l/100km)" }
  ],
  rowData: [
    {
      rowLabel: "Urban conditions",
      fieldKeys: { co2: "co2_urban_nedc", fuel: "fuel_urban_nedc" }
    },
    {
      rowLabel: "Extra-urban conditions",
      fieldKeys: { co2: "co2_extra_urban_nedc", fuel: "fuel_extra_urban_nedc" }
    },
    {
      rowLabel: "Combined",
      fieldKeys: { co2: "co2_combined_nedc", fuel: "fuel_combined_nedc" }
    }
  ],
  fieldsInTable: [
    "co2_urban_nedc", "fuel_urban_nedc",
    "co2_extra_urban_nedc", "fuel_extra_urban_nedc",
    "co2_combined_nedc", "fuel_combined_nedc"
  ]
};

// Definition of the table group for Consumption (WLTP) - CORRECTED
const consumoTableGroup_2: TableGroupConfig = {
  id: "consumoCO2Fuel_wltp",
  title: "47.1. CO2 emissions/fuel consumption WLTP values",
  columnHeaders: [
    { key: "condition", label: "Condition" },
    { key: "co2", label: "CO₂ (g/km)" },
    { key: "fuel", label: "Consumption (l/100km)" }
  ],
  rowData: [
    {
      rowLabel: "Low",
      fieldKeys: { co2: "co2_low_wltp", fuel: "fuel_low_wltp" }
    },
    {
      rowLabel: "Medium",
      fieldKeys: { co2: "co2_medium_wltp", fuel: "fuel_medium_wltp" }
    },
    {
      rowLabel: "High",
      fieldKeys: { co2: "co2_high_wltp", fuel: "fuel_high_wltp" }
    },
    {
      rowLabel: "Maximum value",
      fieldKeys: { co2: "co2_maximum_value_wltp", fuel: "fuel_maximum_value_wltp" }
    },
    {
      rowLabel: "Combined",
      fieldKeys: { co2: "co2_combined_wltp", fuel: "fuel_combined_wltp" }
    }
  ],
  fieldsInTable: [
    "co2_low_wltp", "fuel_low_wltp",
    "co2_medium_wltp", "fuel_medium_wltp",
    "co2_high_wltp", "fuel_high_wltp",
    "co2_maximum_value_wltp", "fuel_maximum_value_wltp",
    "co2_combined_wltp", "fuel_combined_wltp",
  ]
};

export const sections: SectionConfig[] = [
    {
    title: "Base Vehicle and Identification Details",
    icon: IdCard,
    color: "from-yellow-500 to-yellow-500",
    fields: [
      { label: "CdS", key: "CdS", type: "text" },
      { label: "0.1 Make", key: "make", type: "text" },
      { label: "0.2 Type", key: "type", type: "text" },
      { label: "0.2 Variant", key: "variant", type: "text" },
      { label: "0.2 Version", key: "version", type: "text" },
      { label: "0.2.1 Commercial name(s)", key: "commercial_name", type: "text" },
      { label: "0.4 Category", key: "category", type: "text" },
      { label: "0.5 Name and address of manufacturer of the base vehicle", key: "manufacturer_base_vehicle", type: "text" },
      { label: "0.6 Manufacturer address - Line 1", key: "manufacturer_address_line1", type: "text" },
      { label: "0.6 Manufacturer address - Line 2", key: "manufacturer_address_line2", type: "text" },
      { label: "0.6 Manufacturer address - Line 3", key: "manufacturer_address_line3", type: "text" },
      { label: "Vehicle identification number", key: "vin", type: "text" },
      { label: "Location of the VIN", key: "vin_location", type: "text" },
      { label: "Implication number", key: "implication_number", type: "text" },
      { label: "Type described", key: "type_described", type: "text" },
      { label: "Date", key: "date", type: "text" },
    ]
   },
   {
    title: "Remarks and Alternatives Types",
    icon: TextSearch,
    color: "from-blue-500 to-cyan-500",
    fields: [
      { label: "Remarks 6.1 - Length:(mm)", key: "remarks_6_1", type: "text" },
      { label: "Remarks 7.1 - Width:(mm)", key: "remarks_7_1", type: "text" },
      { label: "Remarks 8 - Height:(mm)", key: "remarks_8", type: "text" },
      { label: "Remarks 11 - Rear overhang:(mm)", key: "remarks_11", type: "text" },
      { label: "Alternative type 1", key: "alternative_type_1", type: "text" },
      { label: "Alternative type 2", key: "alternative_type_2", type: "text" },
      { label: "Alternative type 3", key: "alternative_type_3", type: "text" },
    ]
   },
   {
    title: "Dimensions and Structure",
    icon: Car,
    color: "from-blue-500 to-cyan-500",
    fields: [
      { label: "1.    Number of axles / wheels:", key: "axles", type: "number" },
      { label: "2.    Powered axles:", key: "powered_axles", type: "number" },
      { label: "3.    Wheelbase :(mm)", key: "wheelbase", type: "number" },
      { label: "5.    Axle(s) track – 1/ 2: (mm)", key: "axle_track", type: "text" },
      { label: "6.1.  Length:(mm)", key: "length", type: "number" },
      { label: "7.1.  Width:(mm)", key: "width", type: "number" },
      { label: "8.    Height:(mm)", key: "height", type: "number" },
      { label: "11.   Rear overhang:(mm)", key: "rear_overhang", type: "number" }
    ]
   },
   {
    title: "Masses and Loads",
    icon: Gauge,
    color: "from-purple-500 to-pink-500",
    fields: [
      { label: "12.1. Mass of the vehicle with bodywork in running order:(kg)", key: "running_mass", type: "number" },
      { label: "14.1. Technically permissable maximum laden mass:(kg)", key: "max_mass", type: "number" },
      { label: "14.2. Distribution of this mass among the axles – 1 / 2:(kg)", key: "mass_distribution", type: "text" },
      { label: "14.3. Technically perm. max mass on each axle – 1 / 2:(kg)", key: "max_axle_mass", type: "text" },
      { label: "16.   Maximum permissible roof load:(kg)", key: "max_roof_load", type: "number" },
      { label: "17.   Maximum mass of trailer – braked / unbraked:(kg)", key: "max_trailer_mass", type: "text" },
      { label: "18.   Maximum mass of combination:(kg)", key: "max_combination_mass", type: "number" },
      { label: "19.1. Maximum vertical load at the coupling point for a trailer:(kg)", key: "max_coupling_load", type: "number" }
    ]
   },
   {
    title: "Engine and Propulsion",
    icon: Zap,
    color: "from-orange-500 to-red-500",
    fields: [
      { label: "20.    Engine manufacturer:", key: "engine_manufacturer", type: "text" },
      { label: "21.    Engine code as marked on the engine:", key: "engine_code", type: "text" },
      { label: "22.    Working principle:", key: "working_principle", type: "text" },
      { label: "22.1. Direct injection:", key: "direct_injection", type: "select", options: ["Yes", "No"] },
      { label: "23.    Pure electric:", key: "pure_electric", type: "select", options: ["Yes", "No"] },
      { label: "23.1  Hybrid [electric] vehicle:", key: "hybrid", type: "select", options: ["Yes", "No"] },
      { label: "24.    Number and arrangement of cylinders:", key: "cylinders", type: "text" },
      { label: "25.    Capacity:( cm3)", key: "capacity", type: "number" },
      { label: "26.    Fuel:", key: "fuel", type: "text" },
      { label: "27.    Maximum net power:( kW/min -1)", key: "max_power", type: "text" }
    ]
   },
   {
    title: "Transmission and Chassis",
    icon: Settings,
    color: "from-green-500 to-teal-500",
    fields: [
      { label: "28.   Clutch (type):", key: "clutch_type", type: "text" },
      { label: "29.   Gearbox (type):", key: "gearbox_type", type: "text" },
      { label: "29.1. Gear", key: "gear", type: "text" },
      { label: "30.   Final drive ratio:", key: "final_drive_ratio", type: "text" },
      { label: "32.   Tyres on wheels 1:", key: "tyres_wheels_1", type: "text" },
      { label: "32.   Tyres on wheels 2:", key: "tyres_wheels_2", type: "text" },
      { label: "34.   Steering, method of assistance:", key: "steering_assistance", type: "text" },
      { label: "35.   Brief description of the braking system (line 1)", key: "braking_system_1", type: "text" },
      { label: "35.   Brief description of the braking system (line 2)", key: "braking_system_2", type: "text" },
    ]
   },
   {
    title: "Bodywork and Features",
    icon: Palette,
    color: "from-indigo-500 to-purple-500",
    fields: [
      { label: "37.   Type of body", key: "body_type", type: "text" },
      { label: "38.   Colour of vehicle", key: "vehicle_color", type: "text" },
      { label: "41.   Number and configuration of doors", key: "doors_config", type: "text" },
      { label: "42.1. Number and position of seats", key: "seats_config", type: "text" },
      { label: "43.1. EC approval mark of coupling device if fitted", key: "coupling_approval", type: "text" },
      { label: "44.   Maximum speed:(km/h)", key: "max_speed", type: "number" }
    ]
   },
   {
    title: "Emissions and Regulations",
    icon: Shield,
    color: "from-emerald-500 to-green-500",
    fields: [
      { label: "45.   Sound level - Stationary noise level (dB(A))", key: "noise_stationary", type: "text" },
      { label: "45.   Sound level - Drive-by noise level (dB(A))", key: "noise_drive_by", type: "text" },
      { label: "46    Emissions standard", key: "emissions_standard", type: "text" },
      { label: "46.1. Exhaust emission", key: "emissions_exhaust", type: "text" },
      { label: "CO (g/km)", key: "co_emissions", type: "number" },
      { label: "HC (g/km)", key: "hc_emissions", type: "number" },
      { label: "NOX (g/km)", key: "nox_emissions", type: "number" },
      { label: "HC+NOX (g/km)", key: "hc_nox_emissions", type: "number" },
      { label: "Particulates (g/km)", key: "particulates", type: "number" },
      { label: "46.2  Smoke (corrected value of the absorption coefficient)", key: "smoke_absorption", type: "number" },
    ]
   },
   {
    title: "Consumption and Efficiency",
    icon: Fuel,
    color: "from-yellow-500 to-orange-500",
    tableGroups: [consumoTableGroup, consumoTableGroup_2],
    // The list of fields is now clean, with unique keys
    fields: [
      // NEDC Fields (for table logic)
      { label: "CO₂ urban (g/km)", key: "co2_urban_nedc", type: "number" },
      { label: "Fuel consumption urban (l/100km)", key: "fuel_urban_nedc", type: "number" },
      { label: "CO₂ extra-urban (g/km)", key: "co2_extra_urban_nedc", type: "number" },
      { label: "Fuel consumption extra-urban (l/100km)", key: "fuel_extra_urban_nedc", type: "number" },
      { label: "CO₂ combined (g/km)", key: "co2_combined_nedc", type: "number" },
      { label: "Fuel consumption combined (l/100km)", key: "fuel_combined_nedc", type: "number" },

      // WLTP Fields (for table logic)
      { label: "CO₂ low (g/km)", key: "co2_low_wltp", type: "number" },
      { label: "Fuel consumption low (l/100km)", key: "fuel_low_wltp", type: "number" },
      { label: "CO₂ medium (g/km)", key: "co2_medium_wltp", type: "number" },
      { label: "Fuel consumption medium (l/100km)", key: "fuel_medium_wltp", type: "number" },
      { label: "CO₂ high (g/km)", key: "co2_high_wltp", type: "number" },
      { label: "Fuel consumption high (l/100km)", key: "fuel_high_wltp", type: "number" },
      { label: "CO₂ maximum value (g/km)", key: "co2_maximum_value_wltp", type: "number" },
      { label: "Fuel consumption maximum value (l/100km)", key: "fuel_maximum_value_wltp", type: "number" },
      { label: "CO₂ combined (g/km)", key: "co2_combined_wltp", type: "number" },
      { label: "Fuel consumption combined (l/100km)", key: "fuel_combined_wltp", type: "number" },
      
      // Fields rendered individually (NOT in a table)
      { label: "Power consumption weighted/combined", key: "power_consumption", type: "number" },
      { label: "Electric range (km)", key: "electric_range", type: "number" },
      { label: "Electric range city (km)", key: "electric_range_city", type: "number" }
    ]
   }
];

// This part remains unchanged as its keys were already correct.
export const demonstrationFields: SectionConfig['fields'] = [
  { label: "Number of axles/wheels", key: "axles", type: "number" },
  { label: "Powered axles", key: "powered_axles", type: "number" },
  { label: "Wheelbase (mm)", key: "wheelbase", type: "number" },
  { label: "Axle track 1/2 (mm)", key: "axle_track", type: "text" },
  { label: "Length (mm)", key: "length", type: "number" }
];