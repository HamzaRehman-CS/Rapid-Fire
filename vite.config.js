import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

let localPlugin = null;
try {
  const { attemptStorePlugin } = await import('../shared/attemptStore.js');
  localPlugin = attemptStorePlugin('rapid-fire', fileURLToPath(new URL('.', import.meta.url)));
} catch {
  // Gracefully bypassed on Vercel / standalone deployments
}

export default defineConfig({
  plugins: [
    react(),
    ...(localPlugin ? [localPlugin] : [])
  ],
});
