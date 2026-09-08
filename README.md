# 🎉 HANI'S - Site web avec intégration ABMCY Core

Site e-commerce complet pour la maison de couture HANI'S, connecté à la plateforme **ABMCY Core** pour tous les services backend.

## ✨ Fonctionnalités

### Frontend (React + Vite + Tailwind)
- ✅ Page d'accueil élégante avec collections
- ✅ Boutique avec filtres (Femme/Homme, catégories)
- ✅ Fiches produits détaillées avec aperçu des couleurs
- ✅ Commande sur mesure en 4 étapes (coordonnées, mesures, tissu, récapitulatif)
- ✅ Galerie de réalisations avec lightbox
- ✅ Espace client avec suivi de commandes
- ✅ Panier avec gestion des quantités
- ✅ Paiement intégré (Wave, Orange Money, Free Money, carte bancaire)
- ✅ Design responsive mobile-first
- ✅ Animations et transitions fluides

### Backend (ABMCY Core)
- ✅ Authentification multi-niveaux (clé API, JWT personnel, JWT client)
- ✅ Gestion des commandes (standard et sur-mesure)
- ✅ Mesures sur-mesure (6 mesures femme, 7 mesures homme)
- ✅ Upload d'images (25 Mo max, 5 Go quota)
- ✅ Paiements via CinetPay (Wave, Orange Money, MTN MoMo, carte)
- ✅ Notifications email (100 emails/jour)
- ✅ Catalogue produits, tissus, galerie
- ✅ Panier côté serveur
- ✅ Avis clients avec modération
- ✅ Comptes clients finaux
- ✅ Gestion d'équipe

## 🚀 Démarrage rapide

### 1. Installation

```bash
npm install
```

### 2. Configuration

Copier `.env.example` vers `.env` :

```bash
cp .env.example .env
```

Éditer `.env` avec vos credentials ABMCY :

```env
VITE_ABMCY_API_URL=https://api.abmcy.com
VITE_ABMCY_API_KEY=pk_live_votre_cle_ici
VITE_ABMCY_TENANT_SLUG=hanis
```

**Où trouver votre clé API ?**
- Connectez-vous à votre dashboard ABMCY : https://dashboard.abmcy.com
- Section "Paramètres" → "Clé API"
- Copiez la clé `pk_live_...`

### 3. Lancer le site

```bash
npm run dev
```

Le site tourne sur `http://localhost:5173` ✅

## 📦 Structure du projet

```
hanis/
├── 📁 src/
│   ├── 📁 components/          # Composants React
│   │   ├── CartDrawer.tsx      # Panier coulissant
│   │   ├── Footer.tsx          # Pied de page
│   │   ├── Header.tsx          # En-tête avec navigation
│   │   ├── Icons.tsx           # Icônes SVG
│   │   ├── ProductCard.tsx     # Carte produit
│   │   └── Reveal.tsx          # Animations au scroll
│   │
│   ├── 📁 context/             # État global
│   │   └── StoreContext.tsx    # Panier, commandes, toasts
│   │
│   ├── 📁 data/                # Données statiques
│   │   └── catalog.ts          # Produits, tissus, galerie
│   │
│   ├── 📁 pages/               # Pages du site
│   │   ├── Home.tsx            # Page d'accueil
│   │   ├── Boutique.tsx        # Boutique avec filtres
│   │   ├── ProductDetail.tsx   # Fiche produit
│   │   ├── SurMesure.tsx       # Commande sur mesure
│   │   ├── Commander.tsx       # Finalisation commande
│   │   ├── Galerie.tsx         # Galerie de réalisations
│   │   └── EspaceClient.tsx    # Espace client
│   │
│   ├── 📁 services/            # Services API
│   │   └── abmcy.ts            # Service API ABMCY
│   │
│   ├── App.tsx                 # Composant principal
│   ├── main.tsx                # Point d'entrée
│   └── index.css               # Styles globaux
│
├── 📁 public/                  # Assets statiques
│   └── images/                 # Images des produits
│
├── .env                        # Configuration (non commité)
├── .env.example                # Template de configuration
├── INTEGRATION_ABMCY.md        # Guide d'intégration ABMCY
└── README.md                   # Ce fichier
```

## 🔑 Authentification

### Clé API Tenant (site web)
Utilisée automatiquement pour toutes les requêtes API.

### JWT Personnel (équipe HANI'S)
Pour les membres de l'équipe (couturières, administrateurs).

```typescript
import { loginPersonal, setToken } from './services/abmcy';

const { token } = await loginPersonal('contact@hanis.sn', 'motdepasse');
setToken(token);
```

### JWT Client Final (acheteurs)
Pour les clients qui veulent suivre leurs commandes.

```typescript
import { loginCustomer, setToken } from './services/abmcy';

const { token } = await loginCustomer('+221771234567', 'motdepasse123');
setToken(token);
```

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
});
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
  fabric_source: 'maison',
  notes: 'Manches longues souhaitées',
});
```

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

**Moyens de paiement** : Wave, Orange Money, MTN MoMo, carte bancaire

## 🖼️ Upload d'images

```typescript
import { uploadImage } from './services/abmcy';

const file = document.querySelector('input[type=file]').files[0];
const result = await uploadImage(file);

console.log(result.url); // "https://..."
```

**Limites** : 25 Mo par fichier, 5 Go quota total

## 📚 Documentation

- **[INTEGRATION_ABMCY.md](./INTEGRATION_ABMCY.md)** : Guide complet d'intégration ABMCY
- **[API ABMCY](https://api.abmcy.com)** : Documentation API
- **[Dashboard ABMCY](https://dashboard.abmcy.com)** : Gestion du compte

## 🛠️ Technologies

### Frontend
- **React 18** : Framework UI
- **Vite** : Build tool ultra-rapide
- **TypeScript** : Typage statique
- **Tailwind CSS 4** : Styling utility-first
- **React Router** : Navigation
- **Lucide React** : Icônes

### Backend (ABMCY Core)
- **API REST** : Endpoints standardisés
- **Authentification** : Clé API + JWT
- **Base de données** : PostgreSQL
- **Stockage** : S3-compatible (5 Go quota)
- **Paiements** : CinetPay (Wave, OM, MTN, carte)
- **Emails** : SendGrid (100 emails/jour)

## 📊 Quotas ABMCY

| Service | Quota | Remise à zéro |
|---------|-------|---------------|
| Stockage | 5 Go | - |
| Emails | 100/jour | Minuit |
| Upload | 25 Mo/fichier | - |
| API | Rate limiting | - |

## 🎨 Design

- **Palette** : Beige sable, marron cacao, cognac/bronze
- **Typographie** : Cormorant Garamond (titres) + Jost (texte)
- **Style** : Élégant, raffiné, haut de gamme
- **Responsive** : Mobile-first, optimisé smartphone

## 🚢 Déploiement

### Vercel (recommandé)

```bash
npm i -g vercel
vercel
```

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod
```

### Build statique

```bash
npm run build
# Déployer le dossier dist/
```

## ⚠️ Important

- **Ne jamais committer `.env`** avec votre vraie clé API
- **Changer la clé API** en production
- **Configurer CORS** dans le dashboard ABMCY pour votre domaine
- **Tester en développement** avant de passer en production

## 🆘 Support

- **ABMCY** : support@abmcy.com
- **HANI'S** : salam@hanis.sn | +221 77 812 34 56

## 📄 Licence

Propriétaire - HANI'S Maison de couture

---

**Développé avec ❤️ pour HANI'S - Maison de couture**
