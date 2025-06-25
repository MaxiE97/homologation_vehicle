// src/pages/UserProfilePage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, LogOut, Download, FileText, ChevronLeft, ChevronRight, Home, Phone, Mail, MessageSquareWarning, CheckCircle2 } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
// NUEVO: Importamos la nueva función para actualizar el estado
import { getUserProfile, updateDownloadStatus } from '../services/api';
// NUEVO: El tipo UserProfile ahora incluye el 'status' y el 'id'
import type { UserProfile, DownloadHistoryItem } from '../types/vehicleSpecs';

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // NUEVO: Estado para saber qué mes está seleccionado
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  // NUEVO: `useMemo` para agrupar las descargas por mes y obtener la lista de meses disponibles
  const { groupedDownloads, months } = useMemo(() => {
    if (!profile?.downloads) return { groupedDownloads: {}, months: [] };

    const groups: Record<string, DownloadHistoryItem[]> = {};
    profile.downloads.forEach(d => {
      const monthKey = d.downloaded_at.substring(0, 7); // Clave "YYYY-MM"
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(d);
    });
    
    // Ordenamos los meses del más reciente al más antiguo
    const sortedMonths = Object.keys(groups).sort().reverse();
    return {
      groupedDownloads: groups,
      months: sortedMonths
    };
  }, [profile]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await getUserProfile();
        setProfile(profileData);
        
        // NUEVO: Establecer el mes actual como seleccionado por defecto
        if (profileData.downloads.length > 0) {
            // Genera la clave del mes actual en formato "YYYY-MM"
            const now = new Date();
            const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            
            // Comprueba si hay descargas para el mes actual
            const sortedMonths = Object.keys(profileData.downloads.reduce((acc, d) => {
                const monthKey = d.downloaded_at.substring(0, 7);
                acc[monthKey] = true;
                return acc;
            }, {} as Record<string, boolean>)).sort().reverse();

            if (sortedMonths.includes(currentMonthKey)) {
                setSelectedMonth(currentMonthKey);
            } else if (sortedMonths.length > 0) {
                // Si no hay en el mes actual, muestra el más reciente
                setSelectedMonth(sortedMonths[0]);
            }
        }

      } catch (err) {
        setError('Failed to load profile data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // NUEVO: Handler para cambiar de mes
  const handleMonthChange = (direction: 'next' | 'prev') => {
    const currentIndex = months.indexOf(selectedMonth);
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedMonth(months[currentIndex - 1]);
    }
    if (direction === 'next' && currentIndex < months.length - 1) {
      setSelectedMonth(months[currentIndex + 1]);
    }
  };
  
  // NUEVO: Handler para cambiar el estado de una descarga
  const handleStatusToggle = async (downloadId: string) => {
    if (!profile) return;
  
    // Encuentra la descarga y su estado actual
    const currentDownload = profile.downloads.find(d => d.id === downloadId);
    if (!currentDownload) return;
  
    const newStatus = currentDownload.status === 'Ok' ? 'Under review' : 'Ok';
  
    // Actualización optimista: cambia el estado en la UI inmediatamente
    setProfile(prevProfile => {
      if (!prevProfile) return null;
      return {
        ...prevProfile,
        downloads: prevProfile.downloads.map(d =>
          d.id === downloadId ? { ...d, status: newStatus } : d
        ),
      };
    });
  
    // Llama a la API para persistir el cambio
    try {
      await updateDownloadStatus(downloadId, newStatus);
    } catch (error) {
      // Si la API falla, revierte el cambio en la UI y muestra un error
      console.error("Failed to update status, reverting change.", error);
      alert("No se pudo actualizar el estado. Por favor, intente de nuevo.");
      setProfile(prevProfile => {
        if (!prevProfile) return null;
        return {
          ...prevProfile,
          downloads: prevProfile.downloads.map(d =>
            d.id === downloadId ? { ...d, status: currentDownload.status } : d
          ),
        };
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  
  const downloadsForSelectedMonth = groupedDownloads[selectedMonth] || [];

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-100">Cargando perfil...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-8">
          <div className="flex items-center mb-4 sm:mb-0">
            <UserCircle className="w-16 h-16 text-indigo-500 mr-4" strokeWidth={1.5}/>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{profile?.username || 'Técnico'}</h1>
              <p className="text-gray-600">{profile?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => navigate('/homologation')} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm">
              <Home className="w-4 h-4 mr-2" /> Ir al Formulario
            </button>
            <button onClick={handleLogout} className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-sm">
              <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Contacto de Soporte</h2>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center"><Mail className="w-5 h-5 mr-3 text-gray-400"/><div><p className="font-semibold text-gray-800">Email</p><a href="mailto:support@tech-homologation.com" className="text-blue-500 hover:underline">support@tech-homologation.com</a></div></div>
                  <div className="flex items-center"><Phone className="w-5 h-5 mr-3 text-gray-400"/><div><p className="font-semibold text-gray-800">Teléfono</p><p className="text-gray-600">+34 910 123 456</p></div></div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                  <div className="flex items-center"><Download className="w-6 h-6 mr-3 text-indigo-500"/><h2 className="text-xl font-semibold text-gray-700">Historial de Descargas</h2></div>
                  {months.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleMonthChange('next')} disabled={months.indexOf(selectedMonth) === 0} className="p-2 rounded-full disabled:opacity-50 hover:bg-gray-100"><ChevronLeft/></button>
                      <span className="font-semibold text-gray-700 w-40 text-center capitalize">
                        {new Date(selectedMonth + '-02').toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                      </span>
                      <button onClick={() => handleMonthChange('prev')} disabled={months.indexOf(selectedMonth) === months.length - 1} className="p-2 rounded-full disabled:opacity-50 hover:bg-gray-100"><ChevronRight/></button>
                    </div>
                  )}
                </div>
                
                <div className="overflow-x-auto">
                  {downloadsForSelectedMonth.length > 0 ? (
                    <table className="w-full text-left">
                      <thead className="border-b-2 border-gray-200"><tr>
                        <th className="p-3 text-sm font-semibold text-gray-600">CdS</th>
                        <th className="p-3 text-sm font-semibold text-gray-600">Fecha de Descarga</th>
                        <th className="p-3 text-sm font-semibold text-gray-600 text-center">Estado</th>
                      </tr></thead>
                      <tbody>
                        {downloadsForSelectedMonth.map(download => (
                          <tr key={download.id} className="border-b border-gray-100 hover:bg-gray-50/70">
                            <td className="p-3 text-sm text-gray-800 font-mono align-middle">{download.cds_identifier}</td>
                            <td className="p-3 text-sm text-gray-600 align-middle">
                              {new Date(download.downloaded_at).toLocaleString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })} hs.
                            </td>
                            <td className="p-3 text-center align-middle">
                              <button onClick={() => handleStatusToggle(download.id)}
                                className={`flex items-center justify-center w-32 mx-auto text-xs font-bold py-1 px-2 rounded-full transition-all duration-200 ${download.status === 'Ok' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}>
                                {download.status === 'Ok' ? <CheckCircle2 className="w-4 h-4 mr-1.5"/> : <MessageSquareWarning className="w-4 h-4 mr-1.5"/>}
                                {download.status}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2"/>
                      <p>{months.length > 0 ? 'No hay descargas para el mes seleccionado.' : 'No has realizado ninguna descarga todavía.'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;