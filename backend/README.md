# HANI'S Storage Service

Service de stockage et upload d'images pour HANI'S - Maison de couture

## 📋 Vue d'ensemble

Ce service gère tous les uploads d'images pour le site HANI'S :
- Photos produits (admin)
- Tissus envoyés par les clients (client)
- Galerie de réalisations (admin)
- Photos d'avis clients (client)

## 🚀 Démarrage rapide

### 1. Installation

```bash
cd backend
npm install
```

### 2. Configuration

Copier `.env.example` vers `.env` et configurer :

```bash
cp .env.example .env
```

Éditer `.env` avec vos paramètres :

```env
# Port du serveur
PORT=3001

# Provider de stockage (local | supabase | cloudinary)
STORAGE_PROVIDER=local

# Clé API admin (pour upload produit/galerie)
ADMIN_API_KEY=your-secret-admin-api-key
```

### 3. Lancer le serveur

```bash
# Développement (avec hot reload)
npm run dev

# Production
npm start
```

Le service tourne sur `http://localhost:3001`

## 📡 Endpoints API

### 1. POST /api/upload/product-image

**Usage** : Admin upload une photo produit

**Authentification** : Clé API admin (header: `x-admin-api-key`)

**Paramètres** :
- `file` : image (JPEG, PNG, WebP) - max 5MB
- `productId` : UUID du produit (optionnel)
- `variant` : 'main' | 'detail' | 'silhouette' (optionnel)

**Exemple** :
```bash
curl -X POST http://localhost:3001/api/upload/product-image \
  -H "x-admin-api-key: your-secret-key" \
  -F "file=@robe.jpg" \
  -F "productId=abc-123" \
  -F "variant=main"
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "url": "http://localhost:3001/uploads/products/abc-123.webp",
    "publicId": "products/abc-123.webp",
    "width": 1200,
    "height": 1600,
    "size": 245678,
    "format": "webp",
    "variants": {
      "thumbnail": "http://localhost:3001/uploads/products/thumbnails/thumb-abc-123.webp",
      "medium": "http://localhost:3001/uploads/products/medium/medium-abc-123.webp"
    }
  }
}
```

**Use cases HANI'S** :
- Upload photo principale d'un nouveau modèle
- Upload photos supplémentaires (détails, porté)
- Remplacement d'une photo existante

---

### 2. POST /api/upload/fabric

**Usage** : Client upload une photo de son tissu

**Authentification** : Optionnelle (JWT ou anonyme)

**Paramètres** :
- `file` : image (JPEG, PNG, WebP) - max 5MB
- `orderId` : UUID de la commande (optionnel)
- `notes` : commentaire sur le tissu (optionnel)

**Exemple** :
```bash
curl -X POST http://localhost:3001/api/upload/fabric \
  -F "file=@tissu.jpg" \
  -F "orderId=order-456" \
  -F "notes=Tissu en soie acheté à Marseille"
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "url": "http://localhost:3001/uploads/fabric/xyz-789.webp",
    "publicId": "fabric/xyz-789.webp",
    "size": 1234567,
    "format": "webp"
  }
}
```

**Use cases HANI'S** :
- Client envoie une photo d'un tissu qu'il possède
- Client montre un tissu vu ailleurs qu'il souhaite reproduire
- Upload de référence pour commande sur mesure

---

### 3. POST /api/upload/gallery

**Usage** : Admin upload une photo de réalisation

**Authentification** : Clé API admin (header: `x-admin-api-key`)

**Paramètres** :
- `file` : image (JPEG, PNG, WebP) - max 5MB
- `title` : titre de la réalisation (requis)
- `category` : 'Femme' | 'Homme' | 'Sur mesure' | 'Artisanat' (requis)
- `description` : description (optionnel)
- `tags` : tags séparés par virgules (optionnel)

**Exemple** :
```bash
curl -X POST http://localhost:3001/api/upload/gallery \
  -H "x-admin-api-key: your-secret-key" \
  -F "file=@realisation.jpg" \
  -F "title=Robe Awa terracotta" \
  -F "category=Femme" \
  -F "description=Création sur mesure pour cliente" \
  -F "tags=robe,terracotta,sur-mesure"
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "url": "http://localhost:3001/uploads/gallery/def-456.webp",
    "publicId": "gallery/def-456.webp",
    "title": "Robe Awa terracotta",
    "category": "Femme",
    "thumbnail": "http://localhost:3001/uploads/gallery/thumbnails/thumb-def-456.webp"
  }
}
```

**Use cases HANI'S** :
- Upload photo d'une création terminée
- Ajout à la galerie de réalisations
- Catégorisation par type (Femme, Homme, etc.)

---

### 4. POST /api/upload/review-photo

**Usage** : Client upload une photo avec son avis

**Authentification** : JWT client requis (header: `Authorization: Bearer <token>`)

**Paramètres** :
- `file` : image (JPEG, PNG, WebP) - max 5MB
- `reviewId` : UUID de l'avis (optionnel)
- `productId` : UUID du produit (optionnel)

**Exemple** :
```bash
curl -X POST http://localhost:3001/api/upload/review-photo \
  -H "Authorization: Bearer your-jwt-token" \
  -F "file=@photo-portee.jpg" \
  -F "reviewId=review-789" \
  -F "productId=product-123"
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "url": "http://localhost:3001/uploads/reviews/ghi-012.webp",
    "publicId": "reviews/ghi-012.webp",
    "status": "pending",
    "message": "Photo en attente de modération"
  }
}
```

