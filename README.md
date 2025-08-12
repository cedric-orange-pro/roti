# Application ROTI - Retour sur le Temps Investi

Une application web minimaliste en React avec Tailwind CSS pour mesurer le ROTI (Return On Time Invested) après une présentation ou réunion.

## Fonctionnalités

### Interface utilisateur
- **Page unique responsive** : Interface épurée et moderne, optimisée pour mobile et desktop
- **Système de vote simple** : 5 boutons cliquables représentant les notes de 1 à 5
- **Feedback immédiat** : Message de remerciement après chaque vote
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
