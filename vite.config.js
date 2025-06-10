import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 🔇 SILENCIAR TODOS LOS WARNINGS DE SASS
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
        additionalData: `
          @import "@/assets/scss/variables.scss";
          @import "@/assets/scss/mixins.scss";
        `
      }
    }
  }
})
