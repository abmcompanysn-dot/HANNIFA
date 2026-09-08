# 🚀 Intégration ABMCY Core pour HANI'S

## ✅ Ce qui a été construit

Le site HANI'S est maintenant connecté à **ABMCY Core** — une plateforme multi-tenant qui fournit tous les services backend nécessaires :

- ✅ Authentification (clé API tenant, JWT personnel, JWT client)
- ✅ Commandes (standard et sur-mesure)
- ✅ Mesures sur-mesure
- ✅ Upload d'images (25 Mo max, 5 Go quota)
- ✅ Paiements (CinetPay : Wave, Orange Money, MTN MoMo, carte)
- ✅ Notifications email (100 emails/jour)
- ✅ Catalogue (produits, tissus, galerie, panier, avis)
- ✅ Comptes clients finaux
- ✅ Gestion d'équipe

---

## 📦 Service API ABMCY

Le service API est situé dans `src/services/abmcy.ts` et encapsule tous les appels à l'API ABMCY.

### Configuration

Créer un fichier `.env` à la racine du projet :

```env
VITE_ABMCY_API_URL=https://api.abmcy.com
VITE_ABMCY_API_KEY=pk_live_votre_cle_ici
VITE_ABMCY_TENANT_SLUG=hanis
```

**Où trouver votre clé API ?**
- Connectez-vous à votre dashboard ABMCY
- Section "Paramètres" → "Clé API"
- Copiez la clé `pk_live_...`

---

## 🔑 Authentification

### 1. Clé API Tenant (recommandé pour le site)

Utilisée automatiquement par le service API pour toutes les requêtes.

```typescript
import { listOrders } from './services/abmcy';

// La clé API est ajoutée automatiquement via X-API-Key
const orders = await listOrders();
```

### 2. JWT Personnel (membres de l'équipe)

Pour les membres de l'équipe HANI'S (couturières, administrateurs).

```typescript
import { loginPersonal, setToken } from './services/abmcy';

// Connexion
const { token } = await loginPersonal('contact@hanis.sn', 'motdepasse');
setToken(token);

// Déconnexion
import { logoutPersonal, clearToken } from './services/abmcy';
await logoutPersonal();
clearToken();
```

### 3. JWT Client Final (acheteurs)

Pour les clients qui veulent suivre leurs commandes.

```typescript
import { registerCustomer, loginCustomer, setToken } from './services/abmcy';

// Inscription
const { token } = await registerCustomer('+221771234567', 'motdepasse123');
setToken(token);

// Connexion
const { token } = await loginCustomer('+221771234567', 'motdepasse123');
setToken(token);
```

---

## 📦 Commandes

### Créer une commande standard

```typescript
import { createOrder } from './services/abmcy';

const order = await createOrder({
  customer_name: 'Fatou Diop',
  customer_phone: '+221771234567',
  customer_email: 'fatou@example.com',
  total_amount: 25000,
  measurements: { poitrine: 92, taille: 80 },
  shipping_address: 'Dakar, Sénégal',
  notes: 'Livraison urgente',
});

console.log(order.order_number); // "ORD-123456789"
```

### Créer une commande sur-mesure

```typescript
import { createCustomOrder } from './services/abmcy';

const order = await createCustomOrder({
  customer_name: 'Fatou Diop',
  customer_phone: '+221771234567',
  shipping_address: 'Dakar, Sénégal',
  total_amount: 45000,
  measurements: { poitrine: 92, hanches: 98 },
  fabric_id: 'uuid-du-tissu',
  fabric_source: 'maison', // ou 'envoi_photo' ou 'conseil_atelier'
  notes: 'Manches longues souhaitées',
});
```

### Lister les commandes

```typescript
import { listOrders } from './services/abmcy';

const orders = await listOrders();
```

### Consulter une commande

```typescript
import { getOrder, getOrderHistory } from './services/abmcy';

const order = await getOrder('uuid-de-la-commande');
const history = await getOrderHistory('uuid-de-la-commande');
```

### Modifier une commande

```typescript
import { updateOrder } from './services/abmcy';

// Seulement si status = 'pending' ou 'confirmed'
const updated = await updateOrder('uuid-de-la-commande', {
  shipping_address: 'Nouvelle adresse',
  notes: 'Nouvelles notes',
});
```

