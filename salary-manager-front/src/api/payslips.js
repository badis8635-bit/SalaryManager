import api from './axios'

export const generatePayslip = (data) => api.post('/payslips/generate', data)
export const generatePeriod = (month, year) =>
  api.post('/payslips/generate-period', { month, year })
export const getWorkerPayslips = (workerId) => api.get(`/payslips/worker/${workerId}`)
export const getPendingPayslips = () => api.get('/payslips/pending')
export const getPeriodSummary = (year, month) =>
  api.get(`/payslips/period/${year}/${month}/summary`)
export const markAsPaid = (id) => api.patch(`/payslips/${id}/pay`)
export const cancelPayslip = (id) => api.patch(`/payslips/${id}/cancel`)