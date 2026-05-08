import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/vehicles': 'http://localhost:3000',
      '/challenges': 'http://localhost:3000',
      '/notifications': 'http://localhost:3000',
    },
  },
});
