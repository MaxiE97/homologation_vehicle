// src/components/layout/FormHeader.tsx
import React, { useState, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {  Languages, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../common/Modal';
import AppLogo from '../../assets/logo.png';


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
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Fragment>
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        {/* --- CAMBIO: Se usa max-w-7xl para coincidir con el contenido de la página --- */}
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Lado Izquierdo: Logo y Título */}
            <div className="p-1 flex-shrink-0">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <img src={AppLogo} alt="App Logo" className="h-9 w-auto" /> 
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Vehicle Technical Specifications</h1>
              </div>
            </div>

            {/* Lado Derecho: Controles y Acciones de Usuario */}
            <div className="flex items-center space-x-6">
              {isAuthenticated && (
                <>
                  {/* Indicador de Progreso */}
                  <div className="text-sm text-gray-600 hidden md:block">
                    <span className="font-semibold text-blue-600">{completedFields}</span> of {totalFields} fields
                  </div>

                  {/* --- CAMBIO: Contenedor para agrupar los controles principales --- */}
                  <div className="flex items-center space-x-4">
                    {/* Controles de Idioma y Traducción */}
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                      <select
                        value={selectedLanguage}
                        onChange={(e) => onLanguageChange(e.target.value)}
                        className="px-2 py-1 text-xs font-medium rounded bg-white border border-gray-300 focus:outline-none focus:border-blue-500"
                        aria-label="Select language"
                      >
                        {supportedLanguages.map(lang => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={onTranslateRequest}
                        title="Translate final predefined values"
                        className="p-1.5 text-xs font-medium rounded transition-colors bg-blue-500 text-white hover:bg-blue-600"
                      >
                        <Languages className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Controles de Vista */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button onClick={() => onViewModeChange('extracted')} className={`px-3 py-1 text-xs font-medium rounded transition-colors ${viewMode === 'extracted' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>Extracted</button>
                      <button onClick={() => onViewModeChange('sections')} className={`px-3 py-1 text-xs font-medium rounded transition-colors ${viewMode === 'sections' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>Sections</button>
                      <button onClick={() => onViewModeChange('unified')} className={`px-3 py-1 text-xs font-medium rounded transition-colors ${viewMode === 'unified' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>Unified</button>
                    </div>
                  </div>
                  
                  {/* --- CAMBIO: Divisor visual y sección de usuario --- */}
                  <div className="flex items-center space-x-4">
                    <div className="h-6 w-px bg-gray-200"></div> {/* Divisor Vertical */}
                    <Link to="/profile" title="View Profile" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                      <UserCircle className="w-5 h-5 text-gray-600" />
                    </Link>
                    <button onClick={() => setIsLogoutModalOpen(true)} title="Logout" className="p-2 rounded-full hover:bg-red-100 transition-colors">
                      <LogOut className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de Confirmación de Logout */}
      <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} title="Confirm Sign Out">
        <div>
            <p className="text-sm text-gray-600">Are you sure you want to sign out of your account?</p>
            <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => setIsLogoutModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors">Cancel</button>
                <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">Sign Out</button>
            </div>
        </div>
      </Modal>
    </Fragment>
  );
};

export default FormHeader;