// routes/auth.js

const express = require("express");
const router = express.Router();
const {
  exchangeGitHubToken,
  getUserProfile,
  validateToken,
  authHealthCheck,
} = require("../controllers/authController");

// Middleware para logging en desarrollo
if (process.env.NODE_ENV === "development") {
  router.use((req, res, next) => {
    console.log(
      `🔗 Auth Route: ${req.method} ${req.path}`,
      req.method === "POST" ? { body: req.body } : ""
    );
    next();
  });
}

// 🚀 RUTA PRINCIPAL - Lo que espera tu frontend
router.post("/github", exchangeGitHubToken);

// 📊 Rutas adicionales para funcionalidad completa
router.post("/github/user", getUserProfile);
router.get("/validate", validateToken);

// 🏥 Health check específico de auth
router.get("/health", authHealthCheck);

// 🧪 Ruta de testing (solo en desarrollo)
if (process.env.NODE_ENV === "development") {
  router.get("/test", (req, res) => {
    res.json({
      message: "Auth routes working!",
      environment: process.env.NODE_ENV,
      github_client_id: process.env.GITHUB_CLIENT_ID ? "Configured" : "Missing",
      github_client_secret: process.env.GITHUB_CLIENT_SECRET
        ? "Configured"
        : "Missing",
      frontend_url: process.env.FRONTEND_URL || "Not set",
    });
  });
}

module.exports = router;
