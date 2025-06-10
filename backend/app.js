// app.js - SERVIDOR PRINCIPAL PARA GIT LEARNING PLATFORM

const express = require("express");
const corsMiddleware = require("./middleware/cors");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE GLOBAL
// ============================================

// CORS - debe ir ANTES que otros middlewares
app.use(corsMiddleware);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging en desarrollo
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log("   Body:", req.body);
    }
    next();
  });
}

// ============================================
// RUTAS
// ============================================

// 🔐 Rutas de autenticación (LO MÁS IMPORTANTE)
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// 🏥 Health check general
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Git Learning Platform API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// 📊 Endpoint para verificar configuración (solo desarrollo)
if (process.env.NODE_ENV === "development") {
  app.get("/api/config", (req, res) => {
    res.json({
      environment: process.env.NODE_ENV,
      port: PORT,
      cors_enabled: true,
      github_oauth: {
        client_id: process.env.GITHUB_CLIENT_ID
          ? "✅ Configured"
          : "❌ Missing",
        client_secret: process.env.GITHUB_CLIENT_SECRET
          ? "✅ Configured"
          : "❌ Missing",
      },
      frontend_url: process.env.FRONTEND_URL || "❌ Not set",
    });
  });
}

// ============================================
// RUTAS FUTURAS (Preparado para el roadmap)
// ============================================

// 💬 Chat routes (Paso 3 del roadmap)
// const chatRoutes = require('./routes/chat');
// app.use('/api/chat', chatRoutes);

// 📊 Stats routes (Paso 4 del roadmap)
// const statsRoutes = require('./routes/stats');
// app.use('/api/stats', statsRoutes);

// 🤖 AI Bot routes (Paso 5 del roadmap)
// const botRoutes = require('./routes/bot');
// app.use('/api/bot', botRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// Ruta 404 - debe ir ANTES del error handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint no encontrado",
    path: req.originalUrl,
    method: req.method,
    suggestion: "Verifica la URL y el método HTTP",
  });
});

// Error handler global - debe ir AL FINAL
app.use(errorHandler);

// ============================================
// INICIO DEL SERVIDOR
// ============================================

const server = app.listen(PORT, () => {
  console.log("🚀 Git Learning Platform Backend iniciado");
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`);
  console.log("");
  console.log("🔗 URLs disponibles:");
  console.log(`   📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`   🔐 Auth GitHub: http://localhost:${PORT}/api/auth/github`);
  console.log(`   🧪 Auth Test: http://localhost:${PORT}/api/auth/test`);
  if (process.env.NODE_ENV === "development") {
    console.log(`   ⚙️  Config Check: http://localhost:${PORT}/api/config`);
  }
  console.log("");
  console.log("📋 Estado de configuración:");
  console.log(
    `   GitHub Client ID: ${process.env.GITHUB_CLIENT_ID ? "✅" : "❌"}`
  );
  console.log(
    `   GitHub Secret: ${process.env.GITHUB_CLIENT_SECRET ? "✅" : "❌"}`
  );
  console.log(
    `   Frontend URL: ${process.env.FRONTEND_URL || "❌ No configurado"}`
  );
  console.log("");
  console.log("🎯 Roadmap Status: Paso 2 - Auth + Perfiles");
});

// Manejo de errores del servidor
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Puerto ${PORT} ya está en uso`);
    console.log("💡 Intenta:");
    console.log(`   - Cambiar PORT en .env`);
    console.log(`   - Matar proceso: lsof -ti:${PORT} | xargs kill`);
  } else {
    console.error("❌ Error del servidor:", error);
  }
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 Cerrando servidor...");
  server.close(() => {
    console.log("✅ Servidor cerrado correctamente");
    process.exit(0);
  });
});

module.exports = app;
