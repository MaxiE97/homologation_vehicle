// frontend/src/pages/VehicleHomologationPage.tsx
import { useState, useMemo, useCallback } from 'react';
import FormHeader from '../components/layout/FormHeader';
import FormActions from '../components/layout/FormActions';
import ExtractedDataView from '../components/vehicleForm/ExtractedDataView';
import SectionsView from '../components/vehicleForm/SectionsView';
import UnifiedView from '../components/vehicleForm/UnifiedView';
import UrlInputSection from '../components/vehicleForm/UrlInputSection';
import type { FormData, ExtractedData, CollapsedSections } from '../types/vehicleSpecs'; //
import { sections as allSections } from '../constants/vehicleFormSections'; //
import { supportedLanguages, predefinedTranslations } from '../constants/localization';

type ViewMode = 'extracted' | 'sections' | 'unified';

const generateMockData = (sections: typeof allSections): { mockExtractedData: ExtractedData, initialFormData: FormData } => {
  const mockExtractedData: ExtractedData = {};
  const initialFormData: FormData = {}; // Cambiado el nombre para claridad

  sections.forEach(section => {
    section.fields.forEach(field => {
      let site1Value = Math.random() > 0.3 ? `${field.label} S1 - ${Math.floor(Math.random() * 1000)}` : (Math.random() > 0.5 ? null : 'N/A');
      const site2Value = Math.random() > 0.4 ? `${field.label} S2 - ${Math.floor(Math.random() * 1000)}` : null;
      const site3Value = Math.random() > 0.2 ? `${field.label} S3 - ${Math.floor(Math.random() * 1000)}` : 'N/A';
      
      // Inyectar valores conocidos para probar la traducción (estos serían los "originales" en inglés)
      if (field.key === 'working_principle' && Math.random() > 0.5) site1Value = 'In-line';
      else if (field.key === 'fuel' && Math.random() > 0.5) site1Value = 'Gasoline';
      else if (field.key === 'direct_injection' && Math.random() > 0.5) {
          // Asumimos que el valor base para Sí/No es el inglés para el diccionario
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
        // Aseguramos que el valor por defecto para select sea una opción válida si es posible
        finalValue = field.type === 'number' ? 0 : (field.options && field.options.length > 0 ? field.options[0] : `Default ${field.label}`);
      }
      initialFormData[field.key] = finalValue as string | number;
    });
  });

  return { mockExtractedData, initialFormData };
};


