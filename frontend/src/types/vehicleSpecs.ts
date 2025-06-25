// frontend/src/types/vehicleSpecs.ts
import type { LucideIcon } from 'lucide-react';

export interface FieldConfig {
  label: string;
  key: string;
  type: "number" | "text" | "select" | "textarea";
  options?: string[];
  // Podríamos añadir 'displayLabel' aquí más tarde si es necesario para el Paso 3.1
}

// Nuevas interfaces para la configuración de tablas de campos
export interface TableHeaderConfig {
  key: string; // Identificador para esta columna, ej: 'condition', 'co2', 'fuel'
  label: string; // Etiqueta para mostrar en la cabecera de la columna
}

export interface TableRowDefinition {
  rowLabel: string; // Etiqueta para la primera celda de la fila (ej: "Condiciones urbanas")
  // Mapea la 'key' de la cabecera de columna al 'key' del FieldConfig correspondiente
  fieldKeys: { [headerKey: string]: string }; // ej: { co2: "co2_urban", fuel: "fuel_urban" }
}

export interface TableGroupConfig {
  id: string; // ID único para la tabla dentro de la sección
  title?: string; // Título opcional para la tabla
  columnHeaders: TableHeaderConfig[]; // Define las columnas. La primera usualmente es descriptiva.
  rowData: TableRowDefinition[]; // Define las filas y qué campos van en cada celda
  fieldsInTable: string[]; // Lista de field.key que están incluidos en esta tabla (para evitar renderizarlos individualmente)
}
// Fin de nuevas interfaces

export interface SectionConfig {
  title: string;
  icon: LucideIcon;
  color: string;
  fields: FieldConfig[];
  tableGroups?: TableGroupConfig[]; // Nueva propiedad opcional
}

export interface FormData {
  [key: string]: string | number;
}

export interface ExtractedData {
  [fieldKey: string]: {
    [site: string]: string | number | null;
  };
}

export interface CollapsedSections {
  [sectionIndex: number]: boolean;
}

export interface DownloadHistoryItem {
  id: string; // <-- AÑADIDO: El UUID único de la descarga
  cds_identifier: string;
  downloaded_at: string; // La recibimos como string, la podemos formatear después
  status: 'Ok' | 'Under review'; // <-- AÑADIDO: El estado de la descarga
}

export interface UserProfile {
  email: string | null;
  username: string | null;
  downloads: DownloadHistoryItem[];
}