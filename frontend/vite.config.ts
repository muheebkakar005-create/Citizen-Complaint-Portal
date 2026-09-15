import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Where the Express/MongoDB backend (../backend) is running. Override with
  // VITE_BACKEND_URL in a .env file if you run the backend on a different
  // host/port.
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:5000';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 5173,
      // Every request the frontend makes to /api/* (see src/services/api.ts)
      // is transparently forwarded to the backend during `npm run dev`, so
      // the browser only ever talks to a single origin (no CORS needed in
      // dev). In production, either serve the built dist/ from the backend
      // (see backend/app.js) or configure an equivalent rewrite on whatever
      // static host / reverse proxy you deploy the frontend to.
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
