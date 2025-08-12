import React, { useState, useEffect } from 'react'
import { apiService } from './services/api'
import AdminLogin from './components/AdminLogin'

const ROTI_RATINGS = [
  { value: 1, emoji: '😩', label: 'Très mauvais', color: 'bg-red-500 hover:bg-red-600' },
  { value: 2, emoji: '😕', label: 'Mauvais', color: 'bg-orange-500 hover:bg-orange-600' },
  { value: 3, emoji: '😐', label: 'Correct', color: 'bg-yellow-500 hover:bg-yellow-600' },
  { value: 4, emoji: '😊', label: 'Bien', color: 'bg-blue-500 hover:bg-blue-600' },
  { value: 5, emoji: '🤩', label: 'Excellent', color: 'bg-green-500 hover:bg-green-600' }
]

function App() {
  const [votes, setVotes] = useState([])
  const [hasVoted, setHasVoted] = useState(false)
  const [selectedRating, setSelectedRating] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // Charger les données initiales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Vérifier l'authentification admin
        const isLoggedIn = apiService.isAdminLoggedIn()
        setIsAdminLoggedIn(isLoggedIn)

        // Vérifier le statut de la session
        const sessionStatus = await apiService.getSessionStatus()
        setHasVoted(sessionStatus.hasVoted)
        
        if (sessionStatus.hasVoted && sessionStatus.selectedRating) {
          // Récupérer l'objet rating complet
          const rating = ROTI_RATINGS.find(r => r.value === sessionStatus.selectedRating)
          setSelectedRating(rating)
        }

        // Charger les votes pour les statistiques (si admin)
        if (typeof window !== 'undefined' && window.location) {
          const urlParams = new URLSearchParams(window.location.search)
          const isAdminMode = urlParams.get('admin') === 'true'
          setIsAdmin(isAdminMode)
          
          if (isAdminMode && isLoggedIn) {
            const votesData = await apiService.getVotes()
            setVotes(votesData)
          }
        }

      } catch (err) {
        console.error('Error loading initial data:', err)
      }
    }

    loadInitialData()
  }, [])

  // Effet pour charger les votes quand l'admin se connecte
  useEffect(() => {
    console.log('useEffect - isAdmin:', isAdmin, 'isAdminLoggedIn:', isAdminLoggedIn)
    if (isAdmin && isAdminLoggedIn) {
      console.log('Loading votes for admin...')
      setIsLoadingStats(true)
      apiService.getVotes().then(votesData => {
        console.log('Votes loaded:', votesData)
        setVotes(votesData)
      }).catch(err => {
        console.error('Error loading votes for admin:', err)
      }).finally(() => {
        setIsLoadingStats(false)
      })
    }
  }, [isAdmin, isAdminLoggedIn])

  // Effet pour la mise à jour automatique des statistiques en mode admin
  useEffect(() => {
    let interval = null
    
    if (isAdmin && isAdminLoggedIn) {
      // Actualiser les votes toutes les 5 secondes
      interval = setInterval(() => {
        console.log('Auto-refreshing votes...')
        apiService.getVotes().then(votesData => {
          setVotes(votesData)
        }).catch(err => {
          console.error('Error auto-refreshing votes:', err)
        })
      }, 5000) // 5 secondes
    }

    // Cleanup
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isAdmin, isAdminLoggedIn])

  // Fonction pour gérer la connexion admin
  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true)
    setShowAdminLogin(false)
    // Les votes seront chargés automatiquement par l'effet useEffect
  }

  // Fonction pour gérer la déconnexion admin
  const handleAdminLogout = () => {
    apiService.adminLogout()
    setIsAdminLoggedIn(false)
    setVotes([])
  }

  const handleVote = async (rating) => {
    if (hasVoted) return

    try {
      await apiService.submitVote(rating)
      
      setSelectedRating(rating)
      setHasVoted(true)
      
      // Recharger les votes si on est en mode admin
      if (isAdmin) {
        const votesData = await apiService.getVotes()
        setVotes(votesData)
      }
      
    } catch (err) {
      console.error('Error submitting vote:', err)
    }
  }

  const getStats = () => {
    // S'assurer que votes est un tableau
    const votesArray = Array.isArray(votes) ? votes : []
    console.log('getStats - votes:', votesArray, 'length:', votesArray.length)
    
    if (votesArray.length === 0) return {}
    
    const stats = {}
    let total = 0
    
    ROTI_RATINGS.forEach(rating => {
      const count = votesArray.filter(vote => vote.rating === rating.value).length
      stats[rating.value] = count
      total += count * rating.value
    })
    
    const average = total / votesArray.length
    const result = { ...stats, average, total: votesArray.length }
    console.log('getStats - result:', result)
    
    return result
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Background simple */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ROTI - Return On Time Invested
          </h1>
          <p className="text-gray-600">
            {isAdmin ? 'Panneau d\'administration' : 'Comment avez-vous trouvé cette présentation ?'}
          </p>
        </div>

        {/* Interface de vote - masquée en mode admin */}
        {!isAdmin && (
          <>
            {!hasVoted ? (
              /* Interface de vote */
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {ROTI_RATINGS.map((rating) => (
                    <button
                      key={rating.value}
                      onClick={() => handleVote(rating)}
                      className={`${rating.color} text-white p-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg`}
                    >
                      <div className="text-4xl mb-2">{rating.emoji}</div>
                      <div className="text-lg font-semibold">{rating.value}/5</div>
                      <div className="text-sm opacity-90">{rating.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Confirmation de vote */
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
                <div className="text-6xl mb-4">{selectedRating?.emoji}</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Merci pour votre vote !
                </h2>
                <p className="text-gray-600 mb-4">
                  Vous avez donné une note de {selectedRating?.value}/5 - {selectedRating?.label}
                </p>
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                  <span>✓ Vote enregistré</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Panneau d'administration */}
        {isAdmin && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                🔧 Panneau d'administration
              </h2>
              <div className="flex gap-3">
                {isAdminLoggedIn && (
                  <button
                    onClick={handleAdminLogout}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Déconnexion
                  </button>
                )}
              </div>
            </div>

            {!isAdminLoggedIn ? (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">
                  🔒 Accès administrateur requis
                </div>
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Se connecter
                </button>
              </div>
            ) : (
              <div>
                {/* Indicateur de chargement */}
                {isLoadingStats && (
                  <div className="flex items-center justify-center mb-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm text-gray-600">Actualisation des données...</span>
                  </div>
                )}
                
                {votes.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                        <div className="text-sm text-gray-600">Total votes</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {stats.average ? stats.average.toFixed(1) : '0'}
                        </div>
                        <div className="text-sm text-gray-600">Moyenne</div>
                      </div>
                      {ROTI_RATINGS.map((rating) => (
                        <div key={rating.value} className="bg-gray-50 p-4 rounded-lg text-center">
                          <div className="text-xl mb-1">{rating.emoji}</div>
                          <div className="text-lg font-bold">{stats[rating.value] || 0}</div>
                          <div className="text-xs text-gray-600">{rating.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Graphique simple */}
                    <div className="space-y-2">
                      {ROTI_RATINGS.map((rating) => {
                        const count = stats[rating.value] || 0
                        const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
                        return (
                          <div key={rating.value} className="flex items-center">
                            <div className="w-8 text-center">{rating.emoji}</div>
                            <div className="flex-1 mx-3">
                              <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 ${rating.color.split(' ')[0]}`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                                <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-700">
                                  {count} vote{count !== 1 ? 's' : ''} ({percentage.toFixed(0)}%)
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-gray-600">Aucun vote enregistré pour le moment</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bouton d'accès admin */}
        {!isAdmin && (
          <div className="text-center mt-8">
            <button
              onClick={() => {
                try {
                  if (typeof window !== 'undefined' && window.location) {
                    const url = new URL(window.location.href)
                    url.searchParams.set('admin', 'true')
                    window.location.href = url.toString()
                  }
                } catch (error) {
                  console.error('Error navigating to admin panel:', error)
                }
              }}
              className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              🔧 Accéder au panneau d'administration
            </button>
          </div>
        )}
      </div>
      
      {/* Modal de connexion admin */}
      {showAdminLogin && (
        <AdminLogin 
          onLogin={handleAdminLogin}
          onClose={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  )
}

export default App
