// frontend/src/pages/UserProfilePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Importamos useAuth

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Usamos el contexto para logout
  // Podríamos obtener 'user' del contexto si lo añadiéramos: const { logout, user } = useAuth();
  const MOCK_USER_DISPLAY_NAME = "Técnico Principal"; 

  const handleLogout = () => {
    logout(); // Llamamos al logout del contexto
    navigate('/login', { replace: true });
    // El console.log ya está en la función logout del contexto
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-lg bg-white/90 backdrop-blur-md shadow-xl rounded-xl p-8 border border-gray-200 text-center">
        <div className="flex flex-col items-center mb-6">
          <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-4">
            <UserCircle className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Perfil de Usuario</h1>
          <p className="text-lg text-gray-700">
            Bienvenido, <span className="font-semibold">{MOCK_USER_DISPLAY_NAME}</span>.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-md font-semibold text-gray-700">Estadísticas (Simuladas)</h3>
            <p className="text-sm text-gray-600 mt-1">Fichas Descargadas: 12</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Cerrar Sesión
          </button>
        </div>
      </div>
       <button 
        onClick={() => navigate('/homologation')} 
        className="mt-8 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Ir a Homologación
      </button>
    </div>
  );
};

export default UserProfilePage;