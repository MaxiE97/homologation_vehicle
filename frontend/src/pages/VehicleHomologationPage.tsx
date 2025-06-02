// src/pages/VehicleHomologationPage.tsx
import  { useState, useMemo } from 'react';
import FormHeader from '../components/layout/FormHeader';
import FormActions from '../components/layout/FormActions';
import ExtractedDataView from '../components/vehicleForm/ExtractedDataView';
import SectionsView from '../components/vehicleForm/SectionsView';
import UnifiedView from '../components/vehicleForm/UnifiedView';
import type { FormData, ExtractedData, CollapsedSections } from '../types/vehicleSpecs';
import { sections as allSections } from '../constants/vehicleFormSections';

type ViewMode = 'extracted' | 'sections' | 'unified';

const VehicleHomologationPage = () => {
  const [formData, setFormData] = useState<FormData>({});
  const [collapsedSections, setCollapsedSections] = useState<CollapsedSections>({});
  const [viewMode, setViewMode] = useState<ViewMode>('sections');
  const [extractedData, setExtractedData] = useState<ExtractedData>({});

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

  // updateFinalValue es lo mismo que updateField en este contexto,
  // pero mantenemos la semántica si planeas diferenciarla más tarde.
  const updateFinalValue = (fieldKey: string, value: string) => {
    updateField(fieldKey, value);
  };

  const toggleSection = (sectionIndex: number) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  const totalFields = useMemo(() => allSections.reduce((acc, section) => acc + section.fields.length, 0), []);
  const completedFields = useMemo(() => Object.keys(formData).filter(key => formData[key] && String(formData[key]).trim() !== '').length, [formData]);
  const completedPercentage = useMemo(() => totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0, [completedFields, totalFields]);

  const handleSaveDraft = () => {
    console.log("Guardar Borrador:", formData);
    // Aquí iría la lógica para guardar el borrador
  };

  const handleSubmit = () => {
    console.log("Finalizar y Enviar:", formData);
    // Aquí iría la lógica para enviar el formulario
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