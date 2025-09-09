import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 12000,
    cors: true,
    allowedHosts: ['work-1-diahyxngmdwxcaxe.prod-runtime.all-hands.dev'],
    headers: {
      'X-Frame-Options': 'ALLOWALL'
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 12000,
    cors: true
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})