const VehicleHomologationPage = () => {
  const [formData, setFormData] = useState<FormData>({}); // Este será el que se muestra y edita, puede estar traducido
  const [originalFormData, setOriginalFormData] = useState<FormData>({}); // Este guardará los valores "madre" en inglés
  const [collapsedSections, setCollapsedSections] = useState<CollapsedSections>({});
  const [viewMode, setViewMode] = useState<ViewMode>('extracted');
  const [extractedData, setExtractedData] = useState<ExtractedData>({});

  const [url1, setUrl1] = useState<string>('');
  const [url2, setUrl2] = useState<string>('');
  const [url3, setUrl3] = useState<string>('');
  const [transmissionOption, setTransmissionOption] = useState<string>('Por defecto');

  // Asumimos que 'en' es el código para Inglés en supportedLanguages
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en'); 

  const updateField = (fieldKey: string, value: string) => {
    // Cuando un campo se edita, actualizamos formData.
    // También podríamos decidir si esta edición debe actualizar originalFormData
    // o si las traducciones se pierden/revierten al editar.
    // Por ahora, solo actualiza formData. Si se traduce de nuevo, usará originalFormData.
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
    updateField(fieldKey, value); // Esto ya actualiza formData
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
    setOriginalFormData(initialFormData); // Guardamos los datos originales
    setFormData(initialFormData);        // Establecemos formData con los originales (inglés por defecto)
    setSelectedLanguage('en'); // Siempre volvemos a inglés al procesar nuevas URLs
  };

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    // Si el usuario cambia de idioma, NO traducimos automáticamente.
    // Dejamos que presione el botón "Traducir" explícitamente.
    // Si el idioma seleccionado es 'en', restauramos desde originalFormData.
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
    const newTranslatedFormData: FormData = { ...originalFormData }; // Empezar con una copia de los originales
    let changesMade = false;

    for (const fieldKey in originalFormData) { // Iterar sobre los datos originales
      const originalValue = String(originalFormData[fieldKey]);
      
      if (predefinedTranslations[fieldKey] && predefinedTranslations[fieldKey][originalValue]) {
        const translationForCurrentLang = predefinedTranslations[fieldKey][originalValue][selectedLanguage];
        if (translationForCurrentLang) {
          newTranslatedFormData[fieldKey] = translationForCurrentLang;
          changesMade = true;
          console.log(`Campo '${fieldKey}': Original '${originalValue}' -> Traducido '${translationForCurrentLang}'`);
        } else {
          // Si no hay traducción para el idioma actual, mantener el valor original (inglés)
          newTranslatedFormData[fieldKey] = originalValue;
        }
      } else {
        // Si el campo o el valor no están en el diccionario, mantener el valor original (inglés)
        newTranslatedFormData[fieldKey] = originalValue;
      }
    }

    setFormData(newTranslatedFormData); // Actualizar formData con los valores (traducidos o no)

    if (changesMade) {
      alert(`Valores traducidos (o intentados traducir) a: ${supportedLanguages.find(l=>l.code === selectedLanguage)?.name}. Revisa la consola.`);
    } else {
      alert(`No se encontraron traducciones predefinidas aplicables para ${supportedLanguages.find(l=>l.code === selectedLanguage)?.name}. Se muestran valores originales.`);
    }
  }, [originalFormData, selectedLanguage]); // Dependemos de originalFormData y selectedLanguage

  const totalFields = useMemo(() => allSections.reduce((acc, section) => acc + section.fields.length, 0), []);
  const completedFields = useMemo(() => Object.keys(formData).filter(key => formData[key] && String(formData[key]).trim() !== '').length, [formData]);
  const completedPercentage = useMemo(() => totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0, [completedFields, totalFields]);

  const handleSaveDraft = () => {
    console.log("Guardar Borrador:", { 
      urls: {url1, url2, url3}, 
      transmission: transmissionOption, 
      language: selectedLanguage, 
      data: formData, // Datos actualmente mostrados (pueden estar traducidos)
      originalData: originalFormData, // Datos originales en inglés
      extracted: extractedData 
    });
  };

  const handleSubmit = () => {
    // formData ya contiene los valores en el idioma deseado (si se tradujo)
    // o en inglés si no se tradujo o se volvió a inglés.
    const finalDataForExport = allSections.flatMap(section =>
      section.fields.map(field => ({
        Key: field.label, 
        "Valor Final": formData[field.key] || "-" 
      }))
    );

    console.log("Finalizar y Enviar (Simulado):");
    console.log("Idioma para la plantilla:", selectedLanguage); // Este es el idioma para la plantilla DOCX
    console.log("Datos Finales para Exportar (pueden estar traducidos):", finalDataForExport);
    alert(`Simulación de envío para exportar en ${selectedLanguage}. Revisa la consola.`);
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
        onLanguageChange={handleLanguageChange} // Usamos el nuevo manejador
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
            formData={formData} // Este es el que se muestra y edita
            extractedData={extractedData}
            onExtractedDataChange={updateExtractedField}
            onFinalValueChange={updateFinalValue}
          />
        )}
        {viewMode === 'sections' && (
          <SectionsView
            formData={formData} // Este es el que se muestra y edita
            collapsedSections={collapsedSections}
            onToggleSection={toggleSection}
            onFieldChange={updateField}
          />
        )}
        {viewMode === 'unified' && (
          <UnifiedView
            formData={formData} // Este es el que se muestra y edita
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