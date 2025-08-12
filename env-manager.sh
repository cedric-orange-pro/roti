#!/bin/bash

# Script de gestion du fichier .env pour ROTI

echo "🔧 Gestionnaire de configuration ROTI"
echo ""

# Fonction pour génération automatique (utilisée par start.sh)
auto_setup() {
    echo "⚙️  Création automatique du fichier .env..."
    cp .env.example .env
    
    # Générer un mot de passe admin sécurisé (32 caractères)
    echo "🔐 Génération du mot de passe administrateur..."
    admin_pass=$(openssl rand -base64 24 2>/dev/null | tr -d "=+/" | cut -c1-32)
    if [ -z "$admin_pass" ]; then
        # Fallback si openssl n'est pas disponible - 32 caractères
        admin_pass="Admin$(date +%s)$(shuf -i 100000-999999 -n 1 2>/dev/null || echo 123456)X$(date +%N | cut -c1-6)"
    fi
    
    # Générer une clé JWT sécurisée
    echo "🔑 Génération de la clé secrète JWT..."
    jwt_secret=$(openssl rand -base64 32 2>/dev/null || echo "roti-secret-key-$(date +%s)")
    
    # Remplacer les valeurs AUTO_GENERATED
    sed -i "s|ADMIN_PASSWORD=AUTO_GENERATED|ADMIN_PASSWORD=${admin_pass}|" .env
    sed -i "s|JWT_SECRET=AUTO_GENERATED|JWT_SECRET=${jwt_secret}|" .env
    
    echo "✅ Configuration sécurisée générée automatiquement !"
    echo "🔐 Mot de passe admin généré : ${admin_pass}"
    echo "📝 Sauvegardez ce mot de passe en lieu sûr !"
    echo ""
}

# Fonction pour corriger les valeurs AUTO_GENERATED manquantes
fix_auto() {
    echo "🔧 Correction de la configuration incomplète..."
    
    # Vérifier et corriger le mot de passe admin
    if grep -q "ADMIN_PASSWORD=AUTO_GENERATED" .env; then
        echo "🔐 Génération du mot de passe administrateur..."
        admin_pass=$(openssl rand -base64 24 2>/dev/null | tr -d "=+/" | cut -c1-32)
        if [ -z "$admin_pass" ]; then
            admin_pass="Admin$(date +%s)$(shuf -i 100000-999999 -n 1 2>/dev/null || echo 123456)X$(date +%N | cut -c1-6)"
        fi
        sed -i "s|ADMIN_PASSWORD=AUTO_GENERATED|ADMIN_PASSWORD=${admin_pass}|" .env
        echo "✅ Mot de passe admin généré : ${admin_pass}"
    fi
    
    # Vérifier et corriger la clé JWT
    if grep -q "JWT_SECRET=AUTO_GENERATED" .env; then
        echo "🔑 Génération de la clé secrète JWT..."
        jwt_secret=$(openssl rand -base64 32 2>/dev/null || echo "roti-secret-key-$(date +%s)")
        sed -i "s|JWT_SECRET=AUTO_GENERATED|JWT_SECRET=${jwt_secret}|" .env
        echo "✅ Clé JWT générée automatiquement"
    fi
    
    echo "✅ Configuration corrigée !"
}

# Fonction pour régénérer les mots de passe
regenerate_passwords() {
    if [ ! -f ".env" ]; then
        echo "❌ Aucun fichier .env trouvé"
        return
    fi
    
    echo "🔐 Régénération des mots de passe sécurisés..."
    
    # Générer nouveau mot de passe admin (32 caractères)
    new_admin_pass=$(openssl rand -base64 24 2>/dev/null | tr -d "=+/" | cut -c1-32)
    if [ -z "$new_admin_pass" ]; then
        # Fallback si openssl n'est pas disponible - 32 caractères
        new_admin_pass="Admin$(date +%s)$(shuf -i 100000-999999 -n 1 2>/dev/null || echo 123456)X$(date +%N | cut -c1-6)"
    fi
    
    # Générer nouvelle clé JWT
    new_jwt_secret=$(openssl rand -base64 32 2>/dev/null || echo "roti-secret-key-$(date +%s)")
    
    # Sauvegarder l'ancien fichier
    cp .env .env.backup.$(date +%Y%m%d-%H%M%S)
    
    # Mettre à jour les valeurs (utiliser | au lieu de / pour éviter les conflits)
    sed -i "s|ADMIN_PASSWORD=.*|ADMIN_PASSWORD=${new_admin_pass}|" .env
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=${new_jwt_secret}|" .env
    
    echo "✅ Mots de passe régénérés avec succès !"
    echo "🔐 Nouveau mot de passe admin : ${new_admin_pass}"
    echo "💾 Ancien fichier sauvegardé en .env.backup.*"
    echo "📝 Sauvegardez ce nouveau mot de passe !"
}

