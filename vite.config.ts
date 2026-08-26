import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const apiBaseUrl =
    env.API_BASE_URL ||
    env.VITE_API_BASE_URL ||
    'https://dsp-backend-q3mn.onrender.com/v1';

  const wsUrl =
    env.WS_URL ||
    env.VITE_WS_URL ||
    'https://dsp-backend-q3mn.onrender.com/tracking';

  const mapboxToken = env.MAPBOX_TOKEN || env.VITE_MAPBOX_TOKEN || '';

  return {
    plugins: [react()],
    define: {
      'process.env.API_BASE_URL': JSON.stringify(apiBaseUrl),
      'process.env.WS_URL': JSON.stringify(wsUrl),
      'process.env.MAPBOX_TOKEN': JSON.stringify(mapboxToken),
    },
    envPrefix: ['VITE_', 'DSP_', 'APP_', 'REACT_APP_'],
    server: {
      port: 5173,
      host: true,
    },
  };
});
