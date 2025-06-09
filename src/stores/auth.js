import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    progress: {
      currentModule: 0,
      completedModules: [],
      totalScore: 0,
      badges: [],
    },
    preferences: {
      theme: "dark",
      language: "es",
    },
  }),

  getters: {
    completionPercentage: (state) => {
      const totalModules = 6; // Módulos 0-5
      return Math.round(
        (state.progress.completedModules.length / totalModules) * 100
      );
    },
  },

  actions: {
    updateProgress(moduleId, score) {
      if (!this.progress.completedModules.includes(moduleId)) {
        this.progress.completedModules.push(moduleId);
        this.progress.totalScore += score;
      }
    },

    earnBadge(badgeId) {
      if (!this.progress.badges.includes(badgeId)) {
        this.progress.badges.push(badgeId);
      }
    },
  },
});
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAuthStore = defineStore("auth", () => {
  // Estado
  const user = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // Getters
  const isAuthenticated = computed(() => !!user.value);
  const userAvatar = computed(() => user.value?.avatar_url || null);
  const userName = computed(
    () => user.value?.name || user.value?.login || "Usuario"
  );
  const userProfile = computed(() => user.value?.html_url || null);

  // Actions
  const setUser = (userData) => {
    user.value = userData;
    if (userData) {
      localStorage.setItem("auth_user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("auth_user");
    }
  };

  const setLoading = (loading) => {
    isLoading.value = loading;
  };

  const setError = (errorMessage) => {
    error.value = errorMessage;
  };

  const clearError = () => {
    error.value = null;
  };

  // GitHub OAuth Login
  const loginWithGitHub = () => {
    clearError();
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_REDIRECT_URI;
    const scope = "read:user user:email";

    if (!clientId) {
      setError("GitHub Client ID no configurado");
      return;
    }

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

    // Redirect a GitHub
    window.location.href = authUrl;
  };

  // Procesar callback de GitHub
  const handleGitHubCallback = async (code) => {
    if (!code) {
      setError("Código de autorización no recibido");
      return false;
    }

    try {
      setLoading(true);
      clearError();

      // En un proyecto real, esto debería ir a tu backend
      // Por ahora usaremos un proxy o service worker
      const tokenResponse = await fetch("/api/auth/github", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!tokenResponse.ok) {
        throw new Error("Error obteniendo token de acceso");
      }

      const { access_token } = await tokenResponse.json();

      // Obtener datos del usuario
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/vnd.github+json",
        },
      });

      if (!userResponse.ok) {
        throw new Error("Error obteniendo datos del usuario");
      }

      const userData = await userResponse.json();

      // Guardar token para futuras requests
      userData.access_token = access_token;

      setUser(userData);
      return true;
    } catch (err) {
      console.error("Error en autenticación:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    clearError();
    // Redirect a home si estamos en ruta protegida
    if (window.location.pathname.startsWith("/dashboard")) {
      window.location.href = "/";
    }
  };

  // Restaurar usuario del localStorage
  const restoreUser = () => {
    try {
      const savedUser = localStorage.getItem("auth_user");
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        user.value = userData;
      }
    } catch (err) {
      console.error("Error restaurando usuario:", err);
      localStorage.removeItem("auth_user");
    }
  };

  // Verificar si el token sigue válido
  const validateSession = async () => {
    if (!user.value?.access_token) return false;

    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${user.value.access_token}`,
          Accept: "application/vnd.github+json",
        },
      });

      if (!response.ok) {
        // Token inválido
        logout();
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error validando sesión:", err);
      logout();
      return false;
    }
  };

  return {
    // Estado
    user,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    userAvatar,
    userName,
    userProfile,

    // Actions
    setUser,
    setLoading,
    setError,
    clearError,
    loginWithGitHub,
    handleGitHubCallback,
    logout,
    restoreUser,
    validateSession,
  };
});
