import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

const version = process.env.VITE_APP_VERSION || 'dev';

export default defineConfig({
  base: '/',
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://api.pradelna1.cz/api'),
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [
    react(),
    visualizer({
      open: true,
      filename: './dist/stats.html',
      gzipSize: true,
      brotliSize: true
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router', 'react-router-dom'],
          fontawesome: ['@fortawesome/fontawesome-svg-core', '@fortawesome/free-solid-svg-icons', '@fortawesome/react-fontawesome'],
          vendor: ['prop-types', 'axios', 'scheduler', 'hoist-non-react-statics', 'classnames', 'object-assign']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
  },
});
