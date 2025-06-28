// frontend/src/components/vehicleForm/UrlInputSection.tsx
import React, { useState, useCallback } from 'react';
import UrlInputField from './UrlInputField';

interface UrlInputSectionProps {
  url1: string;
  setUrl1: (value: string) => void;
  url2: string;
  setUrl2: (value: string) => void;
  url3: string;
  setUrl3: (value: string) => void;
  transmissionOption: string;
  setTransmissionOption: (value: string) => void;
  onProcessUrls: () => void;
  isProcessing: boolean;
  processingError: string | null;
  onCleanData: () => void;
}

const ALLOWED_DOMAINS: { [key: string]: { domain: string; name: string } } = {
  url1: { domain: 'voertuig.net', name: 'Voertuig' },
  url2: { domain: 'typenscheine.ch', name: 'Typenscheine' },
  url3: { domain: 'auto-data.net', name: 'Auto-data' },
};

const UrlInputSection: React.FC<UrlInputSectionProps> = ({
  url1, setUrl1, url2, setUrl2, url3, setUrl3,
  transmissionOption, setTransmissionOption,
  onProcessUrls, isProcessing, processingError,
  onCleanData,
}) => {
  const [urlErrors, setUrlErrors] = useState<Partial<Record<'url1' | 'url2' | 'url3', string>>>({});

  const validateUrl = useCallback((url: string, fieldName: 'url1' | 'url2' | 'url3'): string | undefined => {
    if (!url.trim()) return undefined;
    try {
      const urlObj = new URL(url);
      const expectedDomain = ALLOWED_DOMAINS[fieldName]?.domain;
      const pageName = ALLOWED_DOMAINS[fieldName]?.name;
      if (!expectedDomain) return 'Invalid URL type for validation.';
      const hostname = urlObj.hostname.startsWith('www.') ? urlObj.hostname.substring(4) : urlObj.hostname;
      if (!hostname.endsWith(expectedDomain)) return `Please enter a URL corresponding to ${pageName}.`;
    } catch (e) {
      return `Please enter a valid URL.`;
    }
    return undefined;
  }, []);

  const handleUrlInputChange = (name: 'url1' | 'url2' | 'url3', value: string) => {
    if (name === 'url1') setUrl1(value);
    else if (name === 'url2') setUrl2(value);
    else if (name === 'url3') setUrl3(value);
  };

  const handleProcessUrlsClick = () => {
    let isValid = true;
    const newErrors: Partial<Record<'url1' | 'url2' | 'url3', string>> = {};
    const urlsToValidate = { url1, url2, url3 };
    (['url1', 'url2', 'url3'] as Array<'url1' | 'url2' | 'url3'>).forEach(key => {
      const error = validateUrl(urlsToValidate[key], key);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });
    setUrlErrors(newErrors);
    if (isValid) onProcessUrls();
  };

  const commonInputClasses = "w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors duration-200 bg-white";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 mb-6 shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Enter URLs and Options</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <UrlInputField label="Voertuig URL" name="url1" value={url1} onChange={(e) => handleUrlInputChange('url1', e.target.value)} placeholder="e.g., https://voertuig.net/kenteken/N358RX" disabled={isProcessing} error={urlErrors.url1} />
          <UrlInputField label="Typenscheine URL" name="url2" value={url2} onChange={(e) => handleUrlInputChange('url2', e.target.value)} placeholder="e.g., https://typenscheine.ch/en/Info/1PA375-PEUGEOT20614" disabled={isProcessing} error={urlErrors.url2} />
          <UrlInputField label="Auto-data URL" name="url3" value={url3} onChange={(e) => handleUrlInputChange('url3', e.target.value)} placeholder="e.g., https://www.auto-data.net/en/peugeot-3008-i-phase-ii" disabled={isProcessing} error={urlErrors.url3} />
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="transmissionOption" className={labelClasses}>Transmission Option</label>
            <select id="transmissionOption" name="transmissionOption" value={transmissionOption} onChange={(e) => setTransmissionOption(e.target.value)} className={`${commonInputClasses} ${isProcessing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`} disabled={isProcessing}>
              <option value="Default">Default</option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>
          </div>

          <div className="pt-5 space-y-3">
            <button
              onClick={handleProcessUrlsClick}
              disabled={isProcessing}
              className={`w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? 'Processing...' : 'Process URLs and Get Data'}
            </button>

            {/* --- BOTÓN ACTUALIZADO --- */}
            <button
              onClick={onCleanData}
              disabled={isProcessing}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>
      {processingError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {processingError}</span>
        </div>
      )}
    </div>
  );
};

export default UrlInputSection;