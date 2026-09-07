import { fileTypeFromBuffer } from 'file-type';
import sizeOf from 'image-size';

/**
 * Middleware de validation des fichiers uploadés
 * 
 * VÉRIFICATIONS:
 * 1. Présence du fichier
 * 2. Type MIME autorisé
 * 3. Taille max (5MB par défaut)
 * 4. Dimensions max (4096x4096 par défaut)
 * 5. Vérification du contenu réel (anti-spoofing)
 */
export const validateUpload = async (req, res, next) => {
  try {
    const file = req.file;

    // 1. Vérifier présence du fichier
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // 2. Vérifier la taille
    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: `File size exceeds limit of ${maxSize / (1024 * 1024)}MB`,
      });
    }

    // 3. Vérifier le type MIME via le contenu réel (anti-spoofing)
    const detectedType = await fileTypeFromBuffer(file.buffer);
    if (!detectedType) {
      return res.status(400).json({
        success: false,
        error: 'Unable to detect file type',
      });
    }

    const allowedMimeTypes = (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(',');
    if (!allowedMimeTypes.includes(detectedType.mime)) {
      return res.status(400).json({
        success: false,
        error: `Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}`,
      });
    }

    // 4. Vérifier les dimensions
    try {
      const dimensions = sizeOf(file.buffer);
      const maxWidth = parseInt(process.env.MAX_WIDTH) || 4096;
      const maxHeight = parseInt(process.env.MAX_HEIGHT) || 4096;

      if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
        return res.status(400).json({
          success: false,
          error: `Image dimensions exceed limit of ${maxWidth}x${maxHeight}px`,
        });
      }

      // Ajouter les dimensions au fichier pour usage ultérieur
      file.dimensions = dimensions;
    } catch (error) {
      // Si image-size échoue, ce n'est peut-être pas une image valide
      return res.status(400).json({
        success: false,
        error: 'Invalid image file',
      });
    }

    // 5. Vérifier la cohérence entre MIME déclaré et MIME détecté
    if (file.mimetype !== detectedType.mime) {
      console.warn(`MIME mismatch: declared ${file.mimetype}, detected ${detectedType.mime}`);
      // On accepte quand même, mais on log le warning
    }

    next();
  } catch (error) {
    next(error);
  }
};
