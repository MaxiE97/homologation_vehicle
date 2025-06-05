// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import VehicleHomologationPage from './pages/VehicleHomologationPage'; //
import LoginPage from './pages/LoginPage';
import UserProfilePage from './pages/UserProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
// import { useAuth } from './contexts/AuthContext'; // We might use it here if necessary

function App() {
  // const { isAuthenticated } = useAuth(); // We could use it for the root path
                                        // or for a global navbar, etc.

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/homologation" element={<VehicleHomologationPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        {/* If "/" should be a protected route that defaults to homologation: */}
        <Route path="/" element={<Navigate replace to="/homologation" />} />
      </Route>
      
      {/* If "/" is public and only redirects based on auth, the previous logic was fine, 
          but with ProtectedRoute, it's cleaner to handle the root INSIDE or OUTSIDE
          the protected block. If it's outside and public, it redirects to /login or /homologation.
          If the root MUST be /homologation (and therefore protected), we place it inside the ProtectedRoute.
          The following line is an alternative if the root is not protected by default:
      */}
      {/* <Route 
        path="/" 
        element={
          // This logic can be simplified if the root path always goes to login or is handled by ProtectedRoute
          localStorage.getItem('isAuthenticated') === 'true'  // Or use useAuth().isAuthenticated
            ? <Navigate replace to="/homologation" /> 
            : <Navigate replace to="/login" />
        } 
      /> */}


      <Route path="*" element={
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Error 404</h1>
          <p className="text-lg text-gray-700 mb-6">Page not found.</p>
          {/* The link could be more dynamic if useAuth were available here */}
          <a 
            href="/" // Simply links to the root, which already has redirect logic
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Back to Home
          </a>
        </div>
      } />
    </Routes>
  );
}

export default App;