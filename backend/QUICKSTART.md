# 🚀 Guide de démarrage rapide - HANI'S Storage Service

## ⚡ Démarrage en 5 minutes

### 1. Installation

```bash
cd backend
npm install
```

### 2. Configuration

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos paramètres
nano .env
```

**Configuration minimale** :
```env
PORT=3001
STORAGE_PROVIDER=local
ADMIN_API_KEY=hanis-secret-key-2026
```

### 3. Lancer le serveur

```bash
npm run dev
```

Le service tourne sur `http://localhost:3001` ✅

---

## 🧪 Tester les endpoints

### Test 1 : Upload d'une photo produit (admin)

```bash
# Créer une image test
echo "test" > test.jpg

# Upload
curl -X POST http://localhost:3001/api/upload/product-image \
  -H "x-admin-api-key: hanis-secret-key-2026" \
  -F "file=@test.jpg" \
  -F "productId=test-123" \
  -F "variant=main"
```

**Réponse attendue** :
```json
{
  "success": true,
  "data": {
    "url": "http://localhost:3001/uploads/products/...",
    "publicId": "products/...",
    "width": 1200,
    "height": 1600,
    "size": 245678,
    "format": "webp",
    "variants": {
      "thumbnail": "...",
      "medium": "..."
    }
  }
}
```

### Test 2 : Upload d'un tissu (client)

```bash
curl -X POST http://localhost:3001/api/upload/fabric \
  -F "file=@test.jpg" \
  -F "orderId=order-456" \
  -F "notes=Tissu en soie"
```

### Test 3 : Upload d'une photo galerie (admin)

```bash
curl -X POST http://localhost:3001/api/upload/gallery \
  -H "x-admin-api-key: hanis-secret-key-2026" \
  -F "file=@test.jpg" \
  -F "title=Robe Awa" \
  -F "category=Femme" \
  -F "description=Création sur mesure"
```

### Test 4 : Upload d'une photo d'avis (client)

```bash
curl -X POST http://localhost:3001/api/upload/review-photo \
  -F "file=@test.jpg" \
  -F "reviewId=review-789" \
  -F "productId=product-123"
```

---

## 🔧 Configuration avancée

### Utiliser Supabase Storage

1. Créer un projet sur [Supabase](https://supabase.com)
2. Créer un bucket "hanis-images"
3. Configurer `.env` :

```env
STORAGE_PROVIDER=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_BUCKET=hanis-images
```

### Utiliser Cloudinary

1. Créer un compte sur [Cloudinary](https://cloudinary.com)
2. Récupérer les credentials
3. Configurer `.env` :

```env
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 🐳 Docker

### Lancer avec Docker

```bash
# Build
docker build -t hanis-storage .

# Run
docker run -p 3001:3001 --env-file .env hanis-storage
```

### Lancer avec Docker Compose

```bash
docker-compose up -d
```

---

## 📝 Intégration frontend

### Ajouter les variables d'environnement

Dans le projet frontend (React/Vite), créer `.env` :

```env
VITE_API_URL=http://localhost:3001/api
VITE_ADMIN_API_KEY=hanis-secret-key-2026
```

### Exemple d'utilisation

```javascript
import { uploadProductImage } from './services/upload';

const handleUpload = async (file) => {
  try {
    const result = await uploadProductImage(file, 'product-123', 'main');
    console.log('Image URL:', result.url);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};
```

---

## 🔒 Sécurité

### Changer la clé API admin

```env
# Générer une clé aléatoire
ADMIN_API_KEY=$(openssl rand -hex 32)
```

### Configurer CORS

Dans `.env` :

```env
FRONTEND_URL=https://hanis.sn
```

### Activer le rate limiting

Déjà configuré par défaut : 100 requêtes par 15 minutes.

---

## 📊 Monitoring

### Voir les logs

```bash
# Logs en temps réel
tail -f logs/app.log

# Ou avec Docker
docker logs -f hanis-storage
```

### Statistiques

```bash
# Nombre de fichiers uploadés
ls -1 uploads/products | wc -l
ls -1 uploads/fabric | wc -l
ls -1 uploads/gallery | wc -l
ls -1 uploads/reviews | wc -l

# Taille totale
du -sh uploads/
```

---

## 🚢 Déploiement

### Vercel

```bash
npm i -g vercel
vercel
```

### Railway

```bash
npm i -g @railway/cli
railway up
```

### AWS EC2

```bash
# SSH vers le serveur
ssh ubuntu@your-server

# Cloner le repo
git clone https://github.com/hanis/storage-service.git
cd storage-service/backend

# Installer et lancer
npm install
npm start
```

---

## ❓ Dépannage

### Erreur : "Cannot find module 'sharp'"

```bash
# Installer sharp
npm install sharp

# Ou avec Docker
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Erreur : "EACCES: permission denied"

```bash
# Donner les permissions au dossier uploads
chmod -R 755 uploads/
chown -R $USER:$USER uploads/
```

### Erreur : "Port 3001 already in use"

```bash
# Changer le port dans .env
PORT=3002
```

---

## 📚 Documentation complète

Voir [README.md](./README.md) pour la documentation complète.

---

## 🆘 Support

- Email : salam@hanis.sn
- WhatsApp : +221 77 812 34 56

---

**Prêt à utiliser ! 🎉**
