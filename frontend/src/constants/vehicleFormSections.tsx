// frontend/src/constants/vehicleFormSections.tsx
import { Car, Gauge, Zap, Settings, Palette, Shield, Fuel } from 'lucide-react';
// We import the new types we just defined
import type { SectionConfig, TableGroupConfig } from '../types/vehicleSpecs'; //

// Definition of the table group for Consumption (example)
const consumoTableGroup: TableGroupConfig = {
  id: "consumoCO2Fuel",
  title: "Consumption and CO₂ Emissions Table", // Optional title for the table
  columnHeaders: [
    { key: "condition", label: "Condition" }, // The first column describes the row
    { key: "co2", label: "CO₂ (g/km)" },
    { key: "fuel", label: "Consumption (l/100km)" }
  ],
  rowData: [
    {
      rowLabel: "Urban conditions",
      fieldKeys: { co2: "co2_urban", fuel: "fuel_urban" } // Maps headerKey to field.key
    },
    {
      rowLabel: "Extra-urban conditions",
      fieldKeys: { co2: "co2_extra_urban", fuel: "fuel_extra_urban" }
    },
    {
      rowLabel: "Combined",
      fieldKeys: { co2: "co2_combined", fuel: "fuel_combined" }
    }
  ],
  fieldsInTable: [
    "co2_urban", "fuel_urban",
    "co2_extra_urban", "fuel_extra_urban",
    "co2_combined", "fuel_combined"
  ]
};

