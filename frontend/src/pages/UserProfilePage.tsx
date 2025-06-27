// src/pages/UserProfilePage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, LogOut, Download, FileText, ChevronLeft, ChevronRight, Home, Phone, Mail, MessageSquareWarning, CheckCircle2, Calendar, User, Clock } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, updateDownloadStatus } from '../services/api';
import type { UserProfile, DownloadHistoryItem } from '../types/vehicleSpecs';

// --- INICIO: NUEVO COMPONENTE SKELETON LOADER ---
const UserProfileSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-100">
    {/* Skeleton Header */}
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-gray-300 rounded-full w-14 h-14 mr-4"></div>
            <div>
              <div className="h-6 bg-gray-300 rounded w-40 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-56"></div>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="h-10 bg-gray-300 rounded-lg w-32"></div>
            <div className="h-10 bg-gray-300 rounded-lg w-28"></div>
          </div>
        </div>
      </div>
    </div>
    {/* Skeleton Content */}
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-300 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
// --- FIN: NUEVO COMPONENTE SKELETON LOADER ---


const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { groupedDownloads, months } = useMemo(() => {
    if (!profile?.downloads) return { groupedDownloads: {}, months: [] };

    const groups: Record<string, DownloadHistoryItem[]> = {};
    profile.downloads.forEach(d => {
      const monthKey = d.downloaded_at.substring(0, 7);
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(d);
    });
    
    const sortedMonths = Object.keys(groups).sort().reverse();
    return {
      groupedDownloads: groups,
      months: sortedMonths
    };
  }, [profile]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Para simular y poder ver el skeleton loader:
        // await new Promise(resolve => setTimeout(resolve, 1500)); 
        const profileData = await getUserProfile();
        setProfile(profileData);
        
        if (profileData.downloads.length > 0) {
          const now = new Date();
          const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          
          const availableMonths = Object.keys(profileData.downloads.reduce((acc, d) => {
            acc[d.downloaded_at.substring(0, 7)] = true;
            return acc;
          }, {} as Record<string, boolean>)).sort().reverse();

          if (availableMonths.includes(currentMonthKey)) {
            setSelectedMonth(currentMonthKey);
          } else if (availableMonths.length > 0) {
            setSelectedMonth(availableMonths[0]);
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

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const currentIndex = months.indexOf(selectedMonth);
    setCurrentPage(1);
    if (direction === 'next' && currentIndex > 0) {
        setSelectedMonth(months[currentIndex - 1]);
    }
    if (direction === 'prev' && currentIndex < months.length - 1) {
        setSelectedMonth(months[currentIndex + 1]);
    }
  };
  
  const handleStatusToggle = async (downloadId: string) => {
    if (!profile) return;
    const currentDownload = profile.downloads.find(d => d.id === downloadId);
    if (!currentDownload) return;
    const newStatus = currentDownload.status === 'Ok' ? 'Under review' : 'Ok';
  
    setProfile(prevProfile => {
      if (!prevProfile) return null;
      return {
        ...prevProfile,
        downloads: prevProfile.downloads.map(d =>
          d.id === downloadId ? { ...d, status: newStatus } : d
        ),
      };
    });
  
    try {
      await updateDownloadStatus(downloadId, newStatus);
    } catch (error) {
      console.error("Failed to update status, reverting change.", error);
      alert("Failed to update status. Please try again.");
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

  // CAMBIO: Añadida la confirmación de cierre de sesión
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      logout();
      navigate('/login', { replace: true });
    }
  };
  
  const downloadsForSelectedMonth = groupedDownloads[selectedMonth] || [];
  const totalPages = Math.ceil(downloadsForSelectedMonth.length / itemsPerPage);
  const paginatedDownloads = downloadsForSelectedMonth.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
    }
  };

  // CAMBIO: Renderiza el Skeleton Loader si está cargando
  if (isLoading) return <UserProfileSkeleton />;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-full mr-4">
                <UserCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile?.username || 'Technician'}</h1>
                <p className="text-gray-600">{profile?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => navigate('/homologation')} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md">
                <Home className="w-4 h-4 mr-2" />
                Go to Form
              </button>
              <button onClick={handleLogout} className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">

          {/* Download History Panel */}
          <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center">
                <Download className="w-6 h-6 mr-3 text-indigo-500" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Download History</h2>
                  <div className="mt-2">
                    <span className="inline-block bg-indigo-100 text-indigo-800 text-sm font-semibold mr-2 px-2.5 py-1 rounded-full">
                      {downloadsForSelectedMonth.length} downloads
                    </span>
                    <span className="text-gray-600 text-sm">
                      in {selectedMonth && new Date(selectedMonth + '-02').toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
              
              {months.length > 1 && (
                <div className="flex items-center bg-gray-50 rounded-lg p-1">
                  {/* CAMBIO: Añadidos aria-label para accesibilidad */}
                  <button onClick={() => handleMonthChange('next')} disabled={months.indexOf(selectedMonth) === 0} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors" aria-label="Navigate to previous month">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center px-4 py-2 min-w-[180px] justify-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium text-gray-700 capitalize">
                      {selectedMonth && new Date(selectedMonth + '-02').toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <button onClick={() => handleMonthChange('prev')} disabled={months.indexOf(selectedMonth) === months.length - 1} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors" aria-label="Navigate to next month">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {paginatedDownloads.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="p-4 text-sm font-semibold text-gray-600">CdS</th>
                        <th className="p-4 text-sm font-semibold text-gray-600">Download Date</th>
                        <th className="p-4 text-sm font-semibold text-gray-600 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDownloads.map((download, index) => (
                        <tr key={download.id} className={`border-b border-gray-100 hover:bg-gray-50/70 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                          <td className="p-4 font-mono text-sm font-medium text-gray-900">{download.cds_identifier}</td>
                          <td className="p-4 text-sm text-gray-700">
                            {new Date(download.downloaded_at).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-4 text-center">
                            <button onClick={() => handleStatusToggle(download.id)} className={`inline-flex items-center justify-center w-32 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${download.status === 'Ok' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}>
                              {download.status === 'Ok' ? <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> : <MessageSquareWarning className="w-3.5 h-3.5 mr-1.5" />}
                              {download.status}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, downloadsForSelectedMonth.length)} of {downloadsForSelectedMonth.length} results
                    </div>
                    <div className="flex items-center space-x-1">
                      <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button key={page} onClick={() => handlePageChange(page)} className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === page ? 'bg-indigo-600 text-white' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}`}>
                          {page}
                        </button>
                      ))}
                      <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Downloads</h3>
                <p className="text-gray-600">{months.length > 0 ? 'No downloads found for the selected month.' : 'You haven\'t made any downloads yet.'}</p>
              </div>
            )}
          </div>

          {/* Technical Support Panel */}
          <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-indigo-500" />
              Technical Support
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 mt-0.5 mr-3 text-indigo-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <a href="mailto:support@tech-homologation.com" className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors break-all">support@tech-homologation.com</a>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start">
                  <Phone className="w-5 h-5 mt-0.5 mr-3 text-indigo-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">+34 910 123 456</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start">
                  <Clock className="w-5 h-5 mt-0.5 mr-3 text-indigo-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Hours</p>
                    <p className="text-sm text-gray-600">Mon - Fri: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;