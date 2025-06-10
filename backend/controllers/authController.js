// controllers/authController.js

const axios = require("axios");

const exchangeGitHubToken = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        error: "Código de autorización requerido",
      });
    }

    console.log("🔄 Intercambiando código por token...", code);

    // Intercambiar code por access_token con GitHub
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📨 Respuesta de GitHub:", tokenResponse.data);

    const { access_token, error, error_description } = tokenResponse.data;

    if (error) {
      console.error("❌ Error de GitHub:", error, error_description);
      return res.status(400).json({
        error: `GitHub Error: ${error_description || error}`,
      });
    }

    if (!access_token) {
      return res.status(400).json({
        error: "No se pudo obtener el token de acceso",
      });
    }

    console.log("✅ Token obtenido exitosamente");

    // Devolver el token al frontend
    res.json({
      access_token,
      message: "Autenticación exitosa",
    });
  } catch (error) {
    console.error(
      "💥 Error en intercambio de token:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Error interno del servidor",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({
        error: "Token de acceso requerido",
      });
    }

    // Obtener datos del usuario desde GitHub
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    console.log("👤 Datos de usuario obtenidos:", userResponse.data.login);

    res.json(userResponse.data);
  } catch (error) {
    console.error(
      "💥 Error obteniendo perfil:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Error obteniendo perfil de usuario",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Validar token de GitHub
const validateToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    const token = authHeader.substring(7);

    // Verificar token con GitHub
    const response = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    res.json({
      valid: true,
      user: response.data,
    });
  } catch (error) {
    res.status(401).json({
      valid: false,
      error: "Token inválido",
    });
  }
};

// Health check específico para auth
const authHealthCheck = (req, res) => {
  res.json({
    status: "OK",
    service: "Auth Service",
    timestamp: new Date().toISOString(),
    github_configured: !!(
      process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ),
  });
};

module.exports = {
  exchangeGitHubToken,
  getUserProfile,
  validateToken,
  authHealthCheck,
};