---

## 📏 Mesures sur-mesure

```typescript
import { createMeasurements } from './services/abmcy';

const measurement = await createMeasurements({
  customer_name: 'Fatou Diop',
  customer_phone: '+221771234567',
  gender: 'femme',
  values: {
    poitrine: 92,
    taille: 80,
    hanches: 98,
    epaules: 40,
    manches: 58,
    longueur: 110,
  },
});
```

---

## 🖼️ Upload d'images

```typescript
import { uploadImage } from './services/abmcy';

// Upload une image (max 25 Mo)
const file = document.querySelector('input[type=file]').files[0];
const result = await uploadImage(file);

console.log(result.url); // "https://..."
console.log(result.size_bytes); // 245678
```

**Quota** : 5 Go par tenant (par défaut)

---

## 💳 Paiements

```typescript
import { initPayment } from './services/abmcy';

const { payment_url } = await initPayment({
  order_id: 'uuid-de-la-commande',
  amount: 25000,
  customer_name: 'Fatou Diop',
  customer_phone: '+221771234567',
  return_url: 'https://hanis.sn/merci',
});

// Rediriger le client vers payment_url
window.location.href = payment_url;
```

**Moyens de paiement supportés** :
- Wave
- Orange Money
- MTN MoMo
- Carte bancaire (Visa, Mastercard)

Une fois le paiement confirmé, la commande passe automatiquement à `paid`.

---

## 📧 Notifications email

```typescript
import { sendEmail } from './services/abmcy';

await sendEmail({
  to: 'client@example.com',
  subject: 'Votre commande est prête',
  html: '<p>Bonjour Fatou, votre commande est prête à être retirée.</p>',
  template: 'order_ready',
});
```

**Quota** : 100 emails/jour par tenant (remis à zéro à minuit)

---

## 🛍️ Catalogue

### Vérifier si le catalogue est activé

```typescript
import { getFeatures } from './services/abmcy';

const { catalog_enabled } = await getFeatures();

if (!catalog_enabled) {
  console.log('Catalogue non activé pour ce compte');
}
```

### Produits

```typescript
import { createProduct, listProducts, getProduct } from './services/abmcy';

// Créer un produit
const product = await createProduct({
  name: 'Robe wax',
  price: 35000,
  category: 'robes',
  sku: 'ROB-001',
  stock_quantity: 5,
  attributes: {
    tailles: ['S', 'M', 'L'],
    couleurs: ['Bleu nuit', 'Terracotta'],
  },
  is_featured: true,
  image_url: 'https://...',
  description: 'Robe en wax hollandais',
});

// Lister les produits
const products = await listProducts({
  category: 'robes',
  sort: 'price_asc', // ou 'price_desc', 'newest', 'featured'
});

// Consulter un produit
const product = await getProduct('uuid-du-produit');
```

### Tissus

```typescript
import { listFabrics, createFabric, uploadFabricPhoto } from './services/abmcy';

// Lister les tissus
const fabrics = await listFabrics();

// Créer un tissu
const fabric = await createFabric({
  name: 'Wax hollandais',
  extra_price: 5000,
  image_url: 'https://...',
  description: 'Tissu wax de qualité supérieure',
});

// Upload photo de tissu (client)
const file = document.querySelector('input[type=file]').files[0];
const result = await uploadFabricPhoto(file);
```

### Galerie

```typescript
import { listGallery } from './services/abmcy';

const gallery = await listGallery({
  category: 'femme', // ou 'homme', 'sur_mesure', 'artisanat'
});
```

### Panier

```typescript
import { addToCart, getCart, removeFromCart } from './services/abmcy';

// Ajouter au panier
const item = await addToCart({
  product_id: 'uuid-du-produit',
  size: 'M',
  color: 'Bleu',
  quantity: 1,
  cart_token: 'token-du-panier', // optionnel, généré automatiquement
});

// Consulter le panier
const cart = await getCart('token-du-panier');

// Supprimer un article
await removeFromCart('uuid-de-l-article', 'token-du-panier');
```

### Avis

