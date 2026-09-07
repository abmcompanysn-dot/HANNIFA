# 📦 RÉSUMÉ - Service de stockage HANI'S

## ✅ Ce qui a été construit

### Structure complète du backend

```
backend/
├── 📄 server.js                          # Point d'entrée principal
├── 📄 package.json                       # Dépendances et scripts
├── 📄 .env                               # Configuration (démo)
├── 📄 .env.example                       # Template de configuration
├── 📄 .gitignore                         # Fichiers à ignorer
├── 📄 Dockerfile                         # Configuration Docker
├── 📄 docker-compose.yml                 # Docker Compose
├── 📄 README.md                          # Documentation complète
├── 📄 QUICKSTART.md                      # Guide de démarrage rapide
│
├── 📁 src/
│   ├── 📁 routes/
│   │   └── 📄 upload.js                  # 4 endpoints d'upload
│   │
│   ├── 📁 middleware/
│   │   ├── 📄 validation.js              # Validation des fichiers
│   │   ├── 📄 auth.js                    # Authentification (admin/client)
│   │   └── 📄 errorHandler.js            # Gestion des erreurs
│   │
│   ├── 📁 services/
│   │   └── 📄 storage.js                 # Service de stockage abstrait
│   │
│   ├── 📁 providers/
│   │   ├── 📄 local.js                   # Stockage local (dev)
│   │   ├── 📄 supabase.js                # Stockage Supabase
│   │   └── 📄 cloudinary.js              # Stockage Cloudinary
│   │
│   └── 📁 utils/
│       ├── 📄 optimizer.js               # Optimisation d'images (Sharp)
│       └── 📄 security.js                # Sécurité (sanitization, hash)
│
├── 📁 examples/
│   └── 📄 frontend-integration.js        # Exemple d'intégration React
│
└── 📁 test/
    └── 📄 upload.test.js                 # Tests automatisés
```

---

## 🎯 Les 4 endpoints d'upload

### 1. POST /api/upload/product-image
**Usage** : Admin upload une photo produit
- Authentification : Clé API admin
- Génère automatiquement : image principale + thumbnail + medium
- Optimisation : WebP, redimensionnement 1200x1600

### 2. POST /api/upload/fabric
**Usage** : Client upload une photo de son tissu
- Authentification : Optionnelle
- Optimisation légère : qualité 90% pour voir le tissu
- Stockage sécurisé avec référence au client

### 3. POST /api/upload/gallery
**Usage** : Admin upload une photo de réalisation
- Authentification : Clé API admin
- Catégorisation : Femme, Homme, Sur mesure, Artisanat
- Génère automatiquement : image + thumbnail

### 4. POST /api/upload/review-photo
**Usage** : Client upload une photo avec son avis
- Authentification : JWT client requis
- Statut "pending" pour modération
- Optimisation : qualité 85%

---

## 🚀 Comment démarrer

### Option 1 : Démarrage local (recommandé pour le développement)

```bash
cd backend

# Installer les dépendances
npm install

# Lancer le serveur
npm run dev
```

Le service tourne sur `http://localhost:3001` ✅

### Option 2 : Docker

```bash
cd backend

# Build et lancer
docker-compose up -d
```

### Option 3 : Production

```bash
cd backend

# Installer les dépendances
npm install

# Lancer en production
npm start
```

---

## 🧪 Tester le service

### Test manuel avec curl

```bash
# Upload d'une photo produit
curl -X POST http://localhost:3001/api/upload/product-image \
  -H "x-admin-api-key: hanis-demo-key-2026-change-me" \
  -F "file=@test.jpg" \
  -F "productId=test-123" \
  -F "variant=main"
```

### Test automatisé

```bash
# Installer les dépendances de test
npm install node-fetch form-data

# Lancer les tests
node test/upload.test.js
```

---

## 🔧 Configuration

### Variables d'environnement (.env)

```env
# Port du serveur
PORT=3001

# Provider de stockage (local | supabase | cloudinary)
STORAGE_PROVIDER=local

# Clé API admin (CHANGEZ EN PRODUCTION !)
ADMIN_API_KEY=hanis-demo-key-2026-change-me

# Configuration Supabase (optionnel)
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_BUCKET=hanis-images

# Configuration Cloudinary (optionnel)
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret
```

---

## 💾 Providers de stockage

### 1. Local (développement)
- Stocke sur le disque du serveur
- Gratuit, simple
- Pas de CDN

### 2. Supabase Storage (recommandé)
- Intégré avec la base de données
- CDN mondial
- Gratuit jusqu'à 1GB

### 3. Cloudinary
- Optimisation automatique
- Transformations à la volée
- Payant au-delà de 25GB

---

## 🔒 Sécurité

✅ Validation des types MIME (anti-spoofing)
✅ Taille max : 5MB
✅ Dimensions max : 4096x4096
✅ Sanitization des noms de fichiers
✅ Rate limiting : 100 requêtes / 15 min
✅ Authentification admin (clé API)
✅ Authentification client (JWT)
✅ CORS configuré
✅ Helmet (headers de sécurité)

---

## 🎨 Optimisation

✅ Conversion automatique en WebP (-25-35% taille)
✅ Redimensionnement adaptatif
✅ Génération de thumbnails
✅ Qualité adaptative (70-90%)
✅ Sharp (4-5x plus rapide que ImageMagick)

---

## 📡 Intégration frontend

### Ajouter dans le frontend (React/Vite)

```javascript
// .env du frontend
VITE_API_URL=http://localhost:3001/api
VITE_ADMIN_API_KEY=hanis-demo-key-2026-change-me
```

### Exemple d'utilisation

```javascript
import { uploadProductImage } from './services/upload';

const handleUpload = async (file) => {
  const result = await uploadProductImage(file, 'product-123', 'main');
  console.log('Image URL:', result.url);
};
```

---

## 📊 Cas d'usage HANI'S

### ✅ Upload photo produit
- Admin ajoute une nouvelle robe
- 3 photos générées : principale, thumbnail, medium
- Optimisée pour le web (WebP)

### ✅ Upload tissu client
- Client envoie une photo de son tissu
- Qualité élevée pour voir les détails
- Associé à la commande sur mesure

### ✅ Upload galerie
- Admin ajoute une création terminée
- Catégorisée (Femme, Homme, etc.)
- Thumbnail pour la mosaïque

### ✅ Upload avis client
- Client partage une photo portée
- En attente de modération
- Affichée après validation

---

## 📚 Documentation

- **README.md** : Documentation complète
- **QUICKSTART.md** : Guide de démarrage rapide
- **examples/frontend-integration.js** : Exemple d'intégration React

---

## 🆘 Support

- Email : salam@hanis.sn
- WhatsApp : +221 77 812 34 56

---

## ✅ Checklist de déploiement

- [ ] Changer la clé API admin
- [ ] Configurer le provider de stockage (Supabase recommandé)
- [ ] Configurer CORS (FRONTEND_URL)
- [ ] Tester tous les endpoints
- [ ] Déployer sur Vercel/Railway/AWS
- [ ] Configurer les variables d'environnement en production
- [ ] Activer HTTPS
- [ ] Configurer le monitoring

---

**Service prêt à l'emploi ! 🎉**
