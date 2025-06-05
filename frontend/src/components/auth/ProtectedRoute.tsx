// frontend/src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Importamos useAuth

// Quitamos la prop porque no se usa y Outlet no la necesita explícitamente
// interface ProtectedRouteProps {} 

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth(); // Usamos el contexto
  const location = useLocation(); // Para posible redirección post-login

  if (!isAuthenticated) {
    // Si no está autenticado, redirige a la página de login
    // Pasamos la ubicación actual para que se pueda redirigir de vuelta después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />; // Si está autenticado, renderiza el contenido de la ruta hija
};

export default ProtectedRoute;