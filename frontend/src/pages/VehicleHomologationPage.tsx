// frontend/src/pages/VehicleHomologationPage.tsx
import { useState, useMemo, useCallback } from 'react';
import FormHeader from '../components/layout/FormHeader'; //
import FormActions from '../components/layout/FormActions'; //
import ExtractedDataView from '../components/vehicleForm/ExtractedDataView'; //
import SectionsView from '../components/vehicleForm/SectionsView'; //
import UnifiedView from '../components/vehicleForm/UnifiedView'; //
import UrlInputSection from '../components/vehicleForm/UrlInputSection';
import type { FormData, ExtractedData, CollapsedSections } from '../types/vehicleSpecs'; //
import { sections as allSections } from '../constants/vehicleFormSections'; //
import { supportedLanguages, predefinedTranslations } from '../constants/localization';

type ViewMode = 'extracted' | 'sections' | 'unified';

// La función generateMockData se mantiene igual que en la respuesta anterior
const generateMockData = (sections: typeof allSections): { mockExtractedData: ExtractedData, initialFormData: FormData } => {
  const mockExtractedData: ExtractedData = {};
  const initialFormData: FormData = {};

  sections.forEach(section => {
    section.fields.forEach(field => {
      let site1Value = Math.random() > 0.3 ? `${field.label} S1 - ${Math.floor(Math.random() * 1000)}` : (Math.random() > 0.5 ? null : 'N/A');
      const site2Value = Math.random() > 0.4 ? `${field.label} S2 - ${Math.floor(Math.random() * 1000)}` : null;
      const site3Value = Math.random() > 0.2 ? `${field.label} S3 - ${Math.floor(Math.random() * 1000)}` : 'N/A';
      
      if (field.key === 'working_principle' && Math.random() > 0.5) site1Value = 'In-line';
      else if (field.key === 'fuel' && Math.random() > 0.5) site1Value = 'Gasoline';
      else if (field.key === 'direct_injection' && Math.random() > 0.5) {
          site1Value = Math.random() > 0.5 ? 'Yes' : 'No';
      }

      mockExtractedData[field.key] = {
        site1: field.type === 'number' && site1Value && site1Value !== 'N/A' ? parseFloat(String(site1Value).split('-').pop()!) : site1Value,
        site2: field.type === 'number' && site2Value ? parseFloat(String(site2Value).split('-').pop()!) : site2Value,
        site3: field.type === 'number' && site3Value && site3Value !== 'N/A' ? parseFloat(String(site3Value).split('-').pop()!) : site3Value,
      };

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

    console.log(`Traduciendo valores finales de originalFormData al idioma: ${selectedLanguage}`);
    const newTranslatedFormData: FormData = { ...originalFormData }; 
    let changesMade = false;

    for (const fieldKey in originalFormData) { 
      const originalValue = String(originalFormData[fieldKey]);
      
      if (predefinedTranslations[fieldKey] && predefinedTranslations[fieldKey][originalValue]) {
        const translationForCurrentLang = predefinedTranslations[fieldKey][originalValue][selectedLanguage];
        if (translationForCurrentLang) {
          newTranslatedFormData[fieldKey] = translationForCurrentLang;
          changesMade = true;
          console.log(`Campo '${fieldKey}': Original '${originalValue}' -> Traducido '${translationForCurrentLang}'`);
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

  const totalFields = useMemo(() => allSections.reduce((acc, section) => acc + section.fields.length, 0), []);
  const completedFields = useMemo(() => Object.keys(formData).filter(key => formData[key] && String(formData[key]).trim() !== '').length, [formData]);
  const completedPercentage = useMemo(() => totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0, [completedFields, totalFields]);

  const handleSaveDraft = () => {
    console.log("Guardar Borrador:", { 
      urls: {url1, url2, url3}, 
      transmission: transmissionOption, 
      language: selectedLanguage, 
      data: formData, 
      originalData: originalFormData, 
      extracted: extractedData 
    });
     alert("Borrador guardado en consola (simulado).");
  };

  // Refinamos handleSubmit para asegurar que los valores vacíos se envíen como "-"
  const handleSubmit = () => {
    const finalDataForExport = allSections.flatMap(section =>
      section.fields.map(field => {
        const currentValue = formData[field.key];
        // Si el valor es null, undefined, o un string vacío, enviar "-", de lo contrario, el valor.
        // La coerción a String es importante si el valor es numérico (ej. 0).
        const valorFinalParaExportar = (currentValue === null || currentValue === undefined || String(currentValue).trim() === '') 
                                       ? "-" 
                                       : String(currentValue);
        return {
          Key: field.label, 
          "Valor Final": valorFinalParaExportar
        };
      })
    );

    const payload = {
        language: supportedLanguages.find(l => l.code === selectedLanguage)?.name || selectedLanguage, // Enviar el nombre del idioma o el código
        final_data: finalDataForExport
    };

    console.log("Finalizar y Enviar (Simulado): Payload para el backend");
    console.log(JSON.stringify(payload, null, 2)); // Mostramos el JSON formateado
    alert(`Simulación de envío para exportar en ${payload.language}. Revisa la consola para ver el payload detallado.`);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <FormHeader
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

        {viewMode === 'extracted' && Object.keys(extractedData).length > 0 && (
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