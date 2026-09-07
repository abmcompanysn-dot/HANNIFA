FROM node:18-alpine

# Créer le dossier de l'application
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer le dossier d'upload
RUN mkdir -p uploads

# Exposer le port
EXPOSE 3001

# Variables d'environnement
ENV NODE_ENV=production

# Commande de démarrage
CMD ["npm", "start"]
