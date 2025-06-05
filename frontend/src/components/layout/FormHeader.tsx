// frontend/src/components/layout/FormHeader.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importamos Link y useNavigate
import { Car, Languages, UserCircle, LogOut } from 'lucide-react'; // Importamos más íconos
import { useAuth } from '../../contexts/AuthContext'; // Importamos useAuth

type ViewMode = 'extracted' | 'sections' | 'unified';
interface Language {
  code: string;
  name: string;
}
interface FormHeaderProps {
  completedFields: number;
  totalFields: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
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
  supportedLanguages,
  selectedLanguage,
  onLanguageChange,
  onTranslateRequest,
}) => {
  const { isAuthenticated, logout } = useAuth(); // Obtenemos estado y función del contexto
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Especificaciones Técnicas del Vehículo</h1>
            </div>
          </div>

          {/* Controles y Acciones del Usuario */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && ( // Solo mostrar si está autenticado (aunque esta página ya es protegida)
              <>
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
                  {/* ... otros botones de vista ... */}
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

                {/* Sección de Usuario: Perfil y Logout */}
                <div className="flex items-center space-x-2">
                  <Link
                    to="/profile"
                    title="Ver Perfil"
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <UserCircle className="w-5 h-5 text-gray-600" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="Cerrar Sesión"
                    className="p-2 rounded-full hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormHeader;