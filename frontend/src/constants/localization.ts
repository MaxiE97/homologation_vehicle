// frontend/src/constants/localization.ts

export interface Language {
  code: string;
  name: string;
}

export const supportedLanguages: Language[] = [
  { code: 'es', name: 'Spanish' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  // You can add more languages here
];

// Example of a predefined translations dictionary
// The outer key is the field.key, the inner key is the original value, and then the translated value.
export const predefinedTranslations: Record<string, Record<string, Record<string, string>>> = {
  // Example for the 'working_principle' field (Principio de funcionamiento)
  // (This is the 'key' of the FieldConfig in vehicleFormSections.tsx)
  'working_principle': {
    'In-line': { // Original value that could come from the backend or be a standard
      'es': 'En línea',
      'de': 'In Reihe',
      'pt': 'Em linha'
    },
    'V-engine': {
      'es': 'Motor en V',
      'de': 'V-Motor',
      'pt': 'Motor em V'
    },
    // ... more values to translate for the 'working_principle' field
  },
  // Example for the 'fuel' field (Combustible)
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
    // ... more values for 'fuel'
  },
  // Example for the 'direct_injection' field (Inyección directa) that uses "Yes"/"No"
  'direct_injection': {
    'Sí': { // Assuming the base value could be "Sí" if processed in Spanish first
      'en': 'Yes',
      'de': 'Ja',
      'pt': 'Sim'
    },
    'No': {
      'en': 'No',
      'de': 'Nein',
      'pt': 'Não'
    },
    // You could also have the English versions as the base if the data comes that way
    'Yes': {
        'es': 'Sí',
        'de': 'Ja',
        'pt': 'Sim'
    }
    // Consider a consistent strategy for the "original value"
  }
  // ... more fields with predefined values to translate
};