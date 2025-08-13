import Database from 'better-sqlite3';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration admin sécurisée
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (() => {
  console.warn('⚠️  ADMIN_PASSWORD non défini. Utilisation d\'un mot de passe par défaut NON SÉCURISÉ.');
  return 'admin123';
})();
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn('⚠️  JWT_SECRET non défini. Utilisation d\'une clé par défaut NON SÉCURISÉE.');
  return 'roti-secret-key-2025';
})();

// Initialiser la base de données SQLite
const dbPath = join(__dirname, 'data', 'roti.db');
const db = new Database(dbPath);

// Créer les tables si elles n'existent pas
db.exec(`
  CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rating INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    session_id TEXT,
    ip_address TEXT
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    has_voted BOOLEAN DEFAULT FALSE,
    selected_rating INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    token TEXT PRIMARY KEY,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Fonctions utilitaires pour l'authentification
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function verifyAdminToken(token) {
  const session = db.prepare('SELECT * FROM admin_sessions WHERE token = ? AND expires_at > datetime()').get(token);
  return !!session;
}

function cleanExpiredTokens() {
  db.prepare('DELETE FROM admin_sessions WHERE expires_at <= datetime()').run();
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')));
}

// API Routes

// Connexion admin
app.post('/api/admin/login', (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Mot de passe requis' });
    }

    if (password === ADMIN_PASSWORD) {
      // Nettoyer les tokens expirés
      cleanExpiredTokens();
      
      // Créer un nouveau token
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures
      
      db.prepare('INSERT INTO admin_sessions (token, expires_at) VALUES (?, ?)').run(token, expiresAt.toISOString());
      
      res.json({ 
        success: true, 
        token,
        message: 'Connexion réussie'
      });
    } else {
      res.status(401).json({ error: 'Mot de passe incorrect' });
    }
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Vérifier le token admin
app.get('/api/admin/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    if (verifyAdminToken(token)) {
      res.json({ valid: true });
    } else {
      res.status(401).json({ error: 'Token invalide ou expiré' });
    }
  } catch (error) {
    console.error('Error verifying admin token:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Middleware pour protéger les routes admin
function requireAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    if (verifyAdminToken(token)) {
      next();
    } else {
      res.status(401).json({ error: 'Token invalide ou expiré' });
    }
  } catch (error) {
    console.error('Error in admin auth middleware:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// Obtenir des statistiques publiques (limitées)
app.get('/api/stats', (req, res) => {
  try {
    const totalVotes = db.prepare('SELECT COUNT(*) as count FROM votes').get();
    const avgRating = db.prepare('SELECT AVG(rating) as average FROM votes').get();
    
    res.json({
      total: totalVotes.count,
      average: avgRating.average || 0
    });
  } catch (error) {
    console.error('Error getting public stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Obtenir tous les votes (protégé admin)
app.get('/api/votes', requireAdminAuth, (req, res) => {
  try {
    const votes = db.prepare('SELECT * FROM votes ORDER BY timestamp DESC').all();
    res.json(votes);
  } catch (error) {
    console.error('Error getting votes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Obtenir toutes les statistiques (protégé admin)
app.get('/api/admin/stats', requireAdminAuth, (req, res) => {
  try {
    const votes = db.prepare('SELECT rating FROM votes').all();
    
    const stats = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
      total: votes.length,
      average: 0
    };

    if (votes.length > 0) {
      let total = 0;
      votes.forEach(vote => {
        stats[vote.rating]++;
        total += vote.rating;
      });
      stats.average = total / votes.length;
    }

    res.json(stats);
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Réinitialiser tous les votes (protégé admin)
app.delete('/api/votes', requireAdminAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM votes').run();
    db.prepare('DELETE FROM sessions').run();
    
    res.json({ 
      success: true, 
      message: 'Tous les votes ont été supprimés' 
    });
  } catch (error) {
    console.error('Error resetting votes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vérifier si une session a déjà voté
app.get('/api/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Validation du paramètre
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
      return res.status(400).json({ error: 'SessionId invalide' });
    }
    
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
    
    if (session) {
      res.json({
        hasVoted: session.has_voted,
        selectedRating: session.selected_rating
      });
    } else {
      res.json({
        hasVoted: false,
        selectedRating: null
      });
    }
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enregistrer un vote
app.post('/api/vote', (req, res) => {
  try {
    const { rating, sessionId } = req.body;
    
    // Validation des entrées
    if (!rating || !sessionId) {
      return res.status(400).json({ error: 'Rating et sessionId requis' });
    }
    
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating doit être un entier entre 1 et 5' });
    }
    
    if (typeof sessionId !== 'string' || sessionId.trim().length === 0) {
      return res.status(400).json({ error: 'SessionId doit être une chaîne non vide' });
    }
    
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Vérifier si la session a déjà voté
    const existingSession = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
    
    if (existingSession?.has_voted) {
      return res.status(400).json({ error: 'Session has already voted' });
    }

    // Insérer le vote
    const insertVote = db.prepare('INSERT INTO votes (rating, session_id, ip_address) VALUES (?, ?, ?)');
    const voteResult = insertVote.run(rating, sessionId, ipAddress);

    // Mettre à jour ou créer la session
    const upsertSession = db.prepare(`
      INSERT INTO sessions (id, has_voted, selected_rating) 
      VALUES (?, TRUE, ?)
      ON CONFLICT(id) DO UPDATE SET 
        has_voted = TRUE, 
        selected_rating = ?
    `);
    upsertSession.run(sessionId, rating, rating);

    res.json({ 
      success: true, 
      voteId: voteResult.lastInsertRowid,
      message: 'Vote enregistré avec succès'
    });
  } catch (error) {
    console.error('Error saving vote:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route catch-all pour servir l'application React en production
if (process.env.NODE_ENV === 'production') {
  app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
}

// Gérer la fermeture propre de la base de données
process.on('SIGINT', () => {
  console.log('\nFermeture de la base de données...');
  db.close();
  process.exit(0);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Serveur API ROTI démarré sur http://localhost:${PORT}`);
  console.log(`📊 Base de données SQLite: ${dbPath}`);
});
