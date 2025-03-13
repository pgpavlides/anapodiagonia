import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Suppress specific React warnings
    __REACT_SUPPRESS_WARNINGS__: true,
  },
})
