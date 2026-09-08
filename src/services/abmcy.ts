/**
 * Service API ABMCY Core pour HANI'S
 * 
 * Documentation complète : https://api.abmcy.com
 * 
 * Ce service encapsule tous les appels à l'API ABMCY :
 * - Authentification (clé API tenant, JWT personnel, JWT client)
 * - Commandes (standard et sur-mesure)
 * - Mesures sur-mesure
 * - Upload d'images
 * - Paiements (CinetPay)
 * - Notifications email
 * - Catalogue (produits, tissus, galerie, panier, avis)
 * - Comptes clients
 * - Gestion d'équipe
 */

const API_BASE_URL = (import.meta as any).env?.VITE_ABMCY_API_URL || 'https://api.abmcy.com';
const TENANT_API_KEY = (import.meta as any).env?.VITE_ABMCY_API_KEY || '';
const TENANT_SLUG = (import.meta as any).env?.VITE_ABMCY_TENANT_SLUG || 'hanis';

// ============================================
// TYPES
// ============================================

export type ABMCYError = {
  code: string;
  message: string;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'paid' | 'making' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address?: string;
  notes?: string;
  measurements?: Record<string, number>;
  created_at: string;
  updated_at: string;
};

export type CustomOrder = Order & {
  fabric_id?: string;
  fabric_source?: 'maison' | 'envoi_photo' | 'conseil_atelier';
  fabric_photo_url?: string;
};

export type Measurement = {
  id: string;
  customer_name: string;
  customer_phone: string;
  gender: 'femme' | 'homme';
  values: Record<string, number>;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  sku?: string;
  stock_quantity?: number;
  attributes?: Record<string, any>;
  is_featured?: boolean;
  image_url?: string;
  description?: string;
};

export type Fabric = {
  id: string;
  name: string;
  extra_price: number;
  image_url?: string;
  description?: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  category: 'femme' | 'homme' | 'sur_mesure' | 'artisanat';
  image_url: string;
  description?: string;
};

export type CartItem = {
  id: string;
  product_id: string;
  size?: string;
  color?: string;
  quantity: number;
  product?: Product;
};

export type Review = {
  id: string;
  order_id: string;
  rating: number;
  comment: string;
  is_published: boolean;
  created_at: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  shipping_address?: string;
};

export type PaymentInit = {
  payment_url: string;
  transaction_id: string;
};

export type UploadResult = {
  id: string;
  url: string;
  size_bytes: number;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Effectue une requête API avec gestion des erreurs
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Ajouter la clé API tenant si présente
  if (TENANT_API_KEY) {
    headers['X-API-Key'] = TENANT_API_KEY;
  }

  // Ajouter le JWT si présent (pour les routes protégées)
  const token = localStorage.getItem('abmcy_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Gestion des erreurs ABMCY
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: {
          code: 'unknown_error',
          message: `HTTP ${response.status}`,
        },
      }));

      throw new ABMCYApiError(
        errorData.error?.code || 'unknown_error',
        errorData.error?.message || 'Une erreur est survenue',
        response.status
      );
    }

    // Réponse vide (204)
    if (response.status === 204) {
      return {} as T;
    }

    // Réponse JSON
    return await response.json();
  } catch (error) {
    if (error instanceof ABMCYApiError) {
      throw error;
    }
    throw new ABMCYApiError('network_error', 'Erreur de connexion', 0);
  }
}

/**
 * Classe d'erreur personnalisée pour ABMCY
 */
export class ABMCYApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ABMCYApiError';
    this.code = code;
    this.status = status;
  }
}

// ============================================
// AUTHENTIFICATION
// ============================================

/**
 * Connexion personnel (JWT)
 * Utilisé par les membres de l'équipe HANI'S
 */
export async function loginPersonal(email: string, password: string): Promise<{ token: string }> {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      tenant_slug: TENANT_SLUG,
      email,
      password,
    }),
  });
}

/**
 * Déconnexion personnel
 */
export async function logoutPersonal(): Promise<void> {
  return apiRequest('/auth/logout', {
    method: 'POST',
  });
}

/**
 * Inscription client final
 */
export async function registerCustomer(phone: string, password: string): Promise<{ token: string }> {
  return apiRequest('/auth/customer/register', {
    method: 'POST',
    body: JSON.stringify({
      tenant_slug: TENANT_SLUG,
      phone,
      password,
    }),
  });
}

/**
 * Connexion client final
 */
export async function loginCustomer(phone: string, password: string): Promise<{ token: string }> {
  return apiRequest('/auth/customer/login', {
    method: 'POST',
    body: JSON.stringify({
      tenant_slug: TENANT_SLUG,
      phone,
      password,
    }),
  });
}

