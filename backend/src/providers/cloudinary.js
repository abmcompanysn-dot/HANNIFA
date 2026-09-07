import { v2 as cloudinary } from 'cloudinary';

/**
 * Provider de stockage Cloudinary
 * 
 * Stocke les fichiers dans Cloudinary
 * Recommandé pour les gros volumes d'images
 * 
 * AVANTAGES:
 * - Optimisation automatique (WebP, AVIF)
 * - Transformations à la volée (redimensionnement, filtres)
 * - CDN mondial
 * - Détection de visages, objets
 * 
 * CONFIGURATION (.env):
 * CLOUDINARY_CLOUD_NAME=your-cloud-name
 * CLOUDINARY_API_KEY=your-api-key
 * CLOUDINARY_API_SECRET=your-api-secret
 */
export class CloudinaryStorageProvider {
  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary credentials not configured');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    console.log(`☁️  Cloudinary initialized (cloud: ${cloudName})`);
  }

  /**
   * Upload un fichier
   */
  async upload({ buffer, filename, folder, metadata = {} }) {
    try {
      // Convertir le buffer en base64
      const base64 = buffer.toString('base64');
      const dataUri = `data:image/${this.getExtension(filename)};base64,${base64}`;

      // Upload vers Cloudinary
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: `hanis/${folder}`,
        public_id: this.generatePublicId(filename),
        resource_type: 'image',
        overwrite: false,
        context: {
          ...metadata,
          uploadedAt: new Date().toISOString(),
        },
        // Optimisations automatiques
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      };
    } catch (error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  /**
   * Supprime un fichier
   */
  async delete(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result !== 'ok') {
        throw new Error(`Delete failed: ${result.result}`);
      }
    } catch (error) {
      throw new Error(`Cloudinary delete failed: ${error.message}`);
    }
  }

  /**
   * Récupère l'URL d'un fichier
   */
  async getUrl(publicId) {
    return cloudinary.url(publicId, {
      secure: true,
    });
  }

  /**
   * Génère un public_id unique
   */
  generatePublicId(filename) {
    const timestamp = Date.now();
    const ext = this.getExtension(filename);
    const baseName = filename.replace(`.${ext}`, '').replace(/[^a-zA-Z0-9]/g, '-');
    return `${baseName}-${timestamp}`;
  }

  /**
   * Récupère l'extension du fichier
   */
  getExtension(filename) {
    return filename.toLowerCase().split('.').pop();
  }
}
