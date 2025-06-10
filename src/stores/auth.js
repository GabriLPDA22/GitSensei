// src/stores/auth.js - ACTUALIZADO PARA TU BACKEND

import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAuthStore = defineStore("auth", () => {
  // Estado
  const user = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // 🔧 URL de tu backend - AJUSTAR SEGÚN TU CONFIGURACIÓN
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

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

    console.log("🔐 Iniciando OAuth con GitHub...");

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

    // Redirect a GitHub
    window.location.href = authUrl;
  };

  // Procesar callback de GitHub usando TU BACKEND
  const handleGitHubCallback = async (code) => {
    if (!code) {
      setError("Código de autorización no recibido");
      return false;
    }

    try {
      setLoading(true);
      clearError();

      console.log("🔄 Procesando callback con código:", code);

      // 🚀 LLAMADA A TU BACKEND
      const tokenResponse = await fetch(`${API_BASE_URL}/auth/github`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      console.log("📨 Respuesta del backend:", tokenResponse.status);

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(errorData.error || "Error obteniendo token de acceso");
      }

      const { access_token } = await tokenResponse.json();
      console.log("✅ Token obtenido exitosamente");

      // Obtener datos del usuario con el token
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

      const userData = await userResponse.json();
      console.log("👤 Datos de usuario obtenidos:", userData.login);

      // Guardar token para futuras requests
      userData.access_token = access_token;

      setUser(userData);
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

  // Restaurar usuario del localStorage
  const restoreUser = () => {
    try {
      const savedUser = localStorage.getItem("auth_user");
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        user.value = userData;
        console.log("🔄 Usuario restaurado:", userData.login);
      }
    } catch (err) {
      console.error("💥 Error restaurando usuario:", err);
      localStorage.removeItem("auth_user");
    }
  };

  // Verificar si el token sigue válido usando tu backend
  const validateSession = async () => {
    if (!user.value?.access_token) return false;

    try {
      // Opción 1: Usar tu backend
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
