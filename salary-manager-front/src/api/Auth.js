import api from './axios'
export const login   = (email, password) => api.post('/admins/login', { email, password })
export const refresh = (refresh_token)   => api.post('/admins/refresh', { refresh_token })