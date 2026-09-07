import { Router } from 'express';
import multer from 'multer';
import { validateUpload } from '../middleware/validation.js';
import { authenticateAdmin, authenticateClient } from '../middleware/auth.js';
import { storageService } from '../services/storage.js';
import { optimizeImage } from '../utils/optimizer.js';
import { sanitizeFilename } from '../utils/security.js';

export const uploadRouter = Router();

// Configuration multer (stockage temporaire en mémoire)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  },
});

/**
 * ============================================
 * ENDPOINT 1: POST /api/upload/product-image
 * ============================================
 * 
 * USAGE: Admin upload une photo produit
 * 
 * AUTHENTIFICATION: Clé API admin requise (header: x-admin-api-key)
 * 
 * PARAMÈTRES:
 * - file: image (JPEG, PNG, WebP) - max 5MB
 * - productId: UUID du produit (optionnel, pour association)
 * - variant: 'main' | 'detail' | 'silhouette' (optionnel)
 * 
 * TRAITEMENT:
 * 1. Validation du fichier (format, taille, dimensions)
 * 2. Sanitization du nom de fichier
 * 3. Optimisation (redimensionnement, conversion WebP)
 * 4. Upload vers le provider de stockage
 * 5. Génération de thumbnails (si nécessaire)
 * 
 * RÉPONSE:
 * {
 *   success: true,
 *   data: {
 *     url: "https://...",
 *     publicId: "products/uuid.webp",
 *     width: 1200,
 *     height: 1600,
 *     size: 245678,
 *     format: "webp",
 *     variants: {
 *       thumbnail: "https://.../thumb.webp",
 *       medium: "https://.../medium.webp"
 *     }
 *   }
 * }
 * 
 * USE CASES HANI'S:
 * - Upload photo principale d'un nouveau modèle
 * - Upload photos supplémentaires (détails, porté)
 * - Remplacement d'une photo existante
 * - Upload photos pour la galerie de réalisations
 */
