// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import VehicleHomologationPage from './pages/VehicleHomologationPage'; //
import LoginPage from './pages/LoginPage';
import UserProfilePage from './pages/UserProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
// import { useAuth } from './contexts/AuthContext'; // Podríamos usarlo aquí si es necesario

function App() {
  // const { isAuthenticated } = useAuth(); // Podríamos usarlo para la ruta raíz
                                        // o para una navbar global, etc.

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/homologation" element={<VehicleHomologationPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        {/* Si "/" debe ser una ruta protegida que va a homologación por defecto: */}
        <Route path="/" element={<Navigate replace to="/homologation" />} />
      </Route>
      
      {/* Si "/" es pública y solo redirige basado en auth, la lógica anterior estaba bien, 
          pero con ProtectedRoute, es más limpio manejar la raíz DENTRO o FUERA 
          del bloque protegido. Si está fuera y es pública, redirige a /login o /homologation.
          Si la raíz DEBE ser /homologation (y por ende protegida), la ponemos dentro del ProtectedRoute.
          La siguiente línea es una alternativa si la raíz NO es protegida por defecto:
      */}
      {/* <Route 
        path="/" 
        element={
          // Esta lógica se puede simplificar si la ruta raíz siempre va a login o es manejada por ProtectedRoute
          localStorage.getItem('isAuthenticated') === 'true'  // O usar useAuth().isAuthenticated
            ? <Navigate replace to="/homologation" /> 
            : <Navigate replace to="/login" />
        } 
      /> */}


      <Route path="*" element={
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Error 404</h1>
          <p className="text-lg text-gray-700 mb-6">Página no encontrada.</p>
          {/* El enlace podría ser más dinámico si useAuth estuviera disponible aquí */}
          <a 
            href="/" // Simplemente enlaza a la raíz, que ya tiene lógica de redirección
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Volver al Inicio
          </a>
        </div>
      } />
    </Routes>
  );
}

export default App;