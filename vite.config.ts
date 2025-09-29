import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'photos.swapnilkamat.me',
      'swapnilkamat.me' // Include the root domain just in case
    ],
    host: '0.0.0.0', // Bind to host machine's IP
    port: 5173      // Optional: Explicitly define port
  }
})
