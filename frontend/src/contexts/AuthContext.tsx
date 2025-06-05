// frontend/src/contexts/AuthContext.tsx
// Hacemos la importación de ReactNode como tipo explícito
import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

// Valores simulados para el login
const MOCK_USERNAME = "tecnico";
const MOCK_PASSWORD = "password123";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (usernameInput: string, passwordInput: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  // useNavigate no se usa directamente en AuthProvider en la versión anterior,
  // pero lo mantendré por si lo necesitas para alguna lógica de redirección centralizada aquí en el futuro.
  // Si no, se podría quitar de este archivo específico.
  // const navigate = useNavigate(); 

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('isAuthenticated', 'true');
    } else {
      localStorage.removeItem('isAuthenticated');
    }
  }, [isAuthenticated]);

  const login = async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (usernameInput === MOCK_USERNAME && passwordInput === MOCK_PASSWORD) {
          setIsAuthenticated(true);
          console.log('AuthContext: Login exitoso');
          resolve(true);
        } else {
          console.log('AuthContext: Falló el login');
          resolve(false);
        }
      }, 500);
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    console.log('AuthContext: Logout realizado');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};