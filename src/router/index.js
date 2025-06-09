import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// Importar vistas
import Home from "@/views/Home.vue";
import Dashboard from "@/views/Dashboard.vue";
import ModuleView from "@/views/ModuleView.vue";
import Profile from "@/views/Profile.vue";
import AuthCallback from "@/views/AuthCallback.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      title: "Git Learning Platform - Aprende Git y GitHub",
      description: "La plataforma más interactiva para dominar Git y GitHub",
    },
  },
  {
    path: "/auth/callback",
    name: "AuthCallback",
    component: AuthCallback,
    meta: {
      title: "Autenticando...",
      description: "Completando autenticación con GitHub",
    },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: {
      title: "Dashboard - Git Learning Platform",
      description: "Tu progreso de aprendizaje en Git y GitHub",
      requiresAuth: true,
    },
  },
  {
    path: "/module/:moduleId",
    name: "Module",
    component: ModuleView,
    meta: {
      title: "Módulo - Git Learning Platform",
      description: "Aprende Git paso a paso",
      requiresAuth: true,
    },
    // Validar que el moduleId existe
    beforeEnter: (to, from, next) => {
      const validModules = [
        "module-0",
        "module-1",
        "module-2",
        "module-3",
        "module-4",
        "module-5",
      ];
      if (validModules.includes(to.params.moduleId)) {
        next();
      } else {
        next("/dashboard");
      }
    },
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: {
      title: "Perfil - Git Learning Platform",
      description: "Tu perfil y estadísticas de aprendizaje",
      requiresAuth: true,
    },
  },
  // Rutas adicionales
  {
    path: "/exercises",
    name: "Exercises",
    component: () => import("@/views/Exercises.vue"), // Lazy loading
    meta: {
      title: "Ejercicios - Git Learning Platform",
      description: "Practica con ejercicios interactivos",
      requiresAuth: true,
    },
  },
  {
    path: "/commands",
    name: "Commands",
    component: () => import("@/views/Commands.vue"), // Lazy loading
    meta: {
      title: "Comandos - Git Learning Platform",
      description: "Referencia rápida de comandos Git",
    },
  },
  // Redirecciones
  {
    path: "/learn",
    redirect: "/dashboard",
  },
  {
    path: "/modules",
    redirect: "/dashboard",
  },
  // 404 - Página no encontrada
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
    meta: {
      title: "Página no encontrada - Git Learning Platform",
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Scroll behavior - volver arriba en cada cambio de ruta
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Guards globales
router.beforeEach(async (to, from, next) => {
  // Actualizar el título de la página
  if (to.meta.title) {
    document.title = to.meta.title;
  }

  // Actualizar meta description
  if (to.meta.description) {
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", to.meta.description);
    }
  }

  // Verificar autenticación
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore();

    // Restaurar usuario si existe en localStorage
    if (!authStore.isAuthenticated) {
      authStore.restoreUser();
    }

    // Si sigue sin estar autenticado, redirect a home
    if (!authStore.isAuthenticated) {
      next({
        path: "/",
        query: { redirect: to.fullPath }, // Guardar donde quería ir
      });
      return;
    }

    // Verificar que la sesión sigue válida
    const isValidSession = await authStore.validateSession();
    if (!isValidSession) {
      next({
        path: "/",
        query: { redirect: to.fullPath },
      });
      return;
    }
  }

  next();
});

// Loading state global
router.beforeResolve((to, from, next) => {
  // Aquí podrías mostrar un loading spinner global
  next();
});

export default router;
