const errorHandler = (err, req, res, next) => {
  console.error("💥 Error:", err.stack);

  // Error de CORS
  if (err.message === "No permitido por CORS") {
    return res.status(403).json({
      error: "CORS Error",
      message: "Origin no permitido",
    });
  }

  // Error de validación
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      message: err.message,
    });
  }

  // Error genérico
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "production" ? "Algo salió mal" : err.message,
  });
};

module.exports = errorHandler;
