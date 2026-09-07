import sharp from 'sharp';

/**
 * Optimiseur d'images
 * 
 * Utilise Sharp pour:
 * - Redimensionner les images
 * - Convertir en WebP (meilleure compression)
 * - Réduire la qualité pour économiser de la bande passante
 * - Générer des thumbnails
 * 
 * PERFORMANCE:
 * - Sharp est 4-5x plus rapide que ImageMagick
 * - WebP réduit la taille de 25-35% vs JPEG
 * - Lazy loading + optimisation = site ultra-rapide
 */

/**
 * Optimise une image
 * 
 * @param {Buffer} buffer - Contenu de l'image
 * @param {Object} options
 * @param {number} options.width - Largeur max (px)
 * @param {number} options.height - Hauteur max (px)
 * @param {number} options.quality - Qualité (1-100)
 * @param {string} options.format - Format de sortie ('webp', 'jpeg', 'png')
 * 
 * @returns {Promise<{buffer: Buffer, width: number, height: number, size: number}>}
 */
export const optimizeImage = async (buffer, options = {}) => {
  const {
    width = 1200,
    height = 1600,
    quality = 85,
    format = 'webp',
  } = options;

  try {
    // Charger l'image avec Sharp
    let image = sharp(buffer);

    // Récupérer les métadonnées
    const metadata = await image.metadata();

    // Redimensionner (en préservant le ratio)
    image = image.resize(width, height, {
      fit: 'inside', // Ne pas déformer
      withoutEnlargement: true, // Ne pas agrandir si l'image est plus petite
    });

    // Convertir et optimiser
    if (format === 'webp') {
      image = image.webp({ quality });
    } else if (format === 'jpeg' || format === 'jpg') {
      image = image.jpeg({ quality, mozjpeg: true });
    } else if (format === 'png') {
      image = image.png({ quality, compressionLevel: 9 });
    }

    // Convertir en buffer
    const optimizedBuffer = await image.toBuffer();

    // Récupérer les nouvelles dimensions
    const optimizedMetadata = await sharp(optimizedBuffer).metadata();

    return {
      buffer: optimizedBuffer,
      width: optimizedMetadata.width,
      height: optimizedMetadata.height,
      size: optimizedBuffer.length,
      format,
    };
  } catch (error) {
    throw new Error(`Image optimization failed: ${error.message}`);
  }
};

/**
 * Génère un thumbnail
 * 
 * @param {Buffer} buffer - Contenu de l'image
 * @param {number} size - Taille du thumbnail (carré)
 * @returns {Promise<Buffer>}
 */
export const generateThumbnail = async (buffer, size = 300) => {
  try {
    const thumbnail = await sharp(buffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 70 })
      .toBuffer();

    return thumbnail;
  } catch (error) {
    throw new Error(`Thumbnail generation failed: ${error.message}`);
  }
};

/**
 * Extrait les dimensions d'une image
 * 
 * @param {Buffer} buffer - Contenu de l'image
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
    };
  } catch (error) {
    throw new Error(`Failed to get image dimensions: ${error.message}`);
  }
};

/**
 * Convertit une image en WebP
 * 
 * @param {Buffer} buffer - Contenu de l'image
 * @param {number} quality - Qualité (1-100)
 * @returns {Promise<Buffer>}
 */
export const convertToWebP = async (buffer, quality = 85) => {
  try {
    const webp = await sharp(buffer)
      .webp({ quality })
      .toBuffer();

    return webp;
  } catch (error) {
    throw new Error(`WebP conversion failed: ${error.message}`);
  }
};

/**
 * Calcule le ratio de compression
 * 
 * @param {number} originalSize - Taille originale (bytes)
 * @param {number} optimizedSize - Taille optimisée (bytes)
 * @returns {string} - Ratio de compression (ex: "65%")
 */
export const getCompressionRatio = (originalSize, optimizedSize) => {
  const ratio = ((originalSize - optimizedSize) / originalSize) * 100;
  return `${ratio.toFixed(1)}%`;
};
