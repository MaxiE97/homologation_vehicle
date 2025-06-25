// frontend/src/services/api.ts
import axios from 'axios';
import type { UserProfile } from '../types/vehicleSpecs';

// 1. CREACIÓN DE LA INSTANCIA DE AXIOS
const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. CONFIGURACIÓN DEL INTERCEPTOR DE SOLICITUDES
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- AÑADIR ESTA NUEVA FUNCIÓN AQUÍ ---
/**
 * Fetches the current user's profile information from the backend.
 * @returns {Promise<UserProfile>} A promise that resolves to the user's profile data.
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    // Usamos apiClient y la ruta relativa al baseURL ('/api/v1')
    const response = await apiClient.get<UserProfile>('/profile/'); 
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};
// -----------------------------------------

// --- INICIO DE LA NUEVA FUNCIÓN ---
/**
 * Updates the status of a specific download record.
 * @param {string} downloadId - The UUID of the download to update.
 * @param {'Ok' | 'En revisión'} status - The new status to set.
 * @returns {Promise<void>} A promise that resolves when the update is successful.
 */
export const updateDownloadStatus = async (
  downloadId: string, 
  status: 'Ok' | 'Under review'
): Promise<void> => {
  try {
    // Usamos el endpoint PATCH que creamos en el backend
    await apiClient.patch(`/downloads/${downloadId}/status`, { status });
  } catch (error) {
    console.error(`Error updating status for download ${downloadId}:`, error);
    // Opcional: podrías mostrar una notificación al usuario aquí
    throw error;
  }
};
// --- FIN DE LA NUEVA FUNCIÓN ---


// 3. EXPORTAMOS LA INSTANCIA CONFIGURADA
export default apiClient;