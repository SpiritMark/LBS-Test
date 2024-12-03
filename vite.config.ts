import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: '.',
    emptyOutDir: true
  },
  optimizeDeps: {
    exclude: ['@electron/remote']
  },
  define: {
    'process.env': {},
    'process.type': '"renderer"',
    'process.version': '"1.0.0"'
  }
}) 