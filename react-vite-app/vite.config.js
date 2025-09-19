import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Fix for libraries expecting Node's global in browser (e.g., sockjs-client)
  define: {
    global: 'window',
  },
})