/**
 * Mot de passe oublié
 */
export async function forgotCustomerPassword(phone: string): Promise<void> {
  return apiRequest('/auth/customer/forgot-password', {
    method: 'POST',
    body: JSON.stringify({
      tenant_slug: TENANT_SLUG,
      phone,
    }),
  });
}

/**
 * Réinitialisation mot de passe
 */
export async function resetCustomerPassword(token: string, newPassword: string): Promise<void> {
  return apiRequest('/auth/customer/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      token,
      password: newPassword,
    }),
  });
}

/**
 * Déconnexion client
 */
export async function logoutCustomer(): Promise<void> {
  return apiRequest('/auth/customer/logout', {
    method: 'POST',
  });
}

/**
 * Profil client
 */
export async function getCustomerProfile(): Promise<Customer> {
  return apiRequest('/auth/customer/me');
}

/**
 * Mise à jour profil client
 */
export async function updateCustomerProfile(data: Partial<Customer>): Promise<Customer> {
  return apiRequest('/auth/customer/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ============================================
// COMMANDES
// ============================================

/**
 * Créer une commande standard
 */
export async function createOrder(data: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  total_amount: number;
  measurements?: Record<string, number>;
  shipping_address?: string;
  notes?: string;
}): Promise<Order> {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Créer une commande sur-mesure
 */
export async function createCustomOrder(data: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: string;
  total_amount: number;
  measurements: Record<string, number>;
  fabric_id?: string;
  fabric_source?: 'maison' | 'envoi_photo' | 'conseil_atelier';
  notes?: string;
}): Promise<CustomOrder> {
  return apiRequest('/custom-orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Lister toutes les commandes
 */
export async function listOrders(): Promise<Order[]> {
  return apiRequest('/orders');
}

/**
 * Consulter une commande
 */
export async function getOrder(orderId: string): Promise<Order> {
  return apiRequest(`/orders/${orderId}`);
}

/**
 * Historique d'une commande
 */
export async function getOrderHistory(orderId: string): Promise<any[]> {
  return apiRequest(`/orders/${orderId}/history`);
}

/**
 * Modifier une commande (seulement si pending ou confirmed)
 */
export async function updateOrder(orderId: string, data: Partial<Order>): Promise<Order> {
  return apiRequest(`/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ============================================
// MESURES
// ============================================

/**
 * Enregistrer des mesures
 */
export async function createMeasurements(data: {
  customer_name: string;
  customer_phone: string;
  gender: 'femme' | 'homme';
  values: Record<string, number>;
}): Promise<Measurement> {
  return apiRequest('/measurements', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============================================
// UPLOAD D'IMAGES
// ============================================

/**
 * Upload une image
 * Max 25 Mo, quota 5 Go par tenant
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('image', file);

  const url = `${API_BASE_URL}/uploads/image`;
  const headers: HeadersInit = {};

  if (TENANT_API_KEY) {
    headers['X-API-Key'] = TENANT_API_KEY;
  }

  const token = localStorage.getItem('abmcy_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: {
        code: 'unknown_error',
        message: `HTTP ${response.status}`,
      },
    }));

    throw new ABMCYApiError(
      errorData.error?.code || 'unknown_error',
      errorData.error?.message || 'Upload failed',
      response.status
    );
  }

  return response.json();
}

// ============================================
// PAIEMENTS
// ============================================

/**
 * Initialiser un paiement
 * Redirige vers CinetPay (Wave, Orange Money, MTN MoMo, carte)
 */
export async function initPayment(data: {
  order_id: string;
  amount: number;
  customer_name: string;
  customer_phone: string;
  return_url: string;
}): Promise<PaymentInit> {
  return apiRequest('/payments/init', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============================================
// NOTIFICATIONS EMAIL
// ============================================

/**
 * Envoyer un email
 * Quota : 100 emails/jour par tenant
 */
export async function sendEmail(data: {
  to: string;
  subject: string;
  html: string;
  template?: string;
}): Promise<void> {
  return apiRequest('/notifications/email', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============================================
// CATALOGUE
// ============================================

/**
 * Vérifier si le catalogue est activé
 */
export async function getFeatures(): Promise<{ catalog_enabled: boolean }> {
  return apiRequest('/features');
}

// --- PRODUITS ---

/**
 * Créer un produit
 */
export async function createProduct(data: {
  name: string;
  price: number;
  category: string;
  sku?: string;
  stock_quantity?: number;
  attributes?: Record<string, any>;
  is_featured?: boolean;
  image_url?: string;
  description?: string;
}): Promise<Product> {
  return apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Lister les produits
 */
export async function listProducts(params?: {
  category?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'featured';
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.category) query.append('category', params.category);
  if (params?.sort) query.append('sort', params.sort);

  const queryString = query.toString();
  return apiRequest(`/products${queryString ? `?${queryString}` : ''}`);
}

/**
 * Consulter un produit
 */
export async function getProduct(productId: string): Promise<Product> {
  return apiRequest(`/products/${productId}`);
}

// --- TISSUS ---

/**
 * Lister les tissus
 */
export async function listFabrics(): Promise<Fabric[]> {
  return apiRequest('/fabrics');
}

/**
 * Créer un tissu
 */
export async function createFabric(data: {
  name: string;
  extra_price: number;
  image_url?: string;
  description?: string;
}): Promise<Fabric> {
  return apiRequest('/fabrics', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Upload photo de tissu (client)
 */
export async function uploadFabricPhoto(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('image', file);

  const url = `${API_BASE_URL}/fabrics/upload`;
  const headers: HeadersInit = {};

  if (TENANT_API_KEY) {
    headers['X-API-Key'] = TENANT_API_KEY;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: {
        code: 'unknown_error',
        message: `HTTP ${response.status}`,
      },
    }));

    throw new ABMCYApiError(
      errorData.error?.code || 'unknown_error',
      errorData.error?.message || 'Upload failed',
      response.status
    );
  }

  return response.json();
}

// --- GALERIE ---

/**
 * Lister la galerie
 */
export async function listGallery(params?: {
  category?: 'femme' | 'homme' | 'sur_mesure' | 'artisanat';
}): Promise<GalleryItem[]> {
  const query = new URLSearchParams();
  if (params?.category) query.append('category', params.category);

  const queryString = query.toString();
  return apiRequest(`/gallery${queryString ? `?${queryString}` : ''}`);
}

// --- PANIER ---

/**
 * Ajouter au panier
 */
export async function addToCart(data: {
  product_id: string;
  size?: string;
  color?: string;
  quantity: number;
  cart_token?: string;
}): Promise<CartItem> {
  return apiRequest('/cart', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Consulter le panier
 */
export async function getCart(cartToken: string): Promise<CartItem[]> {
  return apiRequest(`/cart?cart_token=${cartToken}`);
}

/**
 * Supprimer un article du panier
 */
export async function removeFromCart(itemId: string, cartToken: string): Promise<void> {
  return apiRequest(`/cart/${itemId}?cart_token=${cartToken}`, {
    method: 'DELETE',
  });
}

// --- AVIS ---

/**
 * Créer un avis (non publié par défaut)
 */
export async function createReview(data: {
  order_id: string;
  rating: number;
  comment: string;
}): Promise<Review> {
  return apiRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Lister les avis en attente de modération
 */
export async function listPendingReviews(): Promise<Review[]> {
  return apiRequest('/reviews/pending');
}

/**
 * Publier un avis
 */
export async function publishReview(reviewId: string): Promise<void> {
  return apiRequest(`/reviews/${reviewId}/publish`, {
    method: 'POST',
  });
}

// ============================================
// GESTION DE L'ÉQUIPE
// ============================================

/**
 * Lister l'équipe (JWT personnel requis)
 */
export async function listStaff(): Promise<any[]> {
  return apiRequest('/staff');
}

/**
 * Ajouter un membre d'équipe (owner uniquement)
 */
export async function createStaff(data: {
  email: string;
  password: string;
  role: 'staff' | 'admin';
}): Promise<any> {
  return apiRequest('/staff', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Activer/désactiver un membre (owner uniquement)
 */
export async function updateStaffActive(userId: string, isActive: boolean): Promise<void> {
  return apiRequest(`/staff/${userId}/active`, {
    method: 'PUT',
    body: JSON.stringify({ is_active: isActive }),
  });
}

// ============================================
// UTILITAIRES
// ============================================

/**
 * Stocker le token JWT
 */
export function setToken(token: string): void {
  localStorage.setItem('abmcy_token', token);
}

/**
 * Récupérer le token JWT
 */
export function getToken(): string | null {
  return localStorage.getItem('abmcy_token');
}

/**
 * Supprimer le token JWT
 */
export function clearToken(): void {
  localStorage.removeItem('abmcy_token');
}

/**
 * Vérifier si l'utilisateur est connecté
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Formater un montant en FCFA
 */
export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} F`;
}

/**
 * Formater une date
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
