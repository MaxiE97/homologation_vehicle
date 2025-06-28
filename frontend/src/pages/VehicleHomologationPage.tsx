// frontend/src/pages/VehicleHomologationPage.tsx

import { useState, useMemo, useCallback, Fragment, useEffect } from 'react';
import FormHeader from '../components/layout/FormHeader';
import FormActions from '../components/layout/FormActions';
import ExtractedDataView from '../components/vehicleForm/ExtractedDataView';
import SectionsView from '../components/vehicleForm/SectionsView';
import UnifiedView from '../components/vehicleForm/UnifiedView';
import UrlInputSection from '../components/vehicleForm/UrlInputSection';
import Modal from '../components/common/Modal';
import type { FormData, ExtractedData, CollapsedSections } from '../types/vehicleSpecs';
import { sections as allSections } from '../constants/vehicleFormSections';
import { supportedLanguages, predefinedTranslations } from '../constants/localization';
import { toast } from 'react-toastify';
import api from '../services/api';

type ViewMode = 'extracted' | 'sections' | 'unified';

interface VehicleRow {
  key: string;
  "Valor Sitio 1": string | number | null;
  "Valor Sitio 2": string | number | null;
  "Valor Sitio 3": string | number | null;
  "Valor Final": string | number | null;
}

const transformApiDataToState = (apiData: VehicleRow[]): { newExtractedData: ExtractedData; newFormData: FormData } => {
  const newExtractedData: ExtractedData = {};
  const newFormData: FormData = {};

  apiData.forEach(row => {
    const fieldKey = row.key;
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
    // --- CAMBIO: LEER ESTADOS DESDE LOCALSTORAGE AL INICIAR ---
    const [formData, setFormData] = useState<FormData>(() => {
        try {
            const savedData = localStorage.getItem('homologationFormData');
            return savedData ? JSON.parse(savedData) : {};
        } catch (error) { return {}; }
    });

    const [extractedData, setExtractedData] = useState<ExtractedData>(() => {
        try {
            const savedData = localStorage.getItem('homologationExtractedData');
            return savedData ? JSON.parse(savedData) : {};
        } catch (error) { return {}; }
    });

    const [url1, setUrl1] = useState<string>(() => localStorage.getItem('homologationUrl1') || '');
    const [url2, setUrl2] = useState<string>(() => localStorage.getItem('homologationUrl2') || '');
    const [url3, setUrl3] = useState<string>(() => localStorage.getItem('homologationUrl3') || '');
    const [transmissionOption, setTransmissionOption] = useState<string>(() => localStorage.getItem('homologationTransmissionOption') || 'Default');

    // Estados que no necesitan persistencia
    const [originalFormData, setOriginalFormData] = useState<FormData>({});
    const [collapsedSections, setCollapsedSections] = useState<CollapsedSections>({});
    const [viewMode, setViewMode] = useState<ViewMode>('extracted');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);

    // --- CAMBIO: GUARDAR ESTADOS EN LOCALSTORAGE CADA VEZ QUE CAMBIAN ---
    useEffect(() => {
        try {
            localStorage.setItem('homologationFormData', JSON.stringify(formData));
            localStorage.setItem('homologationExtractedData', JSON.stringify(extractedData));
            localStorage.setItem('homologationUrl1', url1);
            localStorage.setItem('homologationUrl2', url2);
            localStorage.setItem('homologationUrl3', url3);
            localStorage.setItem('homologationTransmissionOption', transmissionOption);
        } catch (error) {
            console.error("Error saving data to localStorage", error);
        }
    }, [formData, extractedData, url1, url2, url3, transmissionOption]);

    const allFieldsFlat = useMemo(() => allSections.flatMap(section => section.fields), []);

    const handleProcessUrls = async () => {
        if (!url1 && !url2 && !url3) {
            toast.error("Please enter at least one URL.");
            return;
        }
        setIsProcessing(true);
        setError(null);
        
        try {
            const payload = { url1: url1 || null, url2: url2 || null, url3: url3 || null, transmission_option: transmissionOption };
            const response = await api.post<VehicleRow[]>('/process-vehicle', payload);
            if (response.data) {
                const { newExtractedData, newFormData } = transformApiDataToState(response.data);
                setExtractedData(newExtractedData);
                setFormData(newFormData);
                setOriginalFormData(newFormData);
            }
        } catch (err) {
            console.error("Error processing URLs:", err);
            setError("Failed to process URLs. The server might be down or the URLs are invalid.");
        } finally {
            setIsProcessing(false);
        }
    };

    const updateField = (fieldKey: string, value: string) => setFormData(prev => ({ ...prev, [fieldKey]: value }));
    const updateExtractedField = (fieldKey: string, site: string, value: string) => setExtractedData(prev => ({ ...prev, [fieldKey]: { ...(prev[fieldKey] || {}), [site]: value } }));
    const updateFinalValue = (fieldKey: string, value: string) => updateField(fieldKey, value);
    const toggleSection = (sectionIndex: number) => setCollapsedSections(prev => ({ ...prev, [sectionIndex]: !prev[sectionIndex] }));
    const handleLanguageChange = (languageCode: string) => setSelectedLanguage(languageCode);

    const handleTranslateFinalValues = useCallback(() => {
        if (selectedLanguage === 'en') {
            setFormData(originalFormData);
            toast.success('Values restored to the original English.');
            return;
        }
        const newTranslatedFormData: FormData = { ...originalFormData };
        let changesMade = false;
        for (const fieldKey in originalFormData) {
            const originalValue = String(originalFormData[fieldKey]);
            const translationsForField = predefinedTranslations[fieldKey];
            if (translationsForField) {
                const parts = originalValue.split('/').map(p => p.trim());
                const translatedParts = parts.map(part => {
                    if (translationsForField[part] && translationsForField[part][selectedLanguage]) {
                        changesMade = true;
                        return translationsForField[part][selectedLanguage];
                    }
                    return part;
                });
                newTranslatedFormData[fieldKey] = translatedParts.join(' / ');
            }
        }
        setFormData(newTranslatedFormData);
        toast[changesMade ? 'success' : 'info'](
            changesMade
                ? `Values translated to ${supportedLanguages.find(l => l.code === selectedLanguage)?.name}.`
                : `No applicable predefined translations were found.`
        );
    }, [originalFormData, selectedLanguage]);

    const totalFields = useMemo(() => allFieldsFlat.length, [allFieldsFlat]);
    const completedFields = useMemo(() => Object.keys(formData).filter(key => formData[key] && String(formData[key]).trim() !== '').length, [formData]);
    const completedPercentage = useMemo(() => totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0, [completedFields, totalFields]);
    
    const handleOpenSubmitModal = () => {
        if (Object.keys(formData).length === 0) {
            toast.error("No data to submit. Please process URLs first.");
            return;
        }
        setIsSubmitModalOpen(true);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            const payload = {
                language: selectedLanguage,
                final_data: Object.entries(formData).map(([key, value]) => ({ Key: key, "Valor Final": value })),
            };
            const response = await api.post('/export-document', payload, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'homologacion.docx';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
                if (filenameMatch && filenameMatch[1]) filename = filenameMatch[1];
            }
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Document generated successfully!');
        } catch (err) {
            console.error("Error submitting data for export:", err);
            toast.error("Failed to generate the document.");
        } finally {
            setIsSubmitting(false);
            setIsSubmitModalOpen(false);
        }
    };

    return (
        <Fragment>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <FormHeader
                    completedFields={completedFields} totalFields={totalFields} viewMode={viewMode}
                    onViewModeChange={setViewMode} supportedLanguages={supportedLanguages}
                    selectedLanguage={selectedLanguage} onLanguageChange={handleLanguageChange}
                    onTranslateRequest={handleTranslateFinalValues}
                />
                <div className="max-w-7xl mx-auto px-6 py-6">
                    {viewMode === 'extracted' && (
                        <UrlInputSection
                            url1={url1} setUrl1={setUrl1} url2={url2} setUrl2={setUrl2} url3={url3} setUrl3={setUrl3}
                            transmissionOption={transmissionOption} setTransmissionOption={setTransmissionOption}
                            onProcessUrls={handleProcessUrls}
                            isProcessing={isProcessing}
                            processingError={error}
                        />
                    )}
                    {viewMode !== 'extracted' && error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">{error}</div>}
                    {viewMode === 'extracted' && Object.keys(extractedData).length > 0 && (
                        <ExtractedDataView formData={formData} extractedData={extractedData} onExtractedDataChange={updateExtractedField} onFinalValueChange={updateFinalValue} />
                    )}
                    {viewMode === 'sections' && (
                        <SectionsView formData={formData} collapsedSections={collapsedSections} onToggleSection={toggleSection} onFieldChange={updateField} allFields={allFieldsFlat} />
                    )}
                    {viewMode === 'unified' && (
                        <UnifiedView formData={formData} onFieldChange={updateField} allFields={allFieldsFlat} />
                    )}
                    <FormActions completedPercentage={completedPercentage} onSaveDraft={() => {}} onSubmit={handleOpenSubmitModal} isSubmitting={isSubmitting} />
                </div>
            </div>
            <Modal isOpen={isSubmitModalOpen} onClose={() => !isSubmitting && setIsSubmitModalOpen(false)} title={isSubmitting ? "Generating Document..." : "Confirm Submission"}>
                {isSubmitting ? (
                    <div className="flex flex-col items-center justify-center space-y-4 my-4">
                        <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-600">Please wait, your document is being prepared.</p>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm text-gray-600 mb-2">You are about to generate and download the homologation document.</p>
                        <p className="text-sm text-gray-600">Please confirm that all data is correct before proceeding.</p>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => setIsSubmitModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors">Cancel</button>
                            <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">Confirm and Download</button>
                        </div>
                    </div>
                )}
            </Modal>
        </Fragment>
    );
};

export default VehicleHomologationPage;