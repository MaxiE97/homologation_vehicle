// frontend/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';
import { ToastContainer } from 'react-toastify'; // Importa ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Importa los estilos CSS de react-toastify

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        {/* Agrega ToastContainer aquí */}
        <ToastContainer
          position="bottom-center" // Puedes cambiar la posición según tu preferencia
          autoClose={5000}    // Las notificaciones se cerrarán automáticamente después de 5 segundos
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light" // Opciones: "light", "dark", "colored"
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);