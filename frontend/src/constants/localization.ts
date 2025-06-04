// frontend/src/constants/localization.ts

export interface Language {
  code: string;
  name: string;
}

export const supportedLanguages: Language[] = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'Inglés' },
  { code: 'de', name: 'Alemán' },
  { code: 'pt', name: 'Portugués' },
  // Puedes añadir más idiomas aquí
];

// Ejemplo de un diccionario de traducciones predefinidas
// La clave externa es el field.key, la interna es el valor original, y luego el valor traducido.
export const predefinedTranslations: Record<string, Record<string, Record<string, string>>> = {
  // Ejemplo para el campo 'working_principle' (Principio de funcionamiento)
  // (Este es el 'key' del FieldConfig en vehicleFormSections.tsx)
  'working_principle': {
    'In-line': { // Valor original que podría venir del backend o ser un estándar
      'es': 'En línea',
      'de': 'In Reihe',
      'pt': 'Em linha'
    },
    'V-engine': {
      'es': 'Motor en V',
      'de': 'V-Motor',
      'pt': 'Motor em V'
    },
    // ... más valores a traducir para el campo 'working_principle'
  },
  // Ejemplo para el campo 'fuel' (Combustible)
  'fuel': {
    'Gasoline': {
      'es': 'Gasolina',
      'de': 'Benzin',
      'pt': 'Gasolina'
    },
    'Diesel': {
      'es': 'Diésel',
      'de': 'Diesel',
      'pt': 'Diesel'
    },
    // ... más valores para 'fuel'
  },
  // Ejemplo para el campo 'direct_injection' (Inyección directa) que usa "Sí"/"No"
  'direct_injection': {
    'Sí': { // Asumiendo que el valor base podría ser "Sí" si se procesa en español primero
      'en': 'Yes',
      'de': 'Ja',
      'pt': 'Sim'
    },
    'No': {
      'en': 'No',
      'de': 'Nein',
      'pt': 'Não'
    },
    // También podrías tener las versiones en inglés como base si los datos vienen así
    'Yes': {
        'es': 'Sí',
        'de': 'Ja',
        'pt': 'Sim'
    }
    // Considera una estrategia consistente para el "valor original"
  }
  // ... más campos con valores predefinidos a traducir
};