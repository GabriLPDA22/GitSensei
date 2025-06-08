import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Importar automáticamente las variables y mixins en todos los componentes
        additionalData: `
          @import "@/assets/scss/variables.scss";
          @import "@/assets/scss/mixins.scss";
        `
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
