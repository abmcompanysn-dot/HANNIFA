import { v4 as uuidv4 } from 'uuid';
import path from 'path';

/**
 * Utilitaires de sécurité pour les uploads
 * 
 * PROTECTIONS:
 * 1. Sanitization des noms de fichiers (anti path traversal)
 * 2. Génération de noms uniques (anti collision)
 * 3. Vérification des extensions
 * 4. Limitation de la taille
 */

/**
 * Sanitize un nom de fichier
 * 
 * PROTECTIONS:
 * - Supprime les caractères dangereux
 * - Empêche le path traversal (../)
 * - Génère un nom unique
 * 
 * @param {string} originalName - Nom original du fichier
 * @param {string} folder - Dossier de destination
 * @returns {string} - Nom de fichier sécurisé
 */
export const sanitizeFilename = (originalName, folder = 'general') => {
  // 1. Extraire l'extension
  const ext = path.extname(originalName).toLowerCase();
  
  // 2. Vérifier l'extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  if (!allowedExtensions.includes(ext)) {
    throw new Error(`Invalid file extension: ${ext}`);
  }

  // 3. Générer un nom unique
  const uniqueId = uuidv4();
  const timestamp = Date.now();
  
  // 4. Construire le nom final
  // Format: folder-timestamp-uuid.ext
  const safeName = `${folder}-${timestamp}-${uniqueId}${ext}`;

  return safeName;
};

/**
 * Vérifie si un nom de fichier est sûr
 * 
 * @param {string} filename - Nom du fichier
 * @returns {boolean}
 */
export const isFilenameSafe = (filename) => {
  // Empêcher le path traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }

  // Empêcher les caractères dangereux
  const dangerousChars = ['<', '>', ':', '"', '|', '?', '*', '\0'];
  for (const char of dangerousChars) {
    if (filename.includes(char)) {
      return false;
    }
  }

  return true;
};

/**
 * Génère un token de sécurité pour les uploads
 * 
 * @param {string} userId - ID de l'utilisateur
 * @param {number} expiresIn - Durée de validité (ms)
 * @returns {string}
 */
export const generateUploadToken = (userId, expiresIn = 3600000) => {
  const payload = {
    userId,
    timestamp: Date.now(),
    expiresAt: Date.now() + expiresIn,
  };

  // Encoder en base64 (simplifié, utiliser JWT en production)
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

/**
 * Vérifie un token d'upload
 * 
 * @param {string} token - Token à vérifier
 * @returns {Object|null}
 */
export const verifyUploadToken = (token) => {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Vérifier l'expiration
    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
};

/**
 * Calcule le hash d'un fichier (pour détecter les doublons)
 * 
 * @param {Buffer} buffer - Contenu du fichier
 * @returns {Promise<string>}
 */
export const calculateFileHash = async (buffer) => {
  const crypto = await import('crypto');
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

/**
 * Vérifie si un fichier est une image valide
 * 
 * @param {Buffer} buffer - Contenu du fichier
 * @returns {Promise<boolean>}
 */
export const isValidImage = async (buffer) => {
  try {
    const sharp = (await import('sharp')).default;
    await sharp(buffer).metadata();
    return true;
  } catch (error) {
    return false;
  }
};
