/**
 * Service d'upload pour le frontend HANI'S
 * 
 * Ce fichier montre comment intégrer le service de stockage
 * depuis le site React/Vite
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY;

/**
 * Upload une photo produit (admin)
 * 
 * @param {File} file - Fichier image
 * @param {string} productId - ID du produit
 * @param {string} variant - 'main' | 'detail' | 'silhouette'
 * @returns {Promise<Object>} - Données de l'image uploadée
 */
export const uploadProductImage = async (file, productId, variant = 'main') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('productId', productId);
  formData.append('variant', variant);

  const response = await fetch(`${API_BASE_URL}/upload/product-image`, {
    method: 'POST',
    headers: {
      'x-admin-api-key': ADMIN_API_KEY,
    },
    body: formData,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Upload failed');
  }

  return data.data;
};

/**
 * Upload une photo de tissu (client)
 * 
 * @param {File} file - Fichier image
 * @param {string} orderId - ID de la commande (optionnel)
 * @param {string} notes - Commentaires (optionnel)
 * @returns {Promise<Object>} - Données de l'image uploadée
 */
export const uploadFabric = async (file, orderId = null, notes = '') => {
  const formData = new FormData();
  formData.append('file', file);
  if (orderId) formData.append('orderId', orderId);
  if (notes) formData.append('notes', notes);

  const response = await fetch(`${API_BASE_URL}/upload/fabric`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Upload failed');
  }

  return data.data;
};

/**
 * Upload une photo de galerie (admin)
 * 
 * @param {File} file - Fichier image
 * @param {string} title - Titre de la réalisation
 * @param {string} category - 'Femme' | 'Homme' | 'Sur mesure' | 'Artisanat'
 * @param {string} description - Description (optionnel)
 * @param {string[]} tags - Tags (optionnel)
 * @returns {Promise<Object>} - Données de l'image uploadée
 */
export const uploadGalleryImage = async (file, title, category, description = '', tags = []) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('category', category);
  if (description) formData.append('description', description);
  if (tags.length > 0) formData.append('tags', tags.join(','));

  const response = await fetch(`${API_BASE_URL}/upload/gallery`, {
    method: 'POST',
    headers: {
      'x-admin-api-key': ADMIN_API_KEY,
    },
    body: formData,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Upload failed');
  }

  return data.data;
};

/**
 * Upload une photo d'avis (client)
 * 
 * @param {File} file - Fichier image
 * @param {string} reviewId - ID de l'avis (optionnel)
 * @param {string} productId - ID du produit (optionnel)
 * @param {string} token - JWT du client
 * @returns {Promise<Object>} - Données de l'image uploadée
 */
export const uploadReviewPhoto = async (file, reviewId = null, productId = null, token) => {
  const formData = new FormData();
  formData.append('file', file);
  if (reviewId) formData.append('reviewId', reviewId);
  if (productId) formData.append('productId', productId);

  const response = await fetch(`${API_BASE_URL}/upload/review-photo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Upload failed');
  }

  return data.data;
};

/**
 * Supprime une image
 * 
 * @param {string} publicId - ID public de l'image
 * @returns {Promise<void>}
 */
export const deleteImage = async (publicId) => {
  const response = await fetch(`${API_BASE_URL}/upload/${publicId}`, {
    method: 'DELETE',
    headers: {
      'x-admin-api-key': ADMIN_API_KEY,
    },
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Delete failed');
  }
};

/**
 * Exemple d'utilisation dans un composant React
 */
export const UploadExample = () => {
  const handleProductUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await uploadProductImage(file, 'product-123', 'main');
      console.log('Image uploaded:', result.url);
      // Mettre à jour l'UI avec l'URL de l'image
    } catch (error) {
      console.error('Upload failed:', error.message);
      // Afficher un message d'erreur
    }
  };

  const handleFabricUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await uploadFabric(file, 'order-456', 'Tissu en soie');
      console.log('Fabric uploaded:', result.url);
      // Mettre à jour l'UI avec l'URL de l'image
    } catch (error) {
      console.error('Upload failed:', error.message);
      // Afficher un message d'erreur
    }
  };

  return (
    <div>
      <h2>Upload de produit</h2>
      <input type="file" accept="image/*" onChange={handleProductUpload} />

      <h2>Upload de tissu</h2>
      <input type="file" accept="image/*" onChange={handleFabricUpload} />
    </div>
  );
};
