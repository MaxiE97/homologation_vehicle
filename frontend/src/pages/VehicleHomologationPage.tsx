// frontend/src/pages/VehicleHomologationPage.tsx
import { useState, useMemo } from 'react';
import FormHeader from '../components/layout/FormHeader'; //
import FormActions from '../components/layout/FormActions'; //
import ExtractedDataView from '../components/vehicleForm/ExtractedDataView'; //
import SectionsView from '../components/vehicleForm/SectionsView'; //
import UnifiedView from '../components/vehicleForm/UnifiedView'; //
import UrlInputSection from '../components/vehicleForm/UrlInputSection';
import type { FieldConfig, FormData, ExtractedData, CollapsedSections } from '../types/vehicleSpecs'; //
import { sections as allSections } from '../constants/vehicleFormSections'; //

type ViewMode = 'extracted' | 'sections' | 'unified';

// Función para generar datos simulados
const generateMockData = (sections: typeof allSections): { mockExtractedData: ExtractedData, mockFormData: FormData } => {
  const mockExtractedData: ExtractedData = {};
  const mockFormData: FormData = {};

  sections.forEach(section => {
    section.fields.forEach(field => {
      const site1Value = Math.random() > 0.3 ? `${field.label} S1 - ${Math.floor(Math.random() * 1000)}` : (Math.random() > 0.5 ? null : 'N/A');
      const site2Value = Math.random() > 0.4 ? `${field.label} S2 - ${Math.floor(Math.random() * 1000)}` : null;
      const site3Value = Math.random() > 0.2 ? `${field.label} S3 - ${Math.floor(Math.random() * 1000)}` : 'N/A';

      // Esta asignación ahora es válida porque ExtractedData permite null
      mockExtractedData[field.key] = {
        site1: field.type === 'number' && site1Value && site1Value !== 'N/A' ? parseFloat(site1Value.split('-').pop()!) : site1Value,
        site2: field.type === 'number' && site2Value ? parseFloat(site2Value.split('-').pop()!) : site2Value,
        site3: field.type === 'number' && site3Value && site3Value !== 'N/A' ? parseFloat(site3Value.split('-').pop()!) : site3Value,
      };

      // La lógica para mockFormData ya intenta evitar nulls para el valor final
      let finalValue: string | number | null = mockExtractedData[field.key]?.site1;
      if (finalValue === null || finalValue === 'N/A') {
        finalValue = mockExtractedData[field.key]?.site2;
      }
      if (finalValue === null || finalValue === 'N/A') {
        finalValue = mockExtractedData[field.key]?.site3;
      }
      if (finalValue === null || finalValue === 'N/A' || (typeof finalValue === 'string' && finalValue.trim() === '')) {
        finalValue = field.type === 'number' ? 0 : (field.options && field.options.length > 0 ? field.options[0] : `Por defecto ${field.label}`);
      }
      // Si es un select y el valor final no es una opción válida, se podría ajustar.
      // Por ahora, la lógica de arriba asegura que no sea null.
      mockFormData[field.key] = finalValue as string | number;
    });
  });

  return { mockExtractedData, mockFormData };
};


const VehicleHomologationPage = () => {
  const [formData, setFormData] = useState<FormData>({});
  const [collapsedSections, setCollapsedSections] = useState<CollapsedSections>({});
  const [viewMode, setViewMode] = useState<ViewMode>('extracted');
  const [extractedData, setExtractedData] = useState<ExtractedData>({});

  const [url1, setUrl1] = useState<string>('');
  const [url2, setUrl2] = useState<string>('');
  const [url3, setUrl3] = useState<string>('');
  const [transmissionOption, setTransmissionOption] = useState<string>('Por defecto');

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateExtractedField = (fieldKey: string, site: string, value: string) => {
    setExtractedData(prev => ({
      ...prev,
      [fieldKey]: {
        ...(prev[fieldKey] || {}),
        [site]: value
      }
    }));
  };

  const updateFinalValue = (fieldKey: string, value: string) => {
    updateField(fieldKey, value);
  };

  const toggleSection = (sectionIndex: number) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  const handleProcessUrls = () => {
    console.log("Procesando URLs (simulado):");
    console.log("URL 1:", url1);
    console.log("URL 2:", url2);
    console.log("URL 3:", url3);
    console.log("Opción de Transmisión:", transmissionOption);

    // Generar y establecer los datos simulados
    const { mockExtractedData, mockFormData } = generateMockData(allSections);
    setExtractedData(mockExtractedData);
    setFormData(mockFormData);

    console.log("Datos extraídos simulados:", mockExtractedData);
    console.log("Datos de formulario (finales) simulados:", mockFormData);
  };

  const totalFields = useMemo(() => allSections.reduce((acc, section) => acc + section.fields.length, 0), [allSections]);
  const completedFields = useMemo(() => Object.keys(formData).filter(key => formData[key] && String(formData[key]).trim() !== '').length, [formData]);
  const completedPercentage = useMemo(() => totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0, [completedFields, totalFields]);

  const handleSaveDraft = () => {
    console.log("Guardar Borrador:", { urls: {url1, url2, url3}, transmission: transmissionOption, data: formData, extracted: extractedData });
  };

  const handleSubmit = () => {
    console.log("Finalizar y Enviar:", { urls: {url1, url2, url3}, transmission: transmissionOption, data: formData });
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <FormHeader
        completedFields={completedFields}
        totalFields={totalFields}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="max-w-5xl mx-auto px-6 py-6">
        {viewMode === 'extracted' && (
          <UrlInputSection
            url1={url1}
            setUrl1={setUrl1}
            url2={url2}
            setUrl2={setUrl2}
            url3={url3}
            setUrl3={setUrl3}
            transmissionOption={transmissionOption}
            setTransmissionOption={setTransmissionOption}
            onProcessUrls={handleProcessUrls}
          />
        )}

        {viewMode === 'extracted' && Object.keys(extractedData).length > 0 && ( // Solo mostrar si hay datos extraídos
          <ExtractedDataView
            formData={formData}
            extractedData={extractedData}
            onExtractedDataChange={updateExtractedField}
            onFinalValueChange={updateFinalValue}
          />
        )}
        {viewMode === 'sections' && (
          <SectionsView
            formData={formData}
            collapsedSections={collapsedSections}
            onToggleSection={toggleSection}
            onFieldChange={updateField}
          />
        )}
        {viewMode === 'unified' && (
          <UnifiedView
            formData={formData}
            onFieldChange={updateField}
          />
        )}

        <FormActions
          completedPercentage={completedPercentage}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default VehicleHomologationPage;