// src/components/common/FormField.tsx
import React from 'react';
import type { FieldConfig, FormData } from '../../types/vehicleSpecs';

interface FormFieldProps {
  field: FieldConfig;
  value: string | number | undefined;
  onChange: (value: string) => void;
}

const FormField: React.FC<FormFieldProps> = ({ field, value, onChange }) => {
  const baseClasses = "w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors duration-200 bg-white";

  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          className={`${baseClasses} min-h-[80px] resize-none`}
          placeholder={`Ingrese ${field.label.toLowerCase()}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'select':
      return (
        <select
          className={baseClasses}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Seleccione...</option>
          {field.options?.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    default: // number, text
      return (
        <input
          type={field.type}
          className={baseClasses}
          placeholder={`Ingrese ${field.label.toLowerCase()}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
};

export default FormField;