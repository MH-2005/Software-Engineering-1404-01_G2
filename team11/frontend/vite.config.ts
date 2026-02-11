import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  base: '/team11/', // Assets will now be linked as /team11/assets/...
  plugins: [react(), tailwindcss(),],
  server: {
    port: 3005,
    host: true,
    // This allows you to visit localhost:3005 and redirected to /team11/
    open: '/team11/',

    // Add this to allow the browser to talk to Vite across different "origins"
    cors: true,
    proxy: {
      // Direct API calls to your Docker Gateway
      '/api': {
        target: 'http://localhost:9151',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})