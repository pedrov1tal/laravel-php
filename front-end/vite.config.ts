import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    globals: true,
  },
  server: {
    watch: {
      usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
      interval: Number(process.env.CHOKIDAR_INTERVAL ?? 100),
    },
    proxy: {
      '/api': process.env.VITE_API_PROXY_TARGET ?? 'http://127.0.0.1:8000',
    },
  },
})
