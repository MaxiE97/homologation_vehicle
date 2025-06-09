// frontend/src/components/vehicleForm/ExtractedDataView.tsx
import React from 'react';
import type { FieldConfig, FormData, ExtractedData } from '../../types/vehicleSpecs'; //
import { sections as allSections } from '../../constants/vehicleFormSections'; //

const allFields: FieldConfig[] = allSections.flatMap(section => section.fields);

interface ExtractedDataViewProps {
  formData: FormData;
  extractedData: ExtractedData;
  onExtractedDataChange: (fieldKey: string, site: string, value: string) => void;
  onFinalValueChange: (fieldKey: string, value: string) => void;
}

const ExtractedDataView: React.FC<ExtractedDataViewProps> = ({
  formData,
  extractedData,
  onExtractedDataChange,
  onFinalValueChange,
}) => {
  // The handleCopyFromSite function is no longer necessary if we remove the buttons.
  // If it were ever needed again, it would have to be re-evaluated.
  // const handleCopyFromSite = (siteKey: 'site1' | 'site2' | 'site3') => {
  //   allFields.forEach(field => {
  //     const siteValue = extractedData[field.key]?.[siteKey];
  //     if (siteValue !== undefined && siteValue !== null) {
  //       onFinalValueChange(field.key, String(siteValue));
  //     }
  //   });
  // };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <h2 className="text-lg font-semibold text-gray-800">Extracted Data Comparison</h2>
        <p className="text-sm text-gray-600">Compare data from multiple sources and set the final value</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 min-w-[250px]">Field</th>
              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 min-w-[150px]">
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">S1</span>
                  </div>
                  <span>Voertuig</span>
                </div>
              </th>
              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 min-w-[150px]">
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">S2</span>
                  </div>
                  <span>Typenscheine</span>
                </div>
              </th>
              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 min-w-[150px]">
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">S3</span>
                  </div>
                  <span>Auto-data 3</span>
                </div>
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 min-w-[180px]">
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span>Final Value</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {allFields.map((field, index) => (
              <tr key={field.key} className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${
                index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'
              }`}>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="font-medium text-gray-800 text-sm">{field.label}</span>
                  </div>
                </td>
                {/* Site 1 */}
                <td className="px-4 py-4">
                  <input
                    type={field.type === 'select' || field.type === 'textarea' ? 'text' : field.type}
                    className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none bg-blue-50/50 text-center"
                    placeholder="Source 1"
                    value={extractedData[field.key]?.site1 || ''}
                    onChange={(e) => onExtractedDataChange(field.key, 'site1', e.target.value)}
                  />
                </td>
                {/* Site 2 */}
                <td className="px-4 py-4">
                  <input
                    type={field.type === 'select' || field.type === 'textarea' ? 'text' : field.type}
                    className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none bg-purple-50/50 text-center"
                    placeholder="Source 2"
                    value={extractedData[field.key]?.site2 || ''}
                    onChange={(e) => onExtractedDataChange(field.key, 'site2', e.target.value)}
                  />
                </td>
                {/* Site 3 */}
                <td className="px-4 py-4">
                  <input
                    type={field.type === 'select' || field.type === 'textarea' ? 'text' : field.type}
                    className="w-full px-3 py-2 text-sm border border-green-200 rounded-lg focus:border-green-500 focus:outline-none bg-green-50/50 text-center"
                    placeholder="Source 3"
                    value={extractedData[field.key]?.site3 || ''}
                    onChange={(e) => onExtractedDataChange(field.key, 'site3', e.target.value)}
                  />
                </td>
                {/* Final Value */}
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type={field.type === 'select' || field.type === 'textarea' ? 'text' : field.type}
                      className="flex-1 px-3 py-2 text-sm border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:outline-none bg-gradient-to-r from-orange-50 to-red-50 font-semibold text-center"
                      placeholder="Final value"
                      value={formData[field.key] || ''}
                      onChange={(e) => onFinalValueChange(field.key, e.target.value)}
                    />
                    {formData[field.key] && String(formData[field.key]).trim() !== '' && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* The following section <div className="px-6 py-4 ..."> HAS BEEN REMOVED */}
      {/* <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/30">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-green-600">
              {allFields.filter(field => formData[field.key] && String(formData[field.key]).trim() !== '').length}
            </span> de {allFields.length} valores finales definidos
          </div>
          <div className="flex space-x-2">
            <button onClick={() => handleCopyFromSite('site1')} className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
              Copiar de Sitio 1
            </button>
            <button onClick={() => handleCopyFromSite('site2')} className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
              Copiar de Sitio 2
            </button>
            <button onClick={() => handleCopyFromSite('site3')} className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
              Copiar de Sitio 3
            </button>
          </div>
        </div>
      </div> 
      */}
    </div>
  );
};
export default ExtractedDataView;