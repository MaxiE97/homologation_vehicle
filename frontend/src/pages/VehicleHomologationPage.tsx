// frontend/src/pages/VehicleHomologationPage.tsx
import { useState, useMemo, useCallback } from 'react';
import FormHeader from '../components/layout/FormHeader';
import FormActions from '../components/layout/FormActions';
import ExtractedDataView from '../components/vehicleForm/ExtractedDataView';
import SectionsView from '../components/vehicleForm/SectionsView';
import UnifiedView from '../components/vehicleForm/UnifiedView';
import UrlInputSection from '../components/vehicleForm/UrlInputSection';
// Se ha limpiado 'FieldConfig' de los imports ya que no se usa directamente aquí
import type { FormData, ExtractedData, CollapsedSections } from '../types/vehicleSpecs';
import { sections as allSections } from '../constants/vehicleFormSections';
import { supportedLanguages, predefinedTranslations } from '../constants/localization';
import api from '../services/api';

// TIPO AÑADIDO: Aquí definimos el tipo 'ViewMode' que faltaba.
type ViewMode = 'extracted' | 'sections' | 'unified';

// Interfaz que define los datos que llegan del backend
interface VehicleRow {
  Key: string;
  "Valor Sitio 1": string | number | null;
  "Valor Sitio 2": string | number | null;
  "Valor Sitio 3": string | number | null;
  "Valor Final": string | number | null;
}

// Función que transforma la respuesta de la API al estado del frontend.
const transformApiDataToState = (apiData: VehicleRow[]): { newExtractedData: ExtractedData; newFormData: FormData } => {
  const newExtractedData: ExtractedData = {};
  const newFormData: FormData = {};

  apiData.forEach(row => {
    const fieldKey = row.Key;
    if (fieldKey) {
      newExtractedData[fieldKey] = {
        site1: row["Valor Sitio 1"],
        site2: row["Valor Sitio 2"],
        site3: row["Valor Sitio 3"],
      };
      newFormData[fieldKey] = row["Valor Final"] || '';
    }
  });

  return { newExtractedData, newFormData };
};


const VehicleHomologationPage = () => {
  const [formData, setFormData] = useState<FormData>({});
  const [originalFormData, setOriginalFormData] = useState<FormData>({});
  const [collapsedSections, setCollapsedSections] = useState<CollapsedSections>({});
  const [viewMode, setViewMode] = useState<ViewMode>('extracted');
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [url1, setUrl1] = useState<string>('');
  const [url2, setUrl2] = useState<string>('');
  const [url3, setUrl3] = useState<string>('');
  const [transmissionOption, setTransmissionOption] = useState<string>('Default');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const allFieldsFlat = useMemo(() => allSections.flatMap(section => section.fields), []);

  const handleProcessUrls = async () => {
    if (!url1 && !url2 && !url3) {
      alert("Please enter at least one URL.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    setExtractedData({});

    try {
      const payload = {
        url1: url1 || null,
        url2: url2 || null,
        url3: url3 || null,
        transmission_option: transmissionOption,
      };
      const response = await api.post<VehicleRow[]>('/processing/process-vehicle', payload);
      if (response.data) {
        const { newExtractedData, newFormData } = transformApiDataToState(response.data);
        setExtractedData(newExtractedData);
        setFormData(newFormData);
        setOriginalFormData(newFormData);
      }
    } catch (err) {
      console.error("Error processing URLs:", err);
      setError("Failed to process URLs. The server might be down or the URLs are invalid. Check the console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  const updateField = (fieldKey: string, value: string) => setFormData(prev => ({ ...prev, [fieldKey]: value }));
  const updateExtractedField = (fieldKey: string, site: string, value: string) => setExtractedData(prev => ({ ...prev, [fieldKey]: { ...(prev[fieldKey] || {}), [site]: value } }));
  const updateFinalValue = (fieldKey: string, value: string) => updateField(fieldKey, value);
  const toggleSection = (sectionIndex: number) => setCollapsedSections(prev => ({ ...prev, [sectionIndex]: !prev[sectionIndex] }));
  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    if (languageCode === 'en') {
      setFormData(originalFormData);
    }
  };
  
  const handleTranslateFinalValues = useCallback(() => {
    if (selectedLanguage === 'en') {
      setFormData(originalFormData);
      alert('Values restored to the original English.');
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
        }
      }
    }
    setFormData(newTranslatedFormData); 
    alert(changesMade 
      ? `Values translated to ${supportedLanguages.find(l=>l.code === selectedLanguage)?.name}.`
      : `No applicable predefined translations were found for ${supportedLanguages.find(l=>l.code === selectedLanguage)?.name}.`
    );
  }, [originalFormData, selectedLanguage]);

  const totalFields = useMemo(() => allFieldsFlat.length, [allFieldsFlat]);
  const completedFields = useMemo(() => Object.keys(formData).filter(key => formData[key] && String(formData[key]).trim() !== '').length, [formData]);
  const completedPercentage = useMemo(() => totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0, [completedFields, totalFields]);
  const handleSaveDraft = () => { /* sin cambios */ };
  const handleSubmit = () => { /* sin cambios */ };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <FormHeader
        completedFields={completedFields} totalFields={totalFields} viewMode={viewMode}
        onViewModeChange={setViewMode} supportedLanguages={supportedLanguages}
        selectedLanguage={selectedLanguage} onLanguageChange={handleLanguageChange} 
        onTranslateRequest={handleTranslateFinalValues}
      />
      <div className="max-w-5xl mx-auto px-6 py-6">
        {viewMode === 'extracted' && ( 
          <UrlInputSection
            url1={url1} setUrl1={setUrl1} url2={url2} setUrl2={setUrl2} url3={url3} setUrl3={setUrl3}
            transmissionOption={transmissionOption} setTransmissionOption={setTransmissionOption}
            onProcessUrls={handleProcessUrls}
            isProcessing={isProcessing}
          /> 
        )}
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">{error}</div>}

        {viewMode === 'extracted' && Object.keys(extractedData).length > 0 && ( 
          <ExtractedDataView
            formData={formData} extractedData={extractedData}
            onExtractedDataChange={updateExtractedField} onFinalValueChange={updateFinalValue}
          /> 
        )}
        {viewMode === 'sections' && (
          <SectionsView
            formData={formData} collapsedSections={collapsedSections}
            onToggleSection={toggleSection} onFieldChange={updateField} allFields={allFieldsFlat}
          />
        )}
        {viewMode === 'unified' && (
          <UnifiedView
            formData={formData} onFieldChange={updateField} allFields={allFieldsFlat}
          />
        )}
        <FormActions
          completedPercentage={completedPercentage}
          onSaveDraft={handleSaveDraft} onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default VehicleHomologationPage;