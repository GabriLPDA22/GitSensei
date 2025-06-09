const axios = require("axios");

const exchangeGitHubToken = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        error: "Código de autorización requerido",
      });
    }

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

    const { access_token, error } = tokenResponse.data;

    if (error) {
      return res.status(400).json({
        error: `GitHub Error: ${error}`,
      });
    }

    if (!access_token) {
      return res.status(400).json({
        error: "No se pudo obtener el token de acceso",
      });
    }

    // Devolver el token al frontend
    res.json({
      access_token,
      message: "Autenticación exitosa",
    });
  } catch (error) {
    console.error("Error en intercambio de token:", error);
    res.status(500).json({
      error: "Error interno del servidor",
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
      },
    });

    res.json(userResponse.data);
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({
      error: "Error obteniendo perfil de usuario",
    });
  }
};

module.exports = {
  exchangeGitHubToken,
  getUserProfile,
};
