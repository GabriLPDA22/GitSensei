export { default as Home } from "./Home.vue";
export { default as Dashboard } from "./Dashboard.vue";
export { default as ModuleView } from "./ModuleView.vue";
export { default as Profile } from "./Profile.vue";
export { default as NotFound } from "./NotFound.vue";
export { default as Exercises } from "./Exercises.vue";
export { default as Commands } from "./Commands.vue";

// 2. Añadir este import faltante en Commands.vue (línea 320)
import { watch } from "vue";

// 3. Actualizar vite.config.js para resolver las rutas @
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
