import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Provider de stockage local
 * 
 * Stocke les fichiers sur le disque du serveur
 * Idéal pour le développement et les petits projets
 * 
 * CONFIGURATION (.env):
 * LOCAL_UPLOAD_DIR=./uploads
 * LOCAL_BASE_URL=http://localhost:3001/uploads
 */
export class LocalStorageProvider {
  constructor() {
    this.uploadDir = process.env.LOCAL_UPLOAD_DIR || './uploads';
    this.baseUrl = process.env.LOCAL_BASE_URL || 'http://localhost:3001/uploads';
    
    // Créer le dossier d'upload s'il n'existe pas
    this.ensureUploadDir();
  }

  async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      console.log(`📁 Upload directory ready: ${this.uploadDir}`);
    } catch (error) {
      console.error('❌ Failed to create upload directory:', error);
    }
  }

  /**
   * Upload un fichier
   */
  async upload({ buffer, filename, folder, metadata = {} }) {
    try {
      // Créer le sous-dossier
      const folderPath = path.join(this.uploadDir, folder);
      await fs.mkdir(folderPath, { recursive: true });

      // Générer un nom unique
      const uniqueId = uuidv4();
      const ext = path.extname(filename);
      const uniqueFilename = `${uniqueId}${ext}`;
      const filePath = path.join(folderPath, uniqueFilename);

      // Écrire le fichier
      await fs.writeFile(filePath, buffer);

      // Construire l'URL publique
      const publicId = `${folder}/${uniqueFilename}`;
      const url = `${this.baseUrl}/${publicId}`;

      // Sauvegarder les métadonnées (optionnel)
      const metadataPath = path.join(folderPath, `${uniqueId}.meta.json`);
      await fs.writeFile(metadataPath, JSON.stringify({
        originalName: filename,
        uploadedAt: new Date().toISOString(),
        ...metadata,
      }, null, 2));

      return {
        url,
        publicId,
        path: filePath,
      };
    } catch (error) {
      throw new Error(`Local upload failed: ${error.message}`);
    }
  }

  /**
   * Supprime un fichier
   */
  async delete(publicId) {
    try {
      const filePath = path.join(this.uploadDir, publicId);
      
      // Supprimer le fichier
      await fs.unlink(filePath);

      // Supprimer les métadonnées si elles existent
      const uniqueId = path.basename(publicId, path.extname(publicId));
      const metadataPath = path.join(path.dirname(filePath), `${uniqueId}.meta.json`);
      try {
        await fs.unlink(metadataPath);
      } catch (e) {
        // Pas de métadonnées, ce n'est pas grave
      }
    } catch (error) {
      throw new Error(`Local delete failed: ${error.message}`);
    }
  }

  /**
   * Récupère l'URL d'un fichier
   */
  async getUrl(publicId) {
    return `${this.baseUrl}/${publicId}`;
  }
}
