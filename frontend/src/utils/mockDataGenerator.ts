// frontend/src/utils/mockDataGenerator.ts
import type { ExtractedData, FormData } from '../types/vehicleSpecs'; //
import type { SectionConfig } from '../types/vehicleSpecs'; //

// La función generateMockData ahora es exportada y recibe allSections como argumento.
// Nota: allSections aquí es un tipo genérico SectionConfig[],
// si necesitas acceder a las secciones específicas importadas, tendrías que pasarlas.
// Pero para la lógica actual, el tipo es suficiente.
export const generateMockData = (
  sections: SectionConfig[]
): { mockExtractedData: ExtractedData; initialFormData: FormData } => {
  const mockExtractedData: ExtractedData = {};
  const initialFormData: FormData = {};

  sections.forEach(section => {
    section.fields.forEach(field => {
      // Simulación de valores extraídos
      let site1Value = Math.random() > 0.3 ? `${field.label} S1 Val - ${Math.floor(Math.random() * 1000)}` : (Math.random() > 0.5 ? null : 'N/A');
      const site2Value = Math.random() > 0.4 ? `${field.label} S2 Val - ${Math.floor(Math.random() * 1000)}` : null;
      const site3Value = Math.random() > 0.2 ? `${field.label} S3 Val - ${Math.floor(Math.random() * 1000)}` : 'N/A';

      // Inyectar valores conocidos para probar la traducción (estos serían los "originales" en inglés o el idioma base)
      // Asegúrate de que estos 'field.key' y valores coincidan con lo que tienes en predefinedTranslations
      if (field.key === 'working_principle' && Math.random() > 0.5) site1Value = 'In-line';
      else if (field.key === 'fuel' && Math.random() > 0.5) site1Value = 'Gasoline';
      else if (field.key === 'direct_injection' && Math.random() > 0.5) {
        site1Value = Math.random() > 0.5 ? 'Yes' : 'No';
      }

      mockExtractedData[field.key] = {
        site1: field.type === 'number' && site1Value && site1Value !== 'N/A' ? parseFloat(String(site1Value).split('-').pop()?.trim() || '0') : site1Value,
        site2: field.type === 'number' && site2Value ? parseFloat(String(site2Value).split('-').pop()?.trim() || '0') : site2Value,
        site3: field.type === 'number' && site3Value && site3Value !== 'N/A' ? parseFloat(String(site3Value).split('-').pop()?.trim() || '0') : site3Value,
      };

      // Determinar el valor final (simple lógica de ejemplo)
      let finalValue: string | number | null = mockExtractedData[field.key]?.site1;
      if (finalValue === null || finalValue === 'N/A') {
        finalValue = mockExtractedData[field.key]?.site2;
      }
      if (finalValue === null || finalValue === 'N/A') {
        finalValue = mockExtractedData[field.key]?.site3;
      }
      if (finalValue === null || finalValue === 'N/A' || (typeof finalValue === 'string' && finalValue.trim() === '')) {
        finalValue = field.type === 'number' ? 0 : (field.options && field.options.length > 0 ? field.options[0] : `Default ${field.label}`);
      }
      initialFormData[field.key] = finalValue as string | number;
    });
  });

  return { mockExtractedData, initialFormData };
};