// frontend/src/components/vehicleForm/UnifiedView.tsx
import React from 'react';
import FormField from '../common/FormField'; //
import FieldGroupTable from '../common/FieldGroupTable'; // Importamos el nuevo componente
import { sections as allSections } from '../../constants/vehicleFormSections'; //
import type { FormData, FieldConfig } from '../../types/vehicleSpecs'; //

interface UnifiedViewProps {
  formData: FormData;
  onFieldChange: (fieldKey: string, value: string) => void;
  allFields: FieldConfig[]; // Nueva prop
}

const UnifiedView: React.FC<UnifiedViewProps> = ({ formData, onFieldChange, allFields }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
      <div className="space-y-8">
        {allSections.map((section, sectionIndex) => {
          const IconComponent = section.icon;
          // Creamos un conjunto de keys de campos que están en tablas para esta sección
          const fieldsInAnyTableInSection = new Set(
            section.tableGroups?.flatMap(tg => tg.fieldsInTable) || []
          );

          return (
            <div key={sectionIndex}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 bg-gradient-to-r ${section.color} rounded-lg`}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
              </div>

              {/* Renderizar TableGroups primero */}
              {section.tableGroups?.map(tableConfig => (
                <FieldGroupTable
                  key={tableConfig.id}
                  tableConfig={tableConfig}
                  formData={formData}
                  onFieldChange={onFieldChange}
                  allFields={allFields}
                />
              ))}

              {/* Luego renderizar campos individuales que NO están en una tabla */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {section.fields
                  .filter(field => !fieldsInAnyTableInSection.has(field.key)) // Omitir campos en tablas
                  .map((field) => (
                    <div key={field.key} className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}
                      </label>
                      <FormField
                        field={field}
                        value={formData[field.key]}
                        onChange={(value) => onFieldChange(field.key, value)}
                      />
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UnifiedView;