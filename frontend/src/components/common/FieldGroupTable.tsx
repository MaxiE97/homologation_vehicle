// frontend/src/components/common/FieldGroupTable.tsx
import React from 'react';
import type {
  TableGroupConfig,
  FormData,
  FieldConfig,
} from '../../types/vehicleSpecs'; //
import FormField from './FormField'; //

interface FieldGroupTableProps {
  tableConfig: TableGroupConfig;
  formData: FormData;
  onFieldChange: (fieldKey: string, value: string) => void;
  // We need access to the configurations of all fields
  // to be able to pass the correct FieldConfig to each FormField.
  allFields: FieldConfig[];
}

const FieldGroupTable: React.FC<FieldGroupTableProps> = ({
  tableConfig,
  formData,
  onFieldChange,
  allFields,
}) => {
  // Helper to find the complete FieldConfig from its key
  const getFieldConfig = (key: string): FieldConfig | undefined => {
    return allFields.find(f => f.key === key);
  };

  return (
    <div className="my-6">
      {tableConfig.title && (
        <h4 className="text-md font-semibold text-gray-700 mb-3">
          {tableConfig.title}
        </h4>
      )}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {tableConfig.columnHeaders.map((header) => (
                <th
                  key={header.key}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tableConfig.rowData.map((row, rowIndex) => (
              <tr key={`${tableConfig.id}-row-${rowIndex}`} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                {/* First cell for the row label */}
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                  {row.rowLabel}
                </td>
                {/* Remaining cells for the FormFields */}
                {tableConfig.columnHeaders.slice(1).map((header) => {
                  const fieldKey = row.fieldKeys[header.key];
                  if (!fieldKey) {
                    // If there is no fieldKey for this header in this row, render an empty cell or a placeholder
                    return (
                      <td key={`${tableConfig.id}-row-${rowIndex}-col-${header.key}`} className="px-4 py-3">
                        <span className="text-sm text-gray-400">-</span>
                      </td>
                    );
                  }

                  const fieldSpecificConfig = getFieldConfig(fieldKey);

                  if (!fieldSpecificConfig) {
                    console.warn(`FieldGroupTable: FieldConfig not found for key: ${fieldKey}`);
                    return (
                      <td key={`${tableConfig.id}-row-${rowIndex}-col-${header.key}`} className="px-4 py-3">
                        <span className="text-sm text-red-500">Error: Configuration not found</span>
                      </td>
                    );
                  }

                  return (
                    <td key={`${tableConfig.id}-row-${rowIndex}-col-${header.key}`} className="px-4 py-3 align-top">
                      <FormField
                        field={fieldSpecificConfig}
                        value={formData[fieldKey]}
                        onChange={(value) => onFieldChange(fieldKey, value)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FieldGroupTable;