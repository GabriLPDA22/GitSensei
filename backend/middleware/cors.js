// middleware/cors.js

const cors = require("cors");

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      console.log("🔄 Request sin origin permitido");
      return callback(null, true);
    }

    const allowedOrigins = [
      "http://localhost:5173", // Vite dev (tu frontend)
      "http://localhost:3000", // React dev alternativo
      "http://localhost:4173", // Vite preview
      "http://127.0.0.1:5173", // Localhost alternativo
      "https://github.com", // GitHub OAuth redirects
      process.env.FRONTEND_URL, // URL desde .env
      // Agregar tu dominio de producción aquí cuando despliegues:
      // 'https://tu-app.vercel.app',
    ].filter(Boolean); // Quitar valores undefined

    if (allowedOrigins.includes(origin)) {
      console.log("✅ Origin permitido:", origin);
      callback(null, true);
    } else {
      console.log("❌ Origin NO permitido:", origin);
      console.log("📋 Origins permitidos:", allowedOrigins);
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Authorization"],
};

// En desarrollo, ser más permisivo
if (process.env.NODE_ENV === "development") {
  console.log("🔧 CORS configurado para desarrollo");
  // corsOptions.origin = true; // Descomentar si tienes problemas en dev
}

const corsMiddleware = cors(corsOptions);

// Middleware wrapper con logging
module.exports = (req, res, next) => {
  // Log para requests de OAuth
  if (req.path.includes("/auth/")) {
    console.log(`🔐 CORS check para auth: ${req.method} ${req.path}`);
    console.log(`📍 Origin: ${req.get("origin") || "sin origin"}`);
  }

  corsMiddleware(req, res, next);
};
