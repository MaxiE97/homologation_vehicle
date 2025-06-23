// src/components/layout/FormActions.tsx
import React from 'react';

// --- MODIFICADO ---: Se añade la prop isSubmitting
interface FormActionsProps {
  completedPercentage: number;
  onSaveDraft: () => void;
  onSubmit: () => void;
  isSubmitting: boolean; // <-- AÑADIDO
}

// --- MODIFICADO ---: Se recibe la nueva prop
const FormActions: React.FC<FormActionsProps> = ({ 
  completedPercentage, 
  onSubmit, 
  isSubmitting 
}) => {
  return (
    <div className="mt-8 flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4">
      <div className="text-sm text-gray-600">
        Progress: <span className="font-semibold text-blue-600">{completedPercentage}%</span>
      </div>

      <div className="flex space-x-3">
        {/*
        <button
          onClick={onSaveDraft}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors hover:bg-gray-200"
        >
          Save Draft
        </button>
        */}
        <button
          onClick={onSubmit}
          disabled={isSubmitting} // Deshabilita el botón mientras se está enviando
          className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-70 disabled:cursor-wait" // Estilos para el estado deshabilitado
        >
          {/* Cambia el texto del botón según el estado de carga */}
          {isSubmitting ? 'Generating...' : 'Finalize and Submit'}
        </button>
      </div>
    </div>
  );
};

export default FormActions;