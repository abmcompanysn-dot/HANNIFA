import { LocalStorageProvider } from '../providers/local.js';
import { SupabaseStorageProvider } from '../providers/supabase.js';
import { CloudinaryStorageProvider } from '../providers/cloudinary.js';

/**
 * Service de stockage abstrait
 * 
 * Utilise le provider configuré dans .env (STORAGE_PROVIDER)
 * Providers disponibles: local, supabase, cloudinary
 */

class StorageService {
  constructor() {
    const provider = process.env.STORAGE_PROVIDER || 'local';
    
    switch (provider) {
      case 'supabase':
        this.provider = new SupabaseStorageProvider();
        break;
      case 'cloudinary':
        this.provider = new CloudinaryStorageProvider();
        break;
      case 'local':
      default:
        this.provider = new LocalStorageProvider();
        break;
    }

    console.log(`💾 Storage provider initialized: ${provider}`);
  }

  /**
   * Upload un fichier
   * 
   * @param {Object} params
   * @param {Buffer} params.buffer - Contenu du fichier
   * @param {string} params.filename - Nom du fichier
   * @param {string} params.folder - Dossier de destination
   * @param {Object} params.metadata - Métadonnées associées
   * 
   * @returns {Promise<{url: string, publicId: string}>}
   */
  async upload({ buffer, filename, folder, metadata = {} }) {
    try {
      const result = await this.provider.upload({
        buffer,
        filename,
        folder,
        metadata,
      });

      console.log(`✅ Uploaded: ${result.publicId}`);
      return result;
    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Supprime un fichier
   * 
   * @param {string} publicId - Identifiant du fichier
   * @returns {Promise<void>}
   */
  async delete(publicId) {
    try {
      await this.provider.delete(publicId);
      console.log(`🗑️  Deleted: ${publicId}`);
    } catch (error) {
      console.error('❌ Delete failed:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Récupère l'URL d'un fichier
   * 
   * @param {string} publicId - Identifiant du fichier
   * @returns {Promise<string>}
   */
  async getUrl(publicId) {
    try {
      return await this.provider.getUrl(publicId);
    } catch (error) {
      console.error('❌ GetUrl failed:', error);
      throw new Error(`GetUrl failed: ${error.message}`);
    }
  }
}

// Instance singleton
export const storageService = new StorageService();
