import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // `npm run pages:dev` serves the API on 8788; plain `vite` proxies to it.
  server: { proxy: { '/api': 'http://localhost:8788' } },
});
