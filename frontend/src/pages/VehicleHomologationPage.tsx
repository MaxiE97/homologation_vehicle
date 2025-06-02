// frontend/src/pages/VehicleHomologationPage.tsx
import { useState, useMemo } from 'react';
import FormHeader from '../components/layout/FormHeader'; //
import FormActions from '../components/layout/FormActions'; //
import ExtractedDataView from '../components/vehicleForm/ExtractedDataView'; //
import SectionsView from '../components/vehicleForm/SectionsView'; //
import UnifiedView from '../components/vehicleForm/UnifiedView'; //
import UrlInputSection from '../components/vehicleForm/UrlInputSection';
import type { FormData, ExtractedData, CollapsedSections } from '../types/vehicleSpecs'; //
import { sections as allSections } from '../constants/vehicleFormSections'; //

type ViewMode = 'extracted' | 'sections' | 'unified';

const VehicleHomologationPage = () => {
  const [formData, setFormData] = useState<FormData>({});
  const [collapsedSections, setCollapsedSections] = useState<CollapsedSections>({});
  const [viewMode, setViewMode] = useState<ViewMode>('extracted'); // Iniciamos en 'extracted' para ver UrlInputSection
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
    console.log("Procesando URLs:");
    console.log("URL 1:", url1);
    console.log("URL 2:", url2);
    console.log("URL 3:", url3);
    console.log("Opción de Transmisión:", transmissionOption);
    // En el siguiente paso, aquí generaremos los datos simulados.
  };

  const totalFields = useMemo(() => allSections.reduce((acc, section) => acc + section.fields.length, 0), []);
  const completedFields = useMemo(() => Object.keys(formData).filter(key => formData[key] && String(formData[key]).trim() !== '').length, [formData]);
  const completedPercentage = useMemo(() => totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0, [completedFields, totalFields]);

  const handleSaveDraft = () => {
    console.log("Guardar Borrador:", { urls: {url1, url2, url3}, transmission: transmissionOption, data: formData });
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
        {/* Mostrar UrlInputSection solo si viewMode es 'extracted' */}
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

        {/* Las vistas de datos se muestran según el viewMode */}
        {viewMode === 'extracted' && (
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