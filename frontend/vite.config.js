import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configura Vite para transformar los componentes de React.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8090',
    },
  },
});
