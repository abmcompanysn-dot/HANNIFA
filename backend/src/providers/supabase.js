import { createClient } from '@supabase/supabase-js';

/**
 * Provider de stockage Supabase
 * 
 * Stocke les fichiers dans Supabase Storage
 * Recommandé pour HANI'S (intégré avec la base de données)
 * 
 * CONFIGURATION (.env):
 * SUPABASE_URL=https://your-project.supabase.co
 * SUPABASE_ANON_KEY=your-anon-key
 * SUPABASE_BUCKET=hanis-images
 * 
 * SETUP SUPABASE:
 * 1. Créer un bucket "hanis-images" dans Supabase Storage
 * 2. Configurer les policies RLS:
 *    - Public read (tout le monde peut lire)
 *    - Authenticated write (seuls les utilisateurs authentifiés peuvent uploader)
 * 3. Activer le CDN pour les images
 */
export class SupabaseStorageProvider {
  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    this.bucket = process.env.SUPABASE_BUCKET || 'hanis-images';

    if (!url || !key) {
      throw new Error('Supabase credentials not configured');
    }

    this.supabase = createClient(url, key);
    console.log(`🗄️  Supabase Storage initialized (bucket: ${this.bucket})`);
  }

  /**
   * Upload un fichier
   */
  async upload({ buffer, filename, folder, metadata = {} }) {
    try {
      // Construire le chemin complet
      const filePath = `${folder}/${filename}`;

      // Upload vers Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .upload(filePath, buffer, {
          contentType: this.getContentType(filename),
          upsert: false,
          metadata: {
            ...metadata,
            uploadedAt: new Date().toISOString(),
          },
        });

      if (error) {
        throw new Error(error.message);
      }

      // Récupérer l'URL publique
      const { data: urlData } = this.supabase.storage
        .from(this.bucket)
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        publicId: data.path,
      };
    } catch (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }
  }

  /**
   * Supprime un fichier
   */
  async delete(publicId) {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucket)
        .remove([publicId]);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error(`Supabase delete failed: ${error.message}`);
    }
  }

  /**
   * Récupère l'URL d'un fichier
   */
  async getUrl(publicId) {
    const { data } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(publicId);

    return data.publicUrl;
  }

  /**
   * Détermine le Content-Type basé sur l'extension
   */
  getContentType(filename) {
    const ext = filename.toLowerCase().split('.').pop();
    const types = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'gif': 'image/gif',
    };
    return types[ext] || 'application/octet-stream';
  }
}