# Fonction pour créer/mettre à jour .env
setup_env() {
    if [ -f ".env" ]; then
        echo "⚠️  Un fichier .env existe déjà."
        read -p "Voulez-vous le remplacer ? (y/N): " replace
        if [[ ! $replace =~ ^[Yy]$ ]]; then
            echo "❌ Opération annulée"
            return
        fi
    fi
    
    echo "📝 Configuration de l'environnement..."
    
    # Demander les configurations
    read -p "Port du serveur (défaut: 3001): " port
    port=${port:-3001}
    
    read -p "Mode (development/production, défaut: development): " mode
    mode=${mode:-development}
    
    # Générer un mot de passe admin aléatoire sécurisé (32 caractères)
    echo "🔐 Génération automatique du mot de passe administrateur..."
    admin_pass=$(openssl rand -base64 24 2>/dev/null | tr -d "=+/" | cut -c1-32)
    if [ -z "$admin_pass" ]; then
        # Fallback si openssl n'est pas disponible - 32 caractères
        admin_pass="Admin$(date +%s)$(shuf -i 100000-999999 -n 1 2>/dev/null || echo 123456)X$(date +%N | cut -c1-6)"
    fi
    
    read -p "Port Docker production (défaut: 3002): " docker_prod
    docker_prod=${docker_prod:-3002}
    
    read -p "Port Docker développement (défaut: 5174): " docker_dev
    docker_dev=${docker_dev:-5174}
    
    # Générer une clé secrète aléatoire
    jwt_secret=$(openssl rand -base64 32 2>/dev/null || echo "roti-secret-key-$(date +%s)")
    
    # Créer le fichier .env
    cat > .env << EOF
# Configuration ROTI - Généré le $(date)

# ================================
# 🚀 Configuration Serveur
# ================================

PORT=${port}
NODE_ENV=${mode}

# ================================
# 🔒 Sécurité
# ================================

ADMIN_PASSWORD=${admin_pass}
JWT_SECRET=${jwt_secret}

# ================================
# 🐳 Configuration Docker
# ================================

DOCKER_PROD_PORT=${docker_prod}
DOCKER_DEV_PORT=${docker_dev}
EOF

    echo "✅ Fichier .env créé avec succès !"
    echo ""
    echo "📋 Configuration :"
    echo "   - Port serveur: ${port}"
    echo "   - Mode: ${mode}"
    echo "   - Mot de passe admin: ${admin_pass}"
    echo "   - Port Docker prod: ${docker_prod}"
    echo "   - Port Docker dev: ${docker_dev}"
    echo ""
    echo "🔐 Une clé secrète JWT a été générée automatiquement."
}

# Fonction pour afficher la configuration actuelle
show_config() {
    if [ ! -f ".env" ]; then
        echo "❌ Aucun fichier .env trouvé"
        return
    fi
    
    echo "📋 Configuration actuelle (.env) :"
    echo ""
    
    while IFS= read -r line; do
        if [[ $line =~ ^[A-Z_]+=.* ]]; then
            key=$(echo "$line" | cut -d'=' -f1)
            value=$(echo "$line" | cut -d'=' -f2-)
            
            # Masquer les mots de passe
            if [[ $key == *"PASSWORD"* ]] || [[ $key == *"SECRET"* ]]; then
                value="${value:0:3}***"
            fi
            
            echo "   $key: $value"
        fi
    done < .env
}

# Synchroniser NODE_ENV avec le mode choisi
sync_environment() {
    if [ ! -f .env ]; then
        echo "❌ Fichier .env non trouvé"
        return 1
    fi
    
    echo "🔄 Synchronisation de l'environnement..."
    echo ""
    echo "Modes disponibles :"
    echo "1. Production (NODE_ENV=production)"
    echo "2. Développement (NODE_ENV=development)"
    echo ""
    read -p "Choisissez le mode (1 ou 2) : " mode_choice
    
    case $mode_choice in
        1)
            new_env="production"
            ;;
        2)
            new_env="development"
            ;;
        *)
            echo "❌ Choix invalide"
            return 1
            ;;
    esac
    
    # Sauvegarder l'ancien fichier
    cp .env .env.backup.sync.$(date +%Y%m%d_%H%M%S)
    
    # Mettre à jour NODE_ENV
    sed -i "s/^NODE_ENV=.*/NODE_ENV=$new_env/" .env
    
    echo "✅ NODE_ENV mis à jour : $new_env"
    echo "💾 Ancien fichier sauvegardé"
    
    # Afficher la nouvelle configuration
    echo ""
    show_config
}

# Menu principal
case "${1:-menu}" in
    "setup"|"create")
        setup_env
        ;;
    "auto-setup")
        auto_setup
        ;;
    "fix-auto")
        fix_auto
        ;;
    "sync"|"environment")
        sync_environment
        ;;
    "show"|"display"|"config")
        show_config
        ;;
    "regenerate"|"regen")
        regenerate_passwords
        ;;
    "reset")
        if [ -f ".env" ]; then
            rm .env
            echo "✅ Fichier .env supprimé"
        else
            echo "❌ Aucun fichier .env à supprimer"
        fi
        ;;
    *)
        echo "Utilisation:"
        echo "  $0 setup       - Créer/configurer le fichier .env (interactif)"
        echo "  $0 auto-setup  - Création automatique avec mots de passe générés"
        echo "  $0 fix-auto    - Corriger les valeurs AUTO_GENERATED manquantes"
        echo "  $0 sync        - Synchroniser NODE_ENV (production/développement)"
        echo "  $0 show        - Afficher la configuration actuelle"
        echo "  $0 regenerate  - Régénérer les mots de passe sécurisés"
        echo "  $0 reset       - Supprimer le fichier .env"
        echo ""
        read -p "Que voulez-vous faire ? (setup/auto-setup/sync/show/regenerate/reset): " action
        $0 $action
        ;;
esac