```typescript
import { createReview, listPendingReviews, publishReview } from './services/abmcy';

// Créer un avis (non publié par défaut)
const review = await createReview({
  order_id: 'uuid-de-la-commande',
  rating: 5,
  comment: 'Très satisfaite de ma commande !',
});

// Lister les avis en attente de modération
const pendingReviews = await listPendingReviews();

// Publier un avis
await publishReview('uuid-de-l-avis');
```

---

## 👥 Comptes clients finaux

```typescript
import {
  registerCustomer,
  loginCustomer,
  forgotCustomerPassword,
  resetCustomerPassword,
  getCustomerProfile,
  updateCustomerProfile,
  logoutCustomer,
  setToken,
  clearToken,
} from './services/abmcy';

// Inscription
const { token } = await registerCustomer('+221771234567', 'motdepasse123');
setToken(token);

// Connexion
const { token } = await loginCustomer('+221771234567', 'motdepasse123');
setToken(token);

// Mot de passe oublié
await forgotCustomerPassword('+221771234567');

// Réinitialisation mot de passe
await resetCustomerPassword('token-de-reset', 'nouveau-motdepasse');

// Profil client
const profile = await getCustomerProfile();

// Mise à jour profil
const updated = await updateCustomerProfile({
  name: 'Fatou Diop',
  shipping_address: 'Dakar, Sénégal',
});

// Déconnexion
await logoutCustomer();
clearToken();
```

---

## 👨‍💼 Gestion de l'équipe

**Note** : Requiert un JWT personnel (pas une clé API)

```typescript
import { listStaff, createStaff, updateStaffActive } from './services/abmcy';

// Lister l'équipe
const staff = await listStaff();

// Ajouter un membre (owner uniquement)
const newStaff = await createStaff({
  email: 'couturiere@hanis.sn',
  password: 'motdepasse',
  role: 'staff', // ou 'admin'
});

// Activer/désactiver un membre (owner uniquement)
await updateStaffActive('uuid-du-membre', false);
```

---

## ⚠️ Codes d'erreur

Toutes les erreurs suivent le format :

```json
{
  "error": {
    "code": "validation_error",
    "message": "Données invalides."
  }
}
```

### Codes d'erreur courants

| Code | HTTP | Signification |
|------|------|---------------|
| `missing_api_key` | 401 | Aucune clé API fournie |
| `invalid_api_key` | 403 | Clé invalide ou compte désactivé |
| `unauthorized` | 401 | Identifiants invalides |
| `forbidden` | 403 | Droits insuffisants |
| `not_found` | 404 | Ressource introuvable |
| `validation_error` | 422 | Données invalides ou incomplètes |
| `order_not_editable` | 409 | Commande plus modifiable |
| `file_too_large` | 413 | Fichier > 25 Mo |
| `storage_quota_exceeded` | 413 | Quota de stockage dépassé |
| `email_quota_exceeded` | 429 | Quota de 100 emails/jour dépassé |
| `rate_limited` | 429 | Trop de requêtes |

### Gestion des erreurs

```typescript
import { ABMCYApiError } from './services/abmcy';

try {
  const order = await createOrder({ ... });
} catch (error) {
  if (error instanceof ABMCYApiError) {
    console.error(`Erreur ${error.code}: ${error.message}`);
    
    if (error.code === 'validation_error') {
      // Afficher les erreurs de validation
    } else if (error.code === 'order_not_editable') {
      // Informer l'utilisateur que la commande ne peut plus être modifiée
    }
  }
}
```

---

## 🧪 Tests

### Tester la connexion API

```typescript
import { listOrders } from './services/abmcy';

try {
  const orders = await listOrders();
  console.log('✅ Connexion API réussie');
  console.log(`${orders.length} commandes trouvées`);
} catch (error) {
  console.error('❌ Erreur de connexion:', error.message);
}
```

### Tester un upload

```typescript
import { uploadImage } from './services/abmcy';

const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
const result = await uploadImage(file);
console.log('✅ Upload réussi:', result.url);
```

---

## 📚 Documentation complète

- **API ABMCY** : https://api.abmcy.com
- **Dashboard** : https://dashboard.abmcy.com
- **Support** : support@abmcy.com

---

## 🆘 Support

- Email : salam@hanis.sn
- WhatsApp : +221 77 812 34 56

---

**Intégration ABMCY terminée ! 🎉**