**Use cases HANI'S** :
- Client partage une photo de sa tenue portée
- Ajout de photos à un avis produit
- Modération par l'atelier avant publication

---

### 5. DELETE /api/upload/:publicId

**Usage** : Supprimer une image

**Authentification** : Admin ou propriétaire du fichier

**Exemple** :
```bash
curl -X DELETE http://localhost:3001/api/upload/products/abc-123.webp
```

**Réponse** :
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

## 💾 Providers de stockage

### Local (développement)

Stocke les fichiers sur le disque du serveur.

**Configuration** :
```env
STORAGE_PROVIDER=local
LOCAL_UPLOAD_DIR=./uploads
LOCAL_BASE_URL=http://localhost:3001/uploads
```

**Avantages** :
- Simple à configurer
- Pas de dépendance externe
- Gratuit

**Inconvénients** :
- Pas de CDN
- Pas de redondance
- Limité à un seul serveur

---

### Supabase Storage (recommandé)

Stocke les fichiers dans Supabase Storage.

**Configuration** :
```env
STORAGE_PROVIDER=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_BUCKET=hanis-images
```

**Setup Supabase** :
1. Créer un bucket "hanis-images" dans Supabase Storage
2. Configurer les policies RLS :
   - Public read (tout le monde peut lire)
   - Authenticated write (seuls les utilisateurs authentifiés peuvent uploader)
3. Activer le CDN pour les images

**Avantages** :
- Intégré avec la base de données Supabase
- CDN mondial
- Authentification intégrée
- Gratuit jusqu'à 1GB

---

### Cloudinary

Stocke les fichiers dans Cloudinary.

**Configuration** :
```env
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Avantages** :
- Optimisation automatique (WebP, AVIF)
- Transformations à la volée
- CDN mondial
- Détection de visages, objets

**Inconvénients** :
- Payant au-delà de 25GB
- Dépendance à un service tiers

## 🔒 Sécurité

### Validations

1. **Type MIME** : Vérification du contenu réel (anti-spoofing)
2. **Taille max** : 5MB par fichier (configurable)
3. **Dimensions max** : 4096x4096 pixels (configurable)
4. **Extensions autorisées** : JPEG, PNG, WebP, GIF

### Authentification

1. **Admin** : Clé API dans le header (`x-admin-api-key`)
2. **Client** : JWT dans le header (`Authorization: Bearer <token>`)

### Protection

1. **Sanitization** : Noms de fichiers sécurisés (anti path traversal)
2. **Rate limiting** : 100 requêtes par 15 minutes
3. **CORS** : Restriction aux domaines autorisés
4. **Helmet** : Headers de sécurité HTTP

## 🎨 Optimisation

### Images

- **Redimensionnement** : Automatique selon le type d'upload
- **Conversion WebP** : Réduction de 25-35% de la taille
- **Qualité adaptative** : 70-90% selon le cas d'usage
- **Thumbnails** : Génération automatique pour les galeries

### Performance

- **Sharp** : 4-5x plus rapide que ImageMagick
- **Lazy loading** : Images chargées à la demande
- **CDN** : Distribution mondiale (Supabase/Cloudinary)
- **Cache** : Headers HTTP optimisés

## 📊 Monitoring

### Logs

```bash
# Voir les logs en temps réel
tail -f logs/app.log

# Logs structurés (JSON)
{
  "level": "info",
  "message": "Upload successful",
  "publicId": "products/abc-123.webp",
  "size": 245678,
  "duration": 123
}
```

### Métriques

- Nombre d'uploads par jour
- Taille totale stockée
- Temps moyen d'upload
- Taux d'erreur

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests avec couverture
npm run test:coverage
```

## 🚢 Déploiement

### Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Railway

```bash
# Installer Railway CLI
npm i -g @railway/cli

# Déployer
railway up
```

### Docker

```bash
# Build
docker build -t hanis-storage .

# Run
docker run -p 3001:3001 --env-file .env hanis-storage
```

## 🔗 Intégration frontend

### Exemple React

```javascript
const uploadProductImage = async (file, productId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('productId', productId);
  formData.append('variant', 'main');

  const response = await fetch('http://localhost:3001/api/upload/product-image', {
    method: 'POST',
    headers: {
      'x-admin-api-key': 'your-secret-key',
    },
    body: formData,
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Image URL:', data.data.url);
    return data.data.url;
  } else {
    throw new Error(data.error);
  }
};
```

## 📝 TODO

- [ ] Ajouter un antivirus scan (ClamAV)
- [ ] Implémenter la détection de doublons (hash)
- [ ] Ajouter un dashboard admin pour gérer les uploads
- [ ] Implémenter le retry automatique en cas d'erreur
- [ ] Ajouter des webhooks pour notifier les uploads
- [ ] Implémenter le versioning des images

## 📄 Licence

Propriétaire - HANI'S Maison de couture

## 👥 Contact

- Email : salam@hanis.sn
- WhatsApp : +221 77 812 34 56
- Site : https://hanis.sn

---

**Développé avec ❤️ pour HANI'S**
