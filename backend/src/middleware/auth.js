/**
 * Middleware d'authentification
 * 
 * DEUX TYPES D'AUTHENTIFICATION:
 * 1. Admin: Clé API dans le header (x-admin-api-key)
 * 2. Client: JWT dans le header (Authorization: Bearer <token>)
 */

/**
 * Authentification admin (clé API)
 * Utilisé pour: upload produit, upload galerie
 */
export const authenticateAdmin = (req, res, next) => {
  const adminKey = req.headers['x-admin-api-key'];
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    console.warn('⚠️  ADMIN_API_KEY not configured in .env');
    return res.status(500).json({
      success: false,
      error: 'Admin authentication not configured',
    });
  }

  if (!adminKey || adminKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      error: 'Invalid admin API key',
    });
  }

  req.user = { role: 'admin' };
  next();
};

/**
 * Authentification client (JWT)
 * Utilisé pour: upload review-photo
 * 
 * NOTE: Pour l'instant, on accepte aussi les uploads anonymes
 * pour les tissus (endpoint /fabric)
 */
export const authenticateClient = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Pas d'authentification, mais on continue (optionnel)
    req.user = null;
    return next();
  }

  const token = authHeader.substring(7);

  try {
    // TODO: Vérifier le JWT avec votre service d'authentification
    // Pour l'instant, on fait une vérification basique
    const decoded = verifyJWT(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
};

/**
 * Vérification JWT (placeholder)
 * À remplacer par votre service d'authentification (Supabase Auth, Firebase Auth, etc.)
 */
function verifyJWT(token) {
  // TODO: Implémenter la vérification JWT
  // Exemple avec Supabase:
  // const { data, error } = await supabase.auth.getUser(token);
  // if (error) throw error;
  // return data.user;

  // Pour l'instant, on retourne un utilisateur mock
  return {
    id: 'mock-user-id',
    email: 'client@example.com',
    role: 'client',
  };
}
