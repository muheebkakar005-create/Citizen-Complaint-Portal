import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// Automatically creates dist/404.html from dist/index.html on build for zero-config SPA routing on Vercel
function spaFallbackPlugin() {
  return {
    name: 'spa-fallback-plugin',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const indexPath = path.join(distDir, 'index.html');
      const fallbackPath = path.join(distDir, '404.html');
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, fallbackPath);
        console.log('[spaFallbackPlugin] Created dist/404.html for SPA routing');
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Where the Express/MongoDB backend (../backend) is running. Override with
  // VITE_BACKEND_URL in a .env file if you run the backend on a different
  // host/port.
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:5000';

  return {
    plugins: [react(), tailwindcss(), spaFallbackPlugin()],
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
