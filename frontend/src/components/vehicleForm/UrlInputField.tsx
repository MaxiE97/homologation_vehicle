// frontend/src/components/vehicleForm/UrlInputField.tsx
import React from 'react';

interface UrlInputFieldProps {
  label: string;
  name: string;
  value: string; // El valor siempre será string para URLs
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Espera el evento completo
  placeholder?: string;
  disabled?: boolean;
  error?: string; // Para el mensaje de error
}

const UrlInputField: React.FC<UrlInputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
}) => {
  const inputClasses = `
    mt-1 block w-full px-3 py-2 border
    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}
    rounded-md shadow-sm focus:outline-none sm:text-sm
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
  `;

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="url" // Siempre de tipo URL
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClasses}
        disabled={disabled}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default UrlInputField;