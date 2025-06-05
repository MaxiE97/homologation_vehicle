// frontend/src/components/vehicleForm/SectionItem.tsx
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import FormField from '../common/FormField'; //
import FieldGroupTable from '../common/FieldGroupTable'; // We import the new component
import type { SectionConfig, FormData, FieldConfig } from '../../types/vehicleSpecs'; //

interface SectionItemProps {
  section: SectionConfig;
  isCollapsed: boolean;
  formData: FormData;
  onToggle: () => void;
  onFieldChange: (fieldKey: string, value: string) => void;
  allFields: FieldConfig[]; // New prop
}

const SectionItem: React.FC<SectionItemProps> = ({
  section,
  isCollapsed,
  formData,
  onToggle,
  onFieldChange,
  allFields, // We receive allFields
}) => {
  const IconComponent = section.icon;

  const sectionCompletedFields = section.fields.filter(field =>
    formData[field.key] && String(formData[field.key]).trim() !== ''
  ).length;

  // We create a set of keys for fields that are in tables for easy lookup
  const fieldsInAnyTable = new Set(
    section.tableGroups?.flatMap(tg => tg.fieldsInTable) || []
  );

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
      >
        {/* ... (Button content unchanged) ... */}
        <div className="flex items-center space-x-3">
          <div className={`p-2 bg-gradient-to-r ${section.color} rounded-lg`}>
            <IconComponent className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-800">{section.title}</h3>
            <p className="text-sm text-gray-600">
              {sectionCompletedFields} of {section.fields.length} fields completed
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${section.color} transition-all duration-300`}
              style={{ width: `${(sectionCompletedFields / section.fields.length) * 100}%` }}
            />
          </div>
          {isCollapsed ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {!isCollapsed && (
        <div className="px-6 pb-6 border-t border-gray-100">
          {/* Render TableGroups first */}
          {section.tableGroups?.map(tableConfig => (
            <FieldGroupTable
              key={tableConfig.id}
              tableConfig={tableConfig}
              formData={formData}
              onFieldChange={onFieldChange}
              allFields={allFields}
            />
          ))}

          {/* Then render individual fields that are NOT in a table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {section.fields
              .filter(field => !fieldsInAnyTable.has(field.key)) // Skip fields that are already in tables
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
      )}
    </div>
  );
};

export default SectionItem;