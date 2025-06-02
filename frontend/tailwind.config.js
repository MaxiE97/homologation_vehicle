// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // El archivo HTML principal de Vite en la raíz de /frontend
    "./src/**/*.{js,ts,jsx,tsx}", // Todos tus archivos React/TypeScript dentro de la carpeta src/
  ],
  theme: {
    extend: {
      // Aquí puedes añadir personalizaciones a los temas de Tailwind más adelante si lo necesitas
    },
  },
  plugins: [
    // Aquí puedes añadir plugins de Tailwind más adelante si los necesitas
  ],
}