export const sections: SectionConfig[] = [
  // ... (Other sections unchanged for now) ...
  {
    title: "Dimensions and Structure",
    icon: Car,
    color: "from-blue-500 to-cyan-500",
    fields: [
      { label: "Number of axles/wheels", key: "axles", type: "number" },
      { label: "Powered axles", key: "powered_axles", type: "number" },
      { label: "Wheelbase (mm)", key: "wheelbase", type: "number" },
      { label: "Axle track 1/2 (mm)", key: "axle_track", type: "text" },
      { label: "Length (mm)", key: "length", type: "number" },
      { label: "Width (mm)", key: "width", type: "number" },
      { label: "Height (mm)", key: "height", type: "number" },
      { label: "Rear overhang (mm)", key: "rear_overhang", type: "number" }
    ]
  },
  {
    title: "Masses and Loads",
    icon: Gauge,
    color: "from-purple-500 to-pink-500",
    fields: [
      { label: "Mass of the vehicle in running order (kg)", key: "running_mass", type: "number" },
      { label: "Technically permissible maximum mass (kg)", key: "max_mass", type: "number" },
      { label: "Mass distribution between axles 1/2 (kg)", key: "mass_distribution", type: "text" },
      { label: "Technically permissible max mass per axle 1/2 (kg)", key: "max_axle_mass", type: "text" },
      { label: "Maximum permissible roof load (kg)", key: "max_roof_load", type: "number" },
      { label: "Maximum trailer mass - braked/unbraked (kg)", key: "max_trailer_mass", type: "text" },
      { label: "Maximum combination mass (kg)", key: "max_combination_mass", type: "number" },
      { label: "Maximum vertical load at the coupling point (kg)", key: "max_coupling_load", type: "number" }
    ]
  },
  {
    title: "Engine and Propulsion",
    icon: Zap,
    color: "from-orange-500 to-red-500",
    fields: [
      { label: "Engine manufacturer", key: "engine_manufacturer", type: "text" },
      { label: "Engine code", key: "engine_code", type: "text" },
      { label: "Working principle", key: "working_principle", type: "text" },
      { label: "Direct injection", key: "direct_injection", type: "select", options: ["Yes", "No"] },
      { label: "Pure electric vehicle", key: "pure_electric", type: "select", options: ["Yes", "No"] },
      { label: "Hybrid [electric] vehicle", key: "hybrid", type: "select", options: ["Yes", "No"] },
      { label: "Number and arrangement of cylinders", key: "cylinders", type: "text" },
      { label: "Capacity (cm³)", key: "capacity", type: "number" },
      { label: "Fuel", key: "fuel", type: "text" },
      { label: "Maximum net power (kW/min⁻¹)", key: "max_power", type: "text" }
    ]
  },
  {
    title: "Transmission and Chassis",
    icon: Settings,
    color: "from-green-500 to-teal-500",
    fields: [
      { label: "Clutch (type)", key: "clutch_type", type: "text" },
      { label: "Gearbox (type)", key: "gearbox_type", type: "text" },
      { label: "Final drive ratio", key: "final_drive_ratio", type: "text" },
      { label: "Tyres and wheels - axle 1", key: "tyres_wheels_1", type: "text" },
      { label: "Tyres and wheels - axle 2", key: "tyres_wheels_2", type: "text" },
      { label: "Steering, assistance method", key: "steering_assistance", type: "text" },
      { label: "Brief description of the braking system", key: "braking_system", type: "textarea" }
    ]
  },
  {
    title: "Bodywork and Features",
    icon: Palette,
    color: "from-indigo-500 to-purple-500",
    fields: [
      { label: "Type of bodywork", key: "body_type", type: "text" },
      { label: "Vehicle color", key: "vehicle_color", type: "text" },
      { label: "Number and configuration of doors", key: "doors_config", type: "text" },
      { label: "Number and position of seats", key: "seats_config", type: "text" },
      { label: "EC approval mark of coupling device", key: "coupling_approval", type: "text" },
      { label: "Maximum speed (km/h)", key: "max_speed", type: "number" }
    ]
  },
  {
    title: "Emissions and Regulations",
    icon: Shield,
    color: "from-emerald-500 to-green-500",
    fields: [
      { label: "Stationary noise level (dB(A))", key: "noise_stationary", type: "text" },
      { label: "Drive-by noise level (dB(A))", key: "noise_drive_by", type: "text" },
      { label: "Emissions standard", key: "emissions_standard", type: "text" },
      { label: "CO (g/km)", key: "co_emissions", type: "number" },
      { label: "HC (g/km)", key: "hc_emissions", type: "number" },
      { label: "NOX (g/km)", key: "nox_emissions", type: "number" },
      { label: "HC+NOX (g/km)", key: "hc_nox_emissions", type: "number" },
      { label: "k-value (g/km)", key: "k_value", type: "number" },
      { label: "Particulates (g/km)", key: "particulates", type: "number" }
    ]
  },
  {
    title: "Consumption and Efficiency",
    icon: Fuel,
    color: "from-yellow-500 to-orange-500",
    // We add the tableGroup here
    tableGroups: [consumoTableGroup],
    fields: [
      // These fields are now defined in consumoTableGroup.fieldsInTable
      // They must still be in the 'fields' list so that general logic like 'totalFields', etc., recognizes them
      // and so 'generateMockData' can find their 'label' and 'type'.
      // The rendering logic in the views will skip them if they are in a TableGroup's 'fieldsInTable'.
      { label: "CO₂ urban (g/km)", key: "co2_urban", type: "number" },
      { label: "CO₂ extra-urban (g/km)", key: "co2_extra_urban", type: "number" },
      { label: "CO₂ combined (g/km)", key: "co2_combined", type: "number" },
      { label: "Fuel consumption urban (l/100km)", key: "fuel_urban", type: "number" },
      { label: "Fuel consumption extra-urban (l/100km)", key: "fuel_extra_urban", type: "number" },
      { label: "Fuel consumption combined (l/100km)", key: "fuel_combined", type: "number" },
      // These fields are NOT in the table and will be rendered individually
      { label: "Weighted/combined power consumption (Wh/km)", key: "power_consumption", type: "number" },
      { label: "Electric range (km)", key: "electric_range", type: "number" },
      { label: "Electric range city (km)", key: "electric_range_city", type: "number" }
    ]
  }
];

// The demonstrationFields are still a subset or derived from 'sections'.
// For now, to maintain the exact functionality, we define them explicitly.
// In the future, you could generate them dynamically from 'sections' if needed.
export const demonstrationFields: SectionConfig['fields'] = [
  { label: "Number of axles/wheels", key: "axles", type: "number" },
  { label: "Powered axles", key: "powered_axles", type: "number" },
  { label: "Wheelbase (mm)", key: "wheelbase", type: "number" },
  { label: "Axle track 1/2 (mm)", key: "axle_track", type: "text" },
  { label: "Length (mm)", key: "length", type: "number" }
];