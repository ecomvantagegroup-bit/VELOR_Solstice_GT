import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/VELOR_Solstice_GT/',

  plugins: [
    vue(),
    vueJsx(),
    tailwindcss(),
  ],

  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        debug: resolve(import.meta.dirname, 'debug.html'),
      },
    },
  },

  server: {
    port: 57701,
    watch: {
      ignored: ['**/.vs/**'],
    },
  },
});
