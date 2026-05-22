import api from './axios'

export const getWorkers = () => api.get('/workers/')
export const getActiveWorkers = () => api.get('/workers/active')
export const getWorker = (id) => api.get(`/workers/${id}`)
export const createWorker = (data) => api.post('/workers/', data)
export const activateWorker = (id) => api.patch(`/workers/${id}/activate`)
export const deactivateWorker = (id) => api.patch(`/workers/${id}/deactivate`)
export const deleteWorker = (id) => api.delete(`/workers/${id}`)