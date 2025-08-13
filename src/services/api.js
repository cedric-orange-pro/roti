// Service API pour communiquer avec la base de données
// Détection automatique de l'URL de l'API selon l'environnement
const getApiBaseUrl = () => {
  // En mode développement, utiliser le port 3001
  if (window.location.port === '5173' || window.location.port === '5174') {
    return 'http://localhost:3001/api';
  }
  // En production ou Docker, utiliser le même port que l'interface
  return `${window.location.origin}/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Debug: afficher l'URL utilisée
console.log('🔗 API URL détectée:', API_BASE_URL);

// Gestion du token admin
function getAdminToken() {
  return localStorage.getItem('admin-token');
}

function setAdminToken(token) {
  localStorage.setItem('admin-token', token);
}

function removeAdminToken() {
  localStorage.removeItem('admin-token');
}

function getAuthHeaders() {
  const token = getAdminToken();
  return token ? {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : {
    'Content-Type': 'application/json'
  };
}

// Générer un ID de session unique
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
}

// Obtenir l'ID de session depuis localStorage ou en créer un nouveau
function getSessionId() {
  let sessionId = localStorage.getItem('roti-session-id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('roti-session-id', sessionId);
  }
  return sessionId;
}

// Service API
export const apiService = {
  // Obtenir les statistiques
  async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  // Obtenir tous les votes
  async getVotes() {
    try {
      const response = await fetch(`${API_BASE_URL}/votes`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching votes:', error);
      throw error;
    }
  },

  // Vérifier le statut de la session
  async getSessionStatus() {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/session/${sessionId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return {
        hasVoted: data.hasVoted,
        selectedRating: data.selectedRating,
        sessionId
      };
    } catch (error) {
      console.error('Error fetching session status:', error);
      // Fallback en cas d'erreur
      return {
        hasVoted: false,
        selectedRating: null,
        sessionId: getSessionId()
      };
    }
  },

  // Envoyer un vote
  async submitVote(rating) {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: rating.value,
          sessionId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting vote:', error);
      throw error;
    }
  },

  // Authentification admin
  async adminLogin(password) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Mot de passe incorrect');
      }
      
      const data = await response.json();
      setAdminToken(data.token);
      return data;
    } catch (error) {
      console.error('Erreur login admin:', error);
      throw error;
    }
  },

  adminLogout() {
    removeAdminToken();
  },

  isAdminLoggedIn() {
    return !!getAdminToken();
  }
};
