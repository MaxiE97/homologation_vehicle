// frontend/src/services/api.ts
import axios from 'axios';

// 1. CREACIÓN DE LA INSTANCIA DE AXIOS
const apiClient = axios.create({
  // La URL base de todas las llamadas a la API.
  // Gracias al proxy de Vite, solo necesitamos la ruta relativa.
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. CONFIGURACIÓN DEL INTERCEPTOR DE SOLICITUDES
// Esto es lo más potente de Axios. Esta función se ejecutará ANTES
// de que cada solicitud sea enviada.
apiClient.interceptors.request.use(
  (config) => {
    // Obtenemos el token de localStorage en cada solicitud.
    const token = localStorage.getItem('accessToken');

    // Si el token existe, lo añadimos a la cabecera 'Authorization'.
    // El backend lo usará para verificar que el usuario está autenticado.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Devolvemos la configuración para que la solicitud continúe.
  },
  (error) => {
    // Manejo de errores en la configuración de la solicitud
    return Promise.reject(error);
  }
);

// 3. EXPORTAMOS LA INSTANCIA CONFIGURADA
// Ahora, en lugar de usar 'axios.get', 'axios.post', etc., usaremos
// 'apiClient.get', 'apiClient.post' en toda nuestra aplicación.
export default apiClient;