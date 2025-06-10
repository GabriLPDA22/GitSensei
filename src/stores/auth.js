// src/stores/auth.js - CON SUPABASE Y DATOS REALES

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { UserProgressService } from '@/services/userProgressService'

export const useAuthStore = defineStore("auth", () => {
  // Estado
  const user = ref(null);
  const userProgress = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // 🔧 URL de tu backend
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  // Getters
  const isAuthenticated = computed(() => !!user.value);
  const userAvatar = computed(() => user.value?.github_avatar_url || user.value?.avatar_url || null);
  const userName = computed(
    () => user.value?.github_name || user.value?.name || user.value?.github_username || user.value?.login || "Usuario"
  );
  const userProfile = computed(() => user.value?.html_url || null);

  // Actions
  const setUser = (userData) => {
    user.value = userData;
    if (userData) {
      localStorage.setItem("auth_user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("auth_user");
      userProgress.value = null;
    }
  };

  const setUserProgress = (progressData) => {
    userProgress.value = progressData;
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

  // 🚀 CARGAR PROGRESO COMPLETO DEL USUARIO
  const loadUserProgress = async () => {
    if (!user.value?.id) {
      console.log('⚠️ No hay usuario para cargar progreso')
      return;
    }

    try {
      console.log("📊 Cargando progreso del usuario...");
      const progressData = await UserProgressService.getUserProgress(user.value.id);
      setUserProgress(progressData);
      console.log("✅ Progreso cargado:", progressData);
    } catch (error) {
      console.error("❌ Error cargando progreso:", error);
    }
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

    console.log("🔐 Iniciando OAuth con GitHub...");

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

    // Redirect a GitHub
    window.location.href = authUrl;
  };

  // 🔥 PROCESAR CALLBACK CON SUPABASE
  const handleGitHubCallback = async (code) => {
    if (!code) {
      setError("Código de autorización no recibido");
      return false;
    }

    try {
      setLoading(true);
      clearError();

      console.log("🔄 Procesando callback con código:", code);

      // 1. Obtener token de tu backend
      const tokenResponse = await fetch(`${API_BASE_URL}/auth/github`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(errorData.error || "Error obteniendo token de acceso");
      }

      const { access_token } = await tokenResponse.json();
      console.log("✅ Token obtenido exitosamente");

      // 2. Obtener datos del usuario desde GitHub
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      if (!userResponse.ok) {
        throw new Error("Error obteniendo datos del usuario");
      }

      const githubUserData = await userResponse.json();
      githubUserData.access_token = access_token;

      console.log("👤 Datos de GitHub obtenidos:", githubUserData.login);

      // 3. 🚀 CREAR/ACTUALIZAR USUARIO EN SUPABASE
      const supabaseUser = await UserProgressService.createOrUpdateUser(githubUserData);
      console.log("💾 Usuario guardado en Supabase:", supabaseUser.id);

      // 4. Combinar datos de GitHub + Supabase
      const completeUserData = {
        ...githubUserData,
        ...supabaseUser,
        // Mantener access_token de GitHub para futuras API calls
        access_token: githubUserData.access_token
      };

      setUser(completeUserData);

      // 5. Cargar progreso del usuario
      await loadUserProgress();

      // 6. Actualizar racha
      await UserProgressService.updateStreak(supabaseUser.id);

      return true;
    } catch (err) {
      console.error("💥 Error en autenticación:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    console.log("👋 Cerrando sesión...");
    setUser(null);
    clearError();

    // Redirect a home si estamos en ruta protegida
    if (window.location.pathname.startsWith("/dashboard")) {
      window.location.href = "/";
    }
  };

  // Restaurar usuario del localStorage Y cargar progreso
  const restoreUser = async () => {
    try {
      const savedUser = localStorage.getItem("auth_user");
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        user.value = userData;
        console.log("🔄 Usuario restaurado:", userData.github_username || userData.login);

        // Cargar progreso si tenemos el ID de Supabase
        if (userData.id) {
          await loadUserProgress();
        }
      }
    } catch (err) {
      console.error("💥 Error restaurando usuario:", err);
      localStorage.removeItem("auth_user");
    }
  };

  // Verificar si el token sigue válido
  const validateSession = async () => {
    if (!user.value?.access_token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        headers: {
          Authorization: `Bearer ${user.value.access_token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        logout();
        return false;
      }

      const result = await response.json();
      return result.valid;
    } catch (err) {
      console.error("💥 Error validando sesión:", err);
      logout();
      return false;
    }
  };

  // 🎯 MÉTODOS PARA PROGRESO DEL USUARIO
  const completeLesson = async (moduleId, lessonId, lessonTitle, points = 50) => {
    if (!user.value?.id) return false;

    try {
      await UserProgressService.completeLesson(user.value.id, moduleId, lessonId, lessonTitle, points);
      // Recargar progreso
      await loadUserProgress();
      return true;
    } catch (error) {
      console.error("❌ Error completando lección:", error);
      return false;
    }
  };

  const awardAchievement = async (achievementType, name, description, emoji, points = 0) => {
    if (!user.value?.id) return false;

    try {
      const awarded = await UserProgressService.awardAchievement(
        user.value.id,
        achievementType,
        name,
        description,
        emoji,
        points
      );

      if (awarded) {
        // Recargar progreso para mostrar nuevo logro
        await loadUserProgress();
      }

      return awarded;
    } catch (error) {
      console.error("❌ Error otorgando logro:", error);
      return false;
    }
  };

  return {
    // Estado
    user,
    userProgress,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    userAvatar,
    userName,
    userProfile,

    // Actions
    setUser,
    setUserProgress,
    setLoading,
    setError,
    clearError,
    loadUserProgress,
    loginWithGitHub,
    handleGitHubCallback,
    logout,
    restoreUser,
    validateSession,

    // Progreso
    completeLesson,
    awardAchievement,
  };
});
