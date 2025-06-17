// frontend/src/components/vehicleForm/ExtractedDataView.tsx

import React from 'react';
import type { FieldConfig, FormData, ExtractedData } from '../../types/vehicleSpecs';
import { sections as allSections } from '../../constants/vehicleFormSections';

import site1Icon from '../../assets/icons/site1.png';
import site2Icon from '../../assets/icons/site2.png';
import site3Icon from '../../assets/icons/site3.png';

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
  onFinalValueChange,
}) => {
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
                  <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                    <img src={site1Icon} alt="Site 1 Logo" className="w-5 h-5 object-contain" />
                  </div>
                  <span>Voertuig</span>
                </div>
              </th>

              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 min-w-[150px]">
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                    <img src={site2Icon} alt="Site 2 Logo" className="w-5 h-5 object-contain" />
                  </div>
                  <span>Typenscheine</span>
                </div>
              </th>

              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 min-w-[150px]">
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                    <img src={site3Icon} alt="Site 3 Logo" className="w-5 h-5 object-contain" />
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
              <tr key={field.key} className={`border-b border-gray-100 hover:bg-gray-100 transition-colors ${
                index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'
              }`}>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="font-medium text-gray-800 text-sm">{field.label}</span>
                  </div>
                </td>
                
                <td className="px-4 py-4">
                  <div className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg bg-blue-50/50 text-center text-gray-700">
                    {extractedData[field.key]?.site1 || <span className="text-gray-400">-</span>}
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg bg-purple-50/50 text-center text-gray-700">
                    {extractedData[field.key]?.site2 || <span className="text-gray-400">-</span>}
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="w-full px-3 py-2 text-sm border border-green-200 rounded-lg bg-green-50/50 text-center text-gray-700">
                    {extractedData[field.key]?.site3 || <span className="text-gray-400">-</span>}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type={field.type === 'select' || field.type === 'textarea' ? 'text' : field.type}
                      className="flex-1 px-3 py-2 text-sm border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:outline-none bg-gradient-to-r from-orange-50 to-red-50 font-semibold text-center"
                      placeholder="Final value"
                      value={formData[field.key] || ''}
                      onChange={(e) => onFinalValueChange(field.key, e.target.value)}
                    />
                    {/* --- CORREGIDO: Se usa field.key en lugar de key --- */}
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
    </div>
  );
};

export default ExtractedDataView;