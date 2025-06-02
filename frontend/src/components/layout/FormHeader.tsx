// src/components/layout/FormHeader.tsx
import React from 'react';
import { Car } from 'lucide-react';

type ViewMode = 'extracted' | 'sections' | 'unified';

interface FormHeaderProps {
  completedFields: number;
  totalFields: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const FormHeader: React.FC<FormHeaderProps> = ({
  completedFields,
  totalFields,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Especificaciones Técnicas del Vehículo</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-blue-600">{completedFields}</span> de {totalFields} campos
            </div>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('extracted')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'extracted'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Datos Extraídos
              </button>
              <button
                onClick={() => onViewModeChange('sections')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'sections'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Por Secciones
              </button>
              <button
                onClick={() => onViewModeChange('unified')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'unified'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Vista Unificada
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormHeader;