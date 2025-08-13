import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { apiService } from '../services/api';

const AdminLogin = ({ onLogin, onClose }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Veuillez saisir un mot de passe');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiService.adminLogin(password);
      onLogin();
    } catch (error) {
      setError(error.message || 'Mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Backdrop invisible pour capturer les clics */}
      <button 
        className="fixed inset-0 -z-10 bg-transparent border-none outline-none cursor-default"
        onClick={handleBackdropClick}
        aria-label="Fermer la modal"
        type="button"
      />
      
      <dialog 
        open
        className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 relative border-0 p-0"
        aria-labelledby="admin-login-title"
      >
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ✕
        </button>
        
        {/* Contenu de la modale */}
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 id="admin-login-title" className="text-2xl font-bold text-gray-900 mb-2">
              🔐 Accès Administration
            </h2>
            <p className="text-gray-600">
              Saisissez le mot de passe administrateur
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mot de passe administrateur"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoFocus
                aria-describedby={error ? "password-error" : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    onClose();
                  }
                }}
              />
            </div>

            {error && (
              <div id="password-error" className="mb-4 text-red-600 text-sm text-center bg-red-50 py-2 px-3 rounded" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
};

AdminLogin.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default AdminLogin;
