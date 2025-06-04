// frontend/src/types/vehicleSpecs.ts
import type { LucideIcon } from 'lucide-react'; // asegúrate de importar esto

export interface FieldConfig {
  label: string;
  key: string;
  type: "number" | "text" | "select" | "textarea";
  options?: string[];
}

export interface SectionConfig {
  title: string;
  icon: LucideIcon; // O JSX.Element
  color: string;
  fields: FieldConfig[];
}

export interface FormData {
  [key: string]: string | number; // Los valores finales no deberían ser null, se manejan con "" o un valor por defecto.
}

export interface ExtractedData {
  [fieldKey: string]: {
    [site: string]: string | number | null; // Permitimos null aquí
  };
}

export interface CollapsedSections {
  [sectionIndex: number]: boolean;
}