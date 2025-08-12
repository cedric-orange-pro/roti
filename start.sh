#!/bin/bash

# Script de démarrage pour l'application ROTI

echo "🎯 Démarrage de l'application ROTI..."

# Vérifier et créer le fichier .env si nécessaire
if [ ! -f ".env" ]; then
    echo "⚙️  Fichier .env non trouvé, génération automatique..."
    ./env-manager.sh auto-setup
else
    echo "✅ Fichier .env trouvé"
    
    # Vérifier si des valeurs sont encore AUTO_GENERATED
    if grep -q "AUTO_GENERATED" .env; then
        echo "� Configuration incomplète détectée, finalisation..."
        ./env-manager.sh fix-auto
    fi
fi

# Charger les variables d'environnement
if [ -f ".env" ]; then
    echo "📝 Chargement des variables d'environnement..."
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
fi

# Afficher la configuration chargée
echo "🔧 Configuration :"
echo "   - PORT: ${PORT:-3001}"
echo "   - NODE_ENV: ${NODE_ENV:-development}"
echo "   - ADMIN_PASSWORD: ${ADMIN_PASSWORD:0:3}*** (masqué)"
echo ""

# Vérifier si Docker est installé
if command -v docker-compose &> /dev/null; then
    echo "🐳 Docker détecté - Lancement avec Docker..."
    
    # Demander le mode
    echo "Choisissez le mode :"
    echo "1. Production (port 3002)"
    echo "2. Développement (ports 3001 + 5174)"
    read -p "Votre choix (1 ou 2) : " choice
    
    # Vérifier la cohérence avec NODE_ENV
    current_env=$(grep "NODE_ENV=" .env | cut -d'=' -f2)
    expected_env=""
    
    case $choice in
        1)
            expected_env="production"
            ;;
        2)
            expected_env="development"
            ;;
        *)
            echo "❌ Choix invalide"
            exit 1
            ;;
    esac
    
    # Vérifier si NODE_ENV correspond au mode choisi
    if [ "$current_env" != "$expected_env" ]; then
        echo ""
        echo "⚠️  Incohérence détectée !"
        echo "   NODE_ENV dans .env: $current_env"
        echo "   Mode Docker choisi: $expected_env"
        echo ""
        read -p "Voulez-vous synchroniser NODE_ENV avec le mode choisi ? (o/N): " sync_choice
        
        if [[ $sync_choice =~ ^[oO]$ ]]; then
            echo "🔄 Synchronisation automatique..."
            # Sauvegarder et mettre à jour directement
            cp .env .env.backup.sync.$(date +%Y%m%d_%H%M%S)
            sed -i "s/^NODE_ENV=.*/NODE_ENV=$expected_env/" .env
            source .env
            echo "✅ NODE_ENV mis à jour vers: $expected_env"
        else
            echo "⚠️  Continuons avec NODE_ENV=$current_env..."
        fi
        echo ""
    fi
    
    case $choice in
        1)
            echo "🚀 Lancement en mode production..."
            docker-compose up -d roti-app
            PROD_PORT=${DOCKER_PROD_PORT:-3002}
            echo "✅ Application accessible sur http://localhost:${PROD_PORT}"
            echo "📊 Panneau admin avec mot de passe: ${ADMIN_PASSWORD:-admin123}"
            ;;
        2)
            echo "🛠️  Lancement en mode développement..."
            docker-compose --profile development up roti-dev
            DEV_PORT=${DOCKER_DEV_PORT:-5174}
            API_PORT=${PORT:-3001}
            echo "✅ Frontend: http://localhost:${DEV_PORT}"
            echo "✅ API: http://localhost:${API_PORT}"
            echo "📊 Panneau admin avec mot de passe: ${ADMIN_PASSWORD:-admin123}"
            ;;
        *)
            echo "❌ Choix invalide"
            exit 1
            ;;
    esac
    
elif command -v npm &> /dev/null; then
    echo "📦 NPM détecté - Lancement en local..."
    
    # Installer les dépendances si nécessaire
    if [ ! -d "node_modules" ]; then
        echo "📥 Installation des dépendances..."
        npm install
    fi
    
    echo "🚀 Lancement de l'application..."
    npm run dev:full
    echo "✅ Frontend: http://localhost:5173"
    echo "✅ API: http://localhost:${PORT:-3001}"
    echo "📊 Panneau admin avec mot de passe: ${ADMIN_PASSWORD:-admin123}"
    
else
    echo "❌ Ni Docker ni NPM détectés"
    echo "Veuillez installer Docker ou Node.js"
    exit 1
fi
