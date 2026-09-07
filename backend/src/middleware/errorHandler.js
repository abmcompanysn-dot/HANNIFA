/**
 * Middleware de gestion des erreurs
 * 
 * Capture toutes les erreurs et retourne une réponse JSON formatée
 */
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Erreur Multer (upload)
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: 'Upload error',
      details: err.message,
    });
  }

  // Erreur de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.message,
    });
  }

  // Erreur d'authentification
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  // Erreur de stockage (provider)
  if (err.name === 'StorageError') {
    return res.status(500).json({
      success: false,
      error: 'Storage error',
      details: err.message,
    });
  }

  // Erreur par défaut
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
