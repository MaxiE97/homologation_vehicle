// frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirige las solicitudes que comienzan con /api al backend de FastAPI
      '/api': {
        target: 'http://127.0.0.1:8000', // La URL donde corre tu backend
        changeOrigin: true, // Necesario para el proxy de hosts virtuales
        secure: false,      // No es necesario si tu backend no usa HTTPS en desarrollo
      }
    }
  }
})