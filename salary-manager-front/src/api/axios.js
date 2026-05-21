import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',  // ton FastAPI
})

// Avant chaque requête : ajoute le token JWT dans le header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si le serveur répond 401 (token expiré) → redirige vers login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api