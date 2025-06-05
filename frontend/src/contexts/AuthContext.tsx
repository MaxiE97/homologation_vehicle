// frontend/src/contexts/AuthContext.tsx
// We import ReactNode as an explicit type
import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

// Simulated values for login
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
  // useNavigate is not used directly in AuthProvider in the previous version,
  // but I'll keep it in case you need it for some centralized redirection logic here in the future.
  // If not, it could be removed from this specific file.
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
          console.log('AuthContext: Login successful');
          resolve(true);
        } else {
          console.log('AuthContext: Login failed');
          resolve(false);
        }
      }, 500);
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    console.log('AuthContext: Logout performed');
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};