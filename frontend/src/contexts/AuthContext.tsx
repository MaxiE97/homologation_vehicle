// frontend/src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, type ReactNode, useCallback } from 'react';
import { isAxiosError } from 'axios';
import api from '../services/api';

// User interface, based on the backend schema
interface User {
  id: string;
  email?: string;
  user_metadata?: {
    username?: string;
    role?: string; // <-- AÑADIDO: El rol del usuario (ej: 'trial', 'full')
    [key: string]: any;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (usernameInput: string, passwordInput: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserProfile = useCallback(async () => {
    try {
      // Esta petición ahora debería incluir el 'role' dentro de 'user_metadata' desde el backend
      const { data } = await api.get<User>('/auth/users/me');
      setUser(data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Could not fetch user profile, token might be invalid.");
      localStorage.removeItem('accessToken');
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchUserProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchUserProfile]);

  const login = async (usernameInput: string, passwordInput: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post('/auth/login', {
        username: usernameInput,
        password: passwordInput,
      });

      const { access_token } = response.data;
      if (access_token) {
        localStorage.setItem('accessToken', access_token);
        // fetchUserProfile obtendrá los datos del usuario, incluyendo el nuevo campo 'role'
        await fetchUserProfile();
        return { success: true, message: 'Login successful.' };
      }
      return { success: false, message: 'Access token not received.' };
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail || 'Incorrect credentials or server error.';
        console.error("Login error:", errorMessage);
        return { success: false, message: errorMessage };
      } else {
        const errorMessage = 'An unexpected error occurred.';
        console.error("Unexpected login error:", error);
        return { success: false, message: errorMessage };
      }
    }
  };


  const logout = () => {
    // Limpia todo lo relacionado con la sesión y el formulario
    localStorage.removeItem('accessToken');
    localStorage.removeItem('homologationFormData');
    localStorage.removeItem('homologationOriginalFormData');
    localStorage.removeItem('homologationExtractedData');
    localStorage.removeItem('homologationUrl1');
    localStorage.removeItem('homologationUrl2');
    localStorage.removeItem('homologationUrl3');
    localStorage.removeItem('homologationTransmissionOption');

    setIsAuthenticated(false);
    setUser(null);
    console.log('AuthContext: Logout and all related data cleared.');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
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