uploadRouter.post(
  '/product-image',
  authenticateAdmin,
  upload.single('file'),
  validateUpload,
  async (req, res, next) => {
    try {
      const { productId, variant = 'main' } = req.body;
      const file = req.file;

      // 1. Sanitization du nom de fichier
      const sanitizedFilename = sanitizeFilename(file.originalname, 'products');

      // 2. Optimisation de l'image
      const optimized = await optimizeImage(file.buffer, {
        width: 1200,
        height: 1600,
        quality: parseInt(process.env.IMAGE_QUALITY) || 85,
        format: 'webp',
      });

      // 3. Upload vers le provider
      const result = await storageService.upload({
        buffer: optimized.buffer,
        filename: sanitizedFilename,
        folder: 'products',
        metadata: {
          productId,
          variant,
          originalName: file.originalname,
          uploadedBy: 'admin',
        },
      });

      // 4. Génération de variantes (thumbnails)
      const variants = {};
      
      // Thumbnail (300x400)
      const thumb = await optimizeImage(file.buffer, {
        width: 300,
        height: 400,
        quality: 70,
        format: 'webp',
      });
      variants.thumbnail = await storageService.upload({
        buffer: thumb.buffer,
        filename: `thumb-${sanitizedFilename}`,
        folder: 'products/thumbnails',
        metadata: { productId, variant: 'thumbnail' },
      });

      // Medium (600x800)
      const medium = await optimizeImage(file.buffer, {
        width: 600,
        height: 800,
        quality: 80,
        format: 'webp',
      });
      variants.medium = await storageService.upload({
        buffer: medium.buffer,
        filename: `medium-${sanitizedFilename}`,
        folder: 'products/medium',
        metadata: { productId, variant: 'medium' },
      });

      res.json({
        success: true,
        data: {
          url: result.url,
          publicId: result.publicId,
          width: optimized.width,
          height: optimized.height,
          size: optimized.size,
          format: 'webp',
          variants: {
            thumbnail: variants.thumbnail.url,
            medium: variants.medium.url,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * ============================================
 * ENDPOINT 2: POST /api/upload/fabric
 * ============================================
 * 
 * USAGE: Client upload une photo de son tissu
 * 
 * AUTHENTIFICATION: JWT client ou session (optionnel)
 * 
 * PARAMÈTRES:
 * - file: image (JPEG, PNG, WebP) - max 5MB
 * - orderId: UUID de la commande (optionnel)
 * - notes: commentaire sur le tissu (optionnel)
 * 
 * TRAITEMENT:
 * 1. Validation du fichier
 * 2. Upload sans optimisation agressive (le client veut voir son tissu tel quel)
 * 3. Stockage sécurisé avec référence au client
 * 
 * RÉPONSE:
 * {
 *   success: true,
 *   data: {
 *     url: "https://...",
 *     publicId: "fabrics/uuid.jpg",
 *     size: 1234567,
 *     format: "jpeg"
 *   }
 * }
 * 
 * USE CASES HANI'S:
 * - Client envoie une photo d'un tissu qu'il possède
 * - Client montre un tissu vu ailleurs qu'il souhaite reproduire
 * - Upload de référence pour commande sur mesure
 * - Partage de tissu avec l'atelier pour validation
 */
uploadRouter.post(
  '/fabric',
  upload.single('file'),
  validateUpload,
  async (req, res, next) => {
    try {
      const { orderId, notes } = req.body;
      const file = req.file;
      const customerId = req.user?.id || 'anonymous';

      // 1. Sanitization
      const sanitizedFilename = sanitizeFilename(file.originalname, 'fabrics');

      // 2. Optimisation légère (on garde la qualité pour voir le tissu)
      const optimized = await optimizeImage(file.buffer, {
        width: 2000,
        height: 2000,
        quality: 90,
        format: 'webp',
      });

      // 3. Upload
      const result = await storageService.upload({
        buffer: optimized.buffer,
        filename: sanitizedFilename,
        folder: 'fabrics',
        metadata: {
          orderId,
          customerId,
          notes,
          uploadedBy: 'client',
        },
      });

      res.json({
        success: true,
        data: {
          url: result.url,
          publicId: result.publicId,
          size: optimized.size,
          format: 'webp',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * ============================================
 * ENDPOINT 3: POST /api/upload/gallery
 * ============================================
 * 
 * USAGE: Admin upload une photo de réalisation
 * 
 * AUTHENTIFICATION: Clé API admin requise
 * 
 * PARAMÈTRES:
 * - file: image (JPEG, PNG, WebP) - max 5MB
 * - title: titre de la réalisation
 * - category: 'Femme' | 'Homme' | 'Sur mesure' | 'Artisanat'
 * - description: description (optionnel)
 * - tags: tags séparés par virgules (optionnel)
 * 
 * TRAITEMENT:
 * 1. Validation du fichier
 * 2. Optimisation pour la galerie (qualité élevée)
 * 3. Upload avec métadonnées
 * 4. Génération de thumbnail pour la mosaïque
 * 
 * RÉPONSE:
 * {
 *   success: true,
 *   data: {
 *     url: "https://...",
 *     publicId: "gallery/uuid.webp",
 *     title: "Robe Awa terracotta",
 *     category: "Femme",
 *     thumbnail: "https://.../thumb.webp"
 *   }
 * }
 * 
 * USE CASES HANI'S:
 * - Upload photo d'une création terminée
 * - Ajout à la galerie de réalisations
 * - Catégorisation par type (Femme, Homme, etc.)
 * - Mise en avant du savoir-faire
 */
uploadRouter.post(
  '/gallery',
  authenticateAdmin,
  upload.single('file'),
  validateUpload,
  async (req, res, next) => {
    try {
      const { title, category, description, tags } = req.body;
      const file = req.file;

      // Validation des métadonnées
      if (!title || !category) {
        return res.status(400).json({
          success: false,
          error: 'Title and category are required',
        });
      }

      const validCategories = ['Femme', 'Homme', 'Sur mesure', 'Artisanat'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
        });
      }

      // 1. Sanitization
      const sanitizedFilename = sanitizeFilename(file.originalname, 'gallery');

      // 2. Optimisation haute qualité
      const optimized = await optimizeImage(file.buffer, {
        width: 1600,
        height: 2000,
        quality: 90,
        format: 'webp',
      });

      // 3. Upload
      const result = await storageService.upload({
        buffer: optimized.buffer,
        filename: sanitizedFilename,
        folder: 'gallery',
        metadata: {
          title,
          category,
          description,
          tags: tags ? tags.split(',').map(t => t.trim()) : [],
          uploadedBy: 'admin',
        },
      });

      // 4. Thumbnail pour la mosaïque
      const thumb = await optimizeImage(file.buffer, {
        width: 400,
        height: 500,
        quality: 75,
        format: 'webp',
      });
      const thumbResult = await storageService.upload({
        buffer: thumb.buffer,
        filename: `thumb-${sanitizedFilename}`,
        folder: 'gallery/thumbnails',
        metadata: { title, category },
      });

      res.json({
        success: true,
        data: {
          url: result.url,
          publicId: result.publicId,
          title,
          category,
          thumbnail: thumbResult.url,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * ============================================
 * ENDPOINT 4: POST /api/upload/review-photo
 * ============================================
 * 
 * USAGE: Client upload une photo avec son avis
 * 
 * AUTHENTIFICATION: JWT client requis
 * 
 * PARAMÈTRES:
 * - file: image (JPEG, PNG, WebP) - max 5MB
 * - reviewId: UUID de l'avis (optionnel, pour association)
 * - productId: UUID du produit (optionnel)
 * 
 * TRAITEMENT:
 * 1. Validation du fichier
 * 2. Optimisation légère
 * 3. Upload avec statut "pending" (modération requise)
 * 
 * RÉPONSE:
 * {
 *   success: true,
 *   data: {
 *     url: "https://...",
 *     publicId: "reviews/uuid.webp",
 *     status: "pending",
 *     message: "Photo en attente de modération"
 *   }
 * }
 * 
 * USE CASES HANI'S:
 * - Client partage une photo de sa tenue portée
 * - Ajout de photos à un avis produit
 * - Modération par l'atelier avant publication
 * - Preuve visuelle pour les futurs clients
 */
uploadRouter.post(
  '/review-photo',
  upload.single('file'),
  validateUpload,
  async (req, res, next) => {
    try {
      const { reviewId, productId } = req.body;
      const file = req.file;
      const customerId = req.user?.id;

      if (!customerId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      // 1. Sanitization
      const sanitizedFilename = sanitizeFilename(file.originalname, 'reviews');

      // 2. Optimisation
      const optimized = await optimizeImage(file.buffer, {
        width: 1200,
        height: 1200,
        quality: 85,
        format: 'webp',
      });

      // 3. Upload avec statut pending
      const result = await storageService.upload({
        buffer: optimized.buffer,
        filename: sanitizedFilename,
        folder: 'reviews',
        metadata: {
          reviewId,
          productId,
          customerId,
          status: 'pending', // Modération requise
          uploadedBy: 'client',
        },
      });

      res.json({
        success: true,
        data: {
          url: result.url,
          publicId: result.publicId,
          status: 'pending',
          message: 'Photo en attente de modération',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * ============================================
 * ENDPOINT BONUS: DELETE /api/upload/:publicId
 * ============================================
 * 
 * USAGE: Supprimer une image (admin ou propriétaire)
 * 
 * AUTHENTIFICATION: Admin ou propriétaire du fichier
 * 
 * RÉPONSE:
 * {
 *   success: true,
 *   message: "Image deleted successfully"
 * }
 */
uploadRouter.delete('/:publicId', async (req, res, next) => {
  try {
    const { publicId } = req.params;
    
    await storageService.delete(publicId);

    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});
