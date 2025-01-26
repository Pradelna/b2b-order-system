import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Shorten imports (optional)
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'], // Ensure TypeScript files are resolved
  },
})
