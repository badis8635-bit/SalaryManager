import api from './axios'

export const getContract = (workerId) => api.get(`/contracts/worker/${workerId}`)
export const getContractCost = (workerId) => api.get(`/contracts/worker/${workerId}/cost`)
export const createContract = (data) => api.post('/contracts/', data)
export const updateSalary = (workerId, new_gross_salary) =>
  api.patch(`/contracts/worker/${workerId}/salary`, { new_gross_salary })
export const updateTaxRates = (workerId, data) =>
  api.patch(`/contracts/worker/${workerId}/tax-rates`, data)
export const terminateContract = (workerId, end_date) =>
  api.patch(`/contracts/worker/${workerId}/terminate`, { end_date })