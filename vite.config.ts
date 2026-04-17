import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': 'http://localhost:3001',
        // Proxy para imagens do Google Drive (contorna CORS/CSP)
        '/gdrive-img': {
          target: 'https://lh3.googleusercontent.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/gdrive-img/, ''),
          secure: true,
        },
        '/gdrive-thumb': {
          target: 'https://drive.google.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/gdrive-thumb/, ''),
          secure: true,
        },
      },
    },
  };
});
