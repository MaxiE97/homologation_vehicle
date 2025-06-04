// frontend/src/components/layout/FormHeader.tsx
import React from 'react';
import { Car, Languages } from 'lucide-react';

type ViewMode = 'extracted' | 'sections' | 'unified';

// Definimos la interfaz Language aquí si no la importamos de otro lado
// (Es mejor definirla una vez en localization.ts y exportarla,
// pero para el FormHeader, si solo necesita la estructura, definirla aquí es rápido)
interface Language {
  code: string;
  name: string;
}

interface FormHeaderProps {
  completedFields: number;
  totalFields: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  // Añadimos las props que faltaban:
  supportedLanguages: Language[];
  selectedLanguage: string;
  onLanguageChange: (languageCode: string) => void;
  onTranslateRequest: () => void;
}

const FormHeader: React.FC<FormHeaderProps> = ({
  completedFields,
  totalFields,
  viewMode,
  onViewModeChange,
  supportedLanguages, // Ahora es una prop reconocida
  selectedLanguage,   // Ahora es una prop reconocida
  onLanguageChange,   // Ahora es una prop reconocida
  onTranslateRequest, // Ahora es una prop reconocida
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
            
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <select
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="px-2 py-1 text-xs font-medium rounded bg-white border border-gray-300 focus:outline-none focus:border-blue-500"
                aria-label="Seleccionar idioma"
              >
                {supportedLanguages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <button
                onClick={onTranslateRequest}
                title="Traducir valores finales predefinidos"
                className="p-1.5 text-xs font-medium rounded transition-colors bg-blue-500 text-white hover:bg-blue-600"
              >
                <Languages className="w-4 h-4" />
              </button>
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