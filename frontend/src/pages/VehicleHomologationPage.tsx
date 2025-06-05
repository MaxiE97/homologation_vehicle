// frontend/src/pages/VehicleHomologationPage.tsx
import { useState, useMemo, useCallback } from 'react';
import FormHeader from '../components/layout/FormHeader';
import FormActions from '../components/layout/FormActions';
import ExtractedDataView from '../components/vehicleForm/ExtractedDataView';
import SectionsView from '../components/vehicleForm/SectionsView';
import UnifiedView from '../components/vehicleForm/UnifiedView';
import UrlInputSection from '../components/vehicleForm/UrlInputSection';
import type {  FormData, ExtractedData, CollapsedSections } from '../types/vehicleSpecs'; //
import { sections as allSections } from '../constants/vehicleFormSections';
import { supportedLanguages, predefinedTranslations } from '../constants/localization';
import { generateMockData } from '../utils/mockDataGenerator';

type ViewMode = 'extracted' | 'sections' | 'unified';

const VehicleHomologationPage = () => {
  const [formData, setFormData] = useState<FormData>({});
  const [originalFormData, setOriginalFormData] = useState<FormData>({});
  const [collapsedSections, setCollapsedSections] = useState<CollapsedSections>({});
  const [viewMode, setViewMode] = useState<ViewMode>('extracted');
  const [extractedData, setExtractedData] = useState<ExtractedData>({});

  const [url1, setUrl1] = useState<string>('');
  const [url2, setUrl2] = useState<string>('');
  const [url3, setUrl3] = useState<string>('');
  const [transmissionOption, setTransmissionOption] = useState<string>('Por defecto');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en'); 

  // Creamos una lista plana de todas las FieldConfigs.
  // Esto es útil para pasar a componentes que necesiten buscar FieldConfig por key.
  const allFieldsFlat = useMemo(() => allSections.flatMap(section => section.fields), [allSections]);

  const updateField = (fieldKey: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldKey]: value }));
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
    const { mockExtractedData, initialFormData } = generateMockData(allSections);
    setExtractedData(mockExtractedData);
    setOriginalFormData(initialFormData); 
    setFormData(initialFormData);        
    setSelectedLanguage('en'); 
    console.log("Datos simulados generados y cargados.");
  };

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    if (languageCode === 'en') {
      setFormData(originalFormData);
      console.log("Idioma cambiado a Inglés. Mostrando valores originales.");
    }
  };
  
  const handleTranslateFinalValues = useCallback(() => {
    if (selectedLanguage === 'en') {
      setFormData(originalFormData);
      alert('Valores restaurados al Inglés original.');
      return;
    }
    const newTranslatedFormData: FormData = { ...originalFormData }; 
    let changesMade = false;
    for (const fieldKey in originalFormData) { 
      const originalValue = String(originalFormData[fieldKey]);
      if (predefinedTranslations[fieldKey] && predefinedTranslations[fieldKey][originalValue]) {
        const translationForCurrentLang = predefinedTranslations[fieldKey][originalValue][selectedLanguage];
        if (translationForCurrentLang) {
          newTranslatedFormData[fieldKey] = translationForCurrentLang;
          changesMade = true;
        } else {
          newTranslatedFormData[fieldKey] = originalValue;
        }
      } else {
        newTranslatedFormData[fieldKey] = originalValue;
      }
    }
    setFormData(newTranslatedFormData); 
    if (changesMade) {
      alert(`Valores traducidos (o intentados traducir) a: ${supportedLanguages.find(l=>l.code === selectedLanguage)?.name}. Revisa la consola.`);
    } else {
      alert(`No se encontraron traducciones predefinidas aplicables para ${supportedLanguages.find(l=>l.code === selectedLanguage)?.name}. Se muestran valores originales.`);
    }
  }, [originalFormData, selectedLanguage]); 

  const totalFields = useMemo(() => allFieldsFlat.length, [allFieldsFlat]); // Usamos allFieldsFlat para el total
  const completedFields = useMemo(() => Object.keys(formData).filter(key => formData[key] && String(formData[key]).trim() !== '').length, [formData]);
  const completedPercentage = useMemo(() => totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0, [completedFields, totalFields]);

  const handleSaveDraft = () => {
    console.log("Guardar Borrador:", { urls: {url1, url2, url3}, transmission: transmissionOption, language: selectedLanguage, data: formData, originalData: originalFormData, extracted: extractedData });
    alert("Borrador guardado en consola (simulado).");
  };

  const handleSubmit = () => {
    const finalDataForExport = allFieldsFlat.map(field => { // Usamos allFieldsFlat para asegurar todos los campos
        const currentValue = formData[field.key];
        const valorFinalParaExportar = (currentValue === null || currentValue === undefined || String(currentValue).trim() === '') 
                                       ? "-" 
                                       : String(currentValue);
        return {
          Key: field.label, 
          "Valor Final": valorFinalParaExportar
        };
      });
    const payload = { language: supportedLanguages.find(l => l.code === selectedLanguage)?.name || selectedLanguage, final_data: finalDataForExport };
    console.log("Finalizar y Enviar (Simulado): Payload para el backend", JSON.stringify(payload, null, 2));
    alert(`Simulación de envío para exportar en ${payload.language}. Revisa la consola para ver el payload detallado.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <FormHeader /* ...props... */ 
        completedFields={completedFields}
        totalFields={totalFields}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        supportedLanguages={supportedLanguages}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange} 
        onTranslateRequest={handleTranslateFinalValues}
      />
      <div className="max-w-5xl mx-auto px-6 py-6">
        {viewMode === 'extracted' && ( <UrlInputSection /* ...props... */ 
            url1={url1} setUrl1={setUrl1} url2={url2} setUrl2={setUrl2} url3={url3} setUrl3={setUrl3}
            transmissionOption={transmissionOption} setTransmissionOption={setTransmissionOption}
            onProcessUrls={handleProcessUrls}
        /> )}
        {viewMode === 'extracted' && Object.keys(extractedData).length > 0 && ( <ExtractedDataView /* ...props... */
            formData={formData} extractedData={extractedData}
            onExtractedDataChange={updateExtractedField} onFinalValueChange={updateFinalValue}
        /> )}
        {viewMode === 'sections' && (
          <SectionsView
            formData={formData}
            collapsedSections={collapsedSections}
            onToggleSection={toggleSection}
            onFieldChange={updateField}
            allFields={allFieldsFlat} // Pasamos allFieldsFlat
          />
        )}
        {viewMode === 'unified' && (
          <UnifiedView
            formData={formData}
            onFieldChange={updateField}
            allFields={allFieldsFlat} // Pasamos allFieldsFlat
          />
        )}
        <FormActions /* ...props... */ 
            completedPercentage={completedPercentage}
            onSaveDraft={handleSaveDraft} onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};
export default VehicleHomologationPage;