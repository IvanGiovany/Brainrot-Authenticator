// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',    // default, but good to be explicit
  },
  // Base path (default is '/'). Change if hosting in a subdir.
  base: '/',
})
