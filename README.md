# 🎯 ROTI - Return On Time Invested

Une application web minimaliste en React avec Tailwind CSS pour mesurer le ROTI (Return On Time Invested) avec système de vote à 5 niveaux, panneau d'administration sécurisé et mises à jour en temps réel.

## 🚀 Fonctionnalités

- ✅ **Interface de vote** avec 5 boutons émoji (1-5 étoiles)
- ✅ **Panneau d'administration** protégé par mot de passe
- ✅ **Base de données SQLite** pour la persistance des données
- ✅ **Authentification admin** avec session temporaire
- ✅ **Statistiques en temps réel** (mise à jour automatique toutes les 5s)
- ✅ **Interface moderne** avec Tailwind CSS v4
- ✅ **API REST** avec Express.js
- ✅ **Dockerisé** pour faciliter le déploiement

## 🛠️ Technologies

- **Frontend** : React 19, Vite 7, Tailwind CSS v4
- **Backend** : Node.js, Express.js, better-sqlite3
- **Base de données** : SQLite
- **Authentification** : Sessions temporaires avec tokens
- **Containerisation** : Docker, Docker Compose

## 📦 Installation et Utilisation

### Option 1 : Docker (Recommandé)

#### Production
```bash
# Cloner le projet
git clone <url-du-repo>
cd roti

# Lancer en mode production
docker-compose up roti-app

# Accessible sur http://localhost:3002
```

#### Développement
```bash
# Lancer en mode développement avec hot reload
docker-compose --profile development up roti-dev

# Frontend : http://localhost:5174
# API : http://localhost:3001
```

### Option 2 : Installation locale

#### Prérequis
- Node.js 20+ 
- npm

#### Installation
```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev:full

# Ou séparer frontend/backend
npm run server  # API sur port 3001
npm run dev     # Frontend sur port 5173
```

#### Build pour production
```bash
npm run build
npm run start
```

## 🔧 Configuration

### Variables d'environnement

```bash
# Mot de passe administrateur (défaut: "admin123")
ADMIN_PASSWORD=votre_mot_de_passe

# Clé secrète pour les tokens (défaut: "roti-secret-key-2025")
JWT_SECRET=votre_cle_secrete

# Port du serveur (défaut: 3001)
PORT=3001

# Mode (development/production)
NODE_ENV=production
```

### Base de données

La base de données SQLite est créée automatiquement dans :
- **Local** : `./data/roti.db`
- **Docker** : `/app/data/roti.db` (persisté dans `./data/`)

#### Scripts de gestion

```bash
# Vider la base de données (avec confirmation)
npm run clear-db

# Via Docker
docker-compose exec roti-app npm run clear-db
```

## 🎮 Utilisation

### Interface utilisateur

1. **Voter** : Cliquez sur l'un des 5 boutons émoji
2. **Confirmation** : Votre vote est enregistré avec un message de confirmation
3. **Une seule session** : Un vote par session navigateur

### Panel administrateur

1. **Accès** : Cliquez sur "🔧 Panneau d'administration"
2. **Connexion** : Saisissez le mot de passe admin (défaut: "admin123")
3. **Statistiques** : 
   - Total des votes
   - Moyenne générale
   - Répartition par niveau (1-5)
   - Graphiques visuels
   - **Actualisation automatique** toutes les 5 secondes

## 🐳 Docker

### Services disponibles

- **`roti-app`** : Production (port 3002)
- **`roti-dev`** : Développement avec hot reload (ports 3001 + 5174)

### Commandes utiles

```bash
# Construire l'image
docker-compose build

# Logs en temps réel
docker-compose logs -f

# Arrêter tous les services
docker-compose down

# Nettoyer volumes (⚠️ supprime la DB)
docker-compose down -v

# Accéder au conteneur
docker-compose exec roti-app sh
```

## 📊 API Endpoints

### Votes
- `POST /api/vote` - Enregistrer un vote
- `GET /api/votes` - Récupérer tous les votes (admin)

### Administration
- `POST /api/admin/login` - Connexion admin
- `POST /api/admin/logout` - Déconnexion admin
- `DELETE /api/admin/clear-votes` - Vider les votes (admin)

### Statut
- `GET /api/status` - Statut de l'application

## 🔒 Sécurité

- ✅ **Protection admin** : Authentification par mot de passe
- ✅ **Sessions temporaires** : Tokens avec expiration (24h)
- ✅ **Limitation votes** : Un vote par session utilisateur
- ✅ **Validation des données** : Contrôles côté serveur
- ✅ **CORS configuré** : Protection cross-origin

## 🎨 Interface

### Design System
- **Couleurs** : Palette moderne avec dégradés subtils
- **Typographie** : Police system avec fallbacks
- **Animations** : Transitions douces et feedback visuel
- **Responsive** : Compatible mobile/desktop
- **Accessibilité** : Contrôles clavier et ARIA

