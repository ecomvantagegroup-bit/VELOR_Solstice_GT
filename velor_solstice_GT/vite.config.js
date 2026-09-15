import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/VELOR_Solstice_GT/',

  plugins: [
    vue(),
    vueJsx(),
    tailwindcss(),
  ],

  server: {
    port: 57701,
    watch: {
      ignored: ['**/.vs/**'],
    },
  },
});
