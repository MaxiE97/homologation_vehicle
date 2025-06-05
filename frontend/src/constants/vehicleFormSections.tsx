// frontend/src/constants/vehicleFormSections.tsx
import { Car, Gauge, Zap, Settings, Palette, Shield, Fuel } from 'lucide-react';
// Importamos los nuevos tipos que acabamos de definir
import type { SectionConfig, TableGroupConfig } from '../types/vehicleSpecs'; //

// Definición del grupo de tabla para Consumo (ejemplo)
const consumoTableGroup: TableGroupConfig = {
  id: "consumoCO2Fuel",
  title: "Tabla de Consumo y Emisiones CO₂", // Título opcional para la tabla
  columnHeaders: [
    { key: "condition", label: "Condición" }, // La primera columna es la descriptiva de la fila
    { key: "co2", label: "CO₂ (g/km)" },
    { key: "fuel", label: "Consumo (l/100km)" }
  ],
  rowData: [
    {
      rowLabel: "Condiciones urbanas",
      fieldKeys: { co2: "co2_urban", fuel: "fuel_urban" } // Mapea headerKey a field.key
    },
    {
      rowLabel: "Condiciones extraurbanas",
      fieldKeys: { co2: "co2_extra_urban", fuel: "fuel_extra_urban" }
    },
    {
      rowLabel: "Combinado",
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
  // ... (Otras secciones sin cambios por ahora) ...
  {
    title: "Dimensiones y Estructura",
    icon: Car,
    color: "from-blue-500 to-cyan-500",
    fields: [
      { label: "Número de ejes/ruedas", key: "axles", type: "number" },
      { label: "Ejes motriz", key: "powered_axles", type: "number" },
      { label: "Distancia entre ejes (mm)", key: "wheelbase", type: "number" },
      { label: "Vía del eje 1/2 (mm)", key: "axle_track", type: "text" },
      { label: "Longitud (mm)", key: "length", type: "number" },
      { label: "Anchura (mm)", key: "width", type: "number" },
      { label: "Altura (mm)", key: "height", type: "number" },
      { label: "Voladizo trasero (mm)", key: "rear_overhang", type: "number" }
    ]
  },
  {
    title: "Masas y Cargas",
    icon: Gauge,
    color: "from-purple-500 to-pink-500",
    fields: [
      { label: "Masa del vehículo en orden de marcha (kg)", key: "running_mass", type: "number" },
      { label: "Masa máxima técnicamente admisible (kg)", key: "max_mass", type: "number" },
      { label: "Distribución de masa entre ejes 1/2 (kg)", key: "mass_distribution", type: "text" },
      { label: "Masa máx. técnicamente admisible por eje 1/2 (kg)", key: "max_axle_mass", type: "text" },
      { label: "Carga máxima admisible en el techo (kg)", key: "max_roof_load", type: "number" },
      { label: "Masa máxima del remolque - frenado/sin frenar (kg)", key: "max_trailer_mass", type: "text" },
      { label: "Masa máxima del conjunto (kg)", key: "max_combination_mass", type: "number" },
      { label: "Carga vertical máxima en el punto de acoplamiento (kg)", key: "max_coupling_load", type: "number" }
    ]
  },
  {
    title: "Motor y Propulsión",
    icon: Zap,
    color: "from-orange-500 to-red-500",
    fields: [
      { label: "Fabricante del motor", key: "engine_manufacturer", type: "text" },
      { label: "Código del motor", key: "engine_code", type: "text" },
      { label: "Principio de funcionamiento", key: "working_principle", type: "text" },
      { label: "Inyección directa", key: "direct_injection", type: "select", options: ["Sí", "No"] },
      { label: "Vehículo eléctrico puro", key: "pure_electric", type: "select", options: ["Sí", "No"] },
      { label: "Vehículo híbrido [eléctrico]", key: "hybrid", type: "select", options: ["Sí", "No"] },
      { label: "Número y disposición de cilindros", key: "cylinders", type: "text" },
      { label: "Cilindrada (cm³)", key: "capacity", type: "number" },
      { label: "Combustible", key: "fuel", type: "text" },
      { label: "Potencia neta máxima (kW/min⁻¹)", key: "max_power", type: "text" }
    ]
  },
  {
    title: "Transmisión y Chasis",
    icon: Settings,
    color: "from-green-500 to-teal-500",
    fields: [
      { label: "Embrague (tipo)", key: "clutch_type", type: "text" },
      { label: "Caja de cambios (tipo)", key: "gearbox_type", type: "text" },
      { label: "Relación de transmisión final", key: "final_drive_ratio", type: "text" },
      { label: "Neumáticos y llantas rueda 1", key: "tyres_wheels_1", type: "text" },
      { label: "Neumáticos y llantas rueda 2", key: "tyres_wheels_2", type: "text" },
      { label: "Dirección, método de asistencia", key: "steering_assistance", type: "text" },
      { label: "Descripción breve del sistema de frenado", key: "braking_system", type: "textarea" }
    ]
  },
  {
    title: "Carrocería y Características",
    icon: Palette,
    color: "from-indigo-500 to-purple-500",
    fields: [
      { label: "Tipo de carrocería", key: "body_type", type: "text" },
      { label: "Color del vehículo", key: "vehicle_color", type: "text" },
      { label: "Número y configuración de puertas", key: "doors_config", type: "text" },
      { label: "Número y posición de asientos", key: "seats_config", type: "text" },
      { label: "Marca de homologación CE del dispositivo de acoplamiento", key: "coupling_approval", type: "text" },
      { label: "Velocidad máxima (km/h)", key: "max_speed", type: "number" }
    ]
  },
  {
    title: "Emisiones y Normativas",
    icon: Shield,
    color: "from-emerald-500 to-green-500",
    fields: [
      { label: "Nivel de ruido estacionario (dB(A))", key: "noise_stationary", type: "text" },
      { label: "Nivel de ruido en marcha (dB(A))", key: "noise_drive_by", type: "text" },
      { label: "Norma de emisiones", key: "emissions_standard", type: "text" },
      { label: "CO (g/km)", key: "co_emissions", type: "number" },
      { label: "HC (g/km)", key: "hc_emissions", type: "number" },
      { label: "NOX (g/km)", key: "nox_emissions", type: "number" },
      { label: "HC+NOX (g/km)", key: "hc_nox_emissions", type: "number" },
      { label: "Valor k (g/km)", key: "k_value", type: "number" },
      { label: "Partículas (g/km)", key: "particulates", type: "number" }
    ]
  },
  {
    title: "Consumo y Eficiencia",
    icon: Fuel,
    color: "from-yellow-500 to-orange-500",
    // Añadimos el tableGroup aquí
    tableGroups: [consumoTableGroup],
    fields: [
      // Estos campos ahora están definidos en consumoTableGroup.fieldsInTable
      // Aún deben estar en la lista 'fields' para que la lógica general de 'totalFields', etc., los reconozca
      // y para que 'generateMockData' pueda encontrar sus 'label' y 'type'.
      // La lógica de renderizado en las vistas los omitirá si están en 'fieldsInTable' de un TableGroup.
      { label: "CO₂ urbano (g/km)", key: "co2_urban", type: "number" },
      { label: "CO₂ extraurbano (g/km)", key: "co2_extra_urban", type: "number" },
      { label: "CO₂ combinado (g/km)", key: "co2_combined", type: "number" },
      { label: "Consumo urbano (l/100km)", key: "fuel_urban", type: "number" },
      { label: "Consumo extraurbano (l/100km)", key: "fuel_extra_urban", type: "number" },
      { label: "Consumo combinado (l/100km)", key: "fuel_combined", type: "number" },
      // Estos campos NO están en la tabla y se renderizarán individualmente
      { label: "Consumo eléctrico ponderado/combinado (Wh/km)", key: "power_consumption", type: "number" },
      { label: "Autonomía eléctrica (km)", key: "electric_range", type: "number" },
      { label: "Autonomía eléctrica en ciudad (km)", key: "electric_range_city", type: "number" }
    ]
  }
];

// Los demonstrationFields siguen siendo un subconjunto o se derivan de 'sections'.
// Por ahora, para mantener la funcionalidad exacta, los definimos explícitamente.
// A futuro, podrías generarlos dinámicamente a partir de 'sections' si es necesario.
export const demonstrationFields: SectionConfig['fields'] = [
  { label: "Número de ejes/ruedas", key: "axles", type: "number" },
  { label: "Ejes motriz", key: "powered_axles", type: "number" },
  { label: "Distancia entre ejes (mm)", key: "wheelbase", type: "number" },
  { label: "Vía del eje 1/2 (mm)", key: "axle_track", type: "text" },
  { label: "Longitud (mm)", key: "length", type: "number" }
];