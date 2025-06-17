// src/pages/UserProfilePage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, LogOut, Download, FileText, ChevronRight, Home } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/api'; // <-- 1. Importamos nuestra función de API
import type { UserProfile } from '../types/vehicleSpecs'; // <-- Importamos el tipo de perfil

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // --- 2. Estados para manejar la carga de datos, el perfil y los errores ---
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 3. useEffect para cargar los datos del perfil cuando la página se monta ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await getUserProfile();
        setProfile(profileData);
      } catch (err) {
        setError('Failed to load profile data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []); // El array vacío asegura que se ejecute solo una vez

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // --- Lógica de renderizado condicional ---
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Cargando perfil...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-600">{error}</div>;
  }

  // --- El JSX principal que se muestra cuando los datos están listos ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        
        {/* --- Sección 1: Cabecera de Usuario y Contacto --- */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mr-4">
              <UserCircle className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Bienvenido, <span className="text-indigo-600">{profile?.username || 'Técnico'}</span>
              </h1>
              <p className="text-sm text-gray-600">Soporte: <a href="mailto:soporte@tuempresa.com" className="text-blue-500 hover:underline">soporte@tuempresa.com</a></p>
            </div>
          </div>
          <div className="flex items-center mt-4 sm:mt-0 space-x-2">
              <button
                onClick={() => navigate('/homologation')}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Ir al Formulario
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </button>
          </div>
        </div>

        {/* --- Sección 2: Borrador Guardado (Draft) --- */}
        <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Borrador Guardado</h2>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                <div>
                    <p className="font-medium text-gray-800">Homologación en progreso</p>
                    <p className="text-sm text-gray-500">Tienes un borrador guardado. Puedes continuar donde lo dejaste.</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors">
                    Cargar Borrador <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
        </div>
        
        {/* --- Sección 3: Historial de Descargas --- */}
        <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <Download className="w-6 h-6 mr-3 text-indigo-500"/>
            <h2 className="text-xl font-semibold text-gray-700">
              Historial de Descargas ({profile?.downloads.length || 0})
            </h2>
          </div>
          <div className="overflow-x-auto">
            {profile && profile.downloads.length > 0 ? (
              <table className="w-full text-left">
                <thead className="border-b-2 border-gray-200">
                  <tr>
                    <th className="p-3 text-sm font-semibold text-gray-600">Identificador del Vehículo (CdS)</th>
                    <th className="p-3 text-sm font-semibold text-gray-600">Fecha de Descarga</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.downloads.map((download, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-sm text-gray-800 font-mono">{download.cds_identifier}</td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(download.downloaded_at).toLocaleDateString('es-AR', {
                          year: 'numeric', month: 'long', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2"/>
                <p>No has realizado ninguna descarga todavía.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfilePage;