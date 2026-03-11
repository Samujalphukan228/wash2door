import api from './api'

// ── GET all public services ──
export const getPublicServices = async () => {
  const res = await api.get('/api/public/services')
  return res.data?.data ?? res.data
}

// ── GET single service by slug ──
export const getServiceBySlug = async (slug) => {
  const res = await api.get(`/api/public/services/${slug}`)
  return res.data?.data ?? res.data
}