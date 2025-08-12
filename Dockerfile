# Dockerfile pour l'application ROTI
FROM node:20-alpine

# Installer Python et les outils de build pour better-sqlite3
RUN apk add --no-cache g++ make python3

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json
COPY package*.json ./

# Installer toutes les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Construire l'application React pour la production
RUN npm run build

# Exposer le port de l'API
EXPOSE 3001

# Créer le répertoire pour la base de données
RUN mkdir -p /app/data

# Commande par défaut pour lancer l'application
CMD ["npm", "run", "start"]
