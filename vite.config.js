import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // Untuk GitHub Pages: set base sesuai nama repo
  // Contoh: repo 'my-story-app' -> base: '/my-story-app/'
  // Untuk custom domain atau localhost: base: './'
  base: process.env.NODE_ENV === 'production' 
    ? '/apk-berbagi-story/'  // Sesuai nama repo GitHub
    : './',
  
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'src', 'public'),
  
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src', 'index.html'),
      },
    },
    // Copy .nojekyll to dist
    copyPublicDir: true,
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
