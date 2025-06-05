// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Importamos useAuth

// Las credenciales MOCK ahora están centralizadas en AuthContext,
// pero para la UI podríamos mantener la pista de qué usar.
const MOCK_USERNAME_HINT = "tecnico";
const MOCK_PASSWORD_HINT = "password123";


const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Para feedback visual
  
  const navigate = useNavigate();
  const { login } = useAuth(); // Usamos el contexto

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const success = await login(username, password); // Llamamos al login del contexto

    setIsLoading(false);
    if (success) {
      navigate('/homologation', { replace: true });
    } else {
      setError('Usuario o contraseña incorrectos. Intente con tecnico / password123');
    }
  };

  const inputClasses = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors duration-200 bg-white shadow-sm text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md shadow-xl rounded-xl p-8 border border-gray-200">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Iniciar Sesión</h1>
          <p className="text-sm text-gray-600">Acceda a la plataforma de homologación.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className={labelClasses}>
              Nombre de Usuario
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClasses}
              placeholder={`ej: ${MOCK_USERNAME_HINT}`}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClasses}>
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClasses}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-100 p-2 rounded-md border border-red-300">
              {error}
            </p>
          )}

          <div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 disabled:opacity-70 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Ingresar'}
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-xs text-gray-500">
          Versión simulada. Use {MOCK_USERNAME_HINT} / {MOCK_PASSWORD_HINT} para ingresar.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;