### Votes possibles
1. 🔴 **1/5** - Waste (Perte de temps)
2. 🟠 **2/5** - Poor (Pauvre)
3. 🟡 **3/5** - Average (Moyen)
4. 🟢 **4/5** - Good (Bon)
5. 🔵 **5/5** - Excellent (Excellent)

## 📁 Structure du projet

```
/root/workspace/roti/
├── src/
│   ├── components/
│   │   └── AdminLogin.jsx      # Modal d'auth admin
│   ├── services/
│   │   └── api.js              # Client API
│   └── App.jsx                 # Composant principal
├── data/
│   └── roti.db                 # Base SQLite (auto-créée)
├── server.js                   # Serveur Express + API
├── package.json                # Dépendances
├── docker-compose.yml          # Configuration Docker
├── Dockerfile                  # Image Docker
├── clear-database.js           # Script de nettoyage DB
└── DOCKER.md                   # Documentation Docker
```

## 🚀 Déploiement

### Production avec Docker

```bash
# Build et déploiement
docker-compose build
docker-compose up -d roti-app

# L'application sera accessible sur le port 3002
```

### Variables d'environnement recommandées

```env
NODE_ENV=production
ADMIN_PASSWORD=mot_de_passe_securise
JWT_SECRET=cle_secrete_longue_et_complexe
PORT=3001
```

## 🧪 Tests et maintenance

### Nettoyage de la base

```bash
# Local
npm run clear-db

# Docker
docker-compose exec roti-app npm run clear-db
```

### Monitoring

Les logs sont accessibles via :
```bash
docker-compose logs -f roti-app
```

## 📝 Licence

Ce projet est open source. Voir LICENSE pour plus de détails.

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit (`git commit -m 'Ajouter nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

---

**Créé avec ❤️ pour améliorer la mesure du retour sur investissement temps**
- **Design moderne** : Interface avec dégradé et animations subtiles

### Échelle de notation ROTI
1. **👎 Temps perdu** - Rouge
2. **😕 Peu utile** - Orange  
3. **😐 Moyen** - Jaune
4. **🙂 Utile** - Bleu
5. **👍 Excellent retour** - Vert

### Panel d'administration
Accessible via `?admin=true` dans l'URL, permet de :
- **Authentification sécurisée** : Connexion via modale avec mot de passe `admin123`
- Visualiser le nombre total de votes
- Voir la moyenne des notes
- Consulter la répartition détaillée avec pourcentages
- Barres de progression visuelles pour chaque note

## Gestion de la base de données

### Script de maintenance

```bash
# Vider la base de données avec confirmation
npm run clear-db

# Ou directement avec Node.js
node clear-database.js
```

### Utilisation du script
- **`clear-db`** : Affiche l'état actuel de la base, demande confirmation avant suppression
- Utile pour préparer une nouvelle session de votes ou nettoyer les données de test

## Technologies utilisées

- **React 18** avec hooks (useState, useEffect)
- **Vite** pour le build et le serveur de développement
- **Tailwind CSS** pour le styling
- **localStorage** pour la persistance des données côté client

## Installation et lancement

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement
npm run dev
```

L'application sera accessible à l'adresse : `http://localhost:5173/`

## Utilisation

### Mode vote (par défaut)
1. Ouvrez l'application dans votre navigateur
2. Les participants cliquent sur la note qui correspond à leur évaluation
3. Un message de remerciement apparaît après chaque vote
4. Les votes sont automatiquement sauvegardés dans le navigateur

### Mode administration
1. Ajoutez `?admin=true` à l'URL (ex: `http://localhost:5173/?admin=true`)
2. Consultez les statistiques en temps réel :
   - Nombre total de votes
   - Moyenne générale
   - Répartition détaillée par note avec pourcentages
3. Utilisez le bouton "Réinitialiser" pour effacer toutes les données

## Structure du projet

```
src/
├── App.jsx          # Composant principal avec toute la logique
├── index.css        # Styles Tailwind CSS
└── main.jsx         # Point d'entrée React
```

## Fonctionnalités techniques

- **Hook personnalisé** `useLocalStorage` pour la gestion des données
- **Responsive design** avec grille adaptative (1 colonne sur mobile, 5 sur desktop)  
- **Gestion d'état** avec React hooks
- **Animations CSS** avec Tailwind (hover, pulse, transitions)
- **Accessibilité** avec labels ARIA appropriés
- **Gestion d'erreurs** pour le localStorage

## Cas d'usage

Cette application est parfaite pour :
- **Rétrospectives d'équipe** pour évaluer l'utilité des réunions
- **Formations et présentations** pour collecter du feedback instantané
- **Workshops et ateliers** pour mesurer l'engagement
- **Réunions** pour améliorer l'efficacité future

## Personnalisation

Le code est structuré pour faciliter les modifications :
- Les couleurs et émojis sont définis dans la constante `ROTI_RATINGS`
- Les styles sont entièrement basés sur Tailwind CSS
- La logique métier est séparée dans des fonctions réutilisables

## Build de production

```bash
# Génération du build optimisé
npm run build

# Prévisualisation du build
npm run preview
```

Les fichiers de production seront générés dans le dossier `dist/`.
