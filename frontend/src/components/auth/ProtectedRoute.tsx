import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth(); // 1. Obtenemos isLoading
  const location = useLocation();

  // 2. Si estamos en proceso de verificar la autenticación, mostramos un loader.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* Aquí puedes poner un spinner o cualquier componente de carga más elaborado */}
        <p className="text-xl">Loading...</p> 
      </div>
    );
  }

  // 3. Si ya no estamos cargando y el usuario NO está autenticado, redirigimos.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. Si ya no estamos cargando y el usuario SÍ está autenticado, mostramos la página.
  return <Outlet />;
};

export default ProtectedRoute;