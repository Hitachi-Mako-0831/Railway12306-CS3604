import client from './client'

export async function listPassengers(userId: number) {
  const res = await client.get('/api/passengers', { params: { userId } })
  return res.data
}

export async function searchPassengers(userId: number, q: string) {
  const res = await client.get('/api/passengers/search', { params: { userId, q } })
  return res.data
}

export async function addPassenger(payload: { userId: number; name: string; phone?: string; id_card_type?: string; id_card_number?: string; discount_type?: string }) {
  const res = await client.post('/api/passengers', payload)
  return res.data
}

export async function updatePassenger(id: number, payload: { userId: number; name?: string; phone?: string; id_card_type?: string; id_card_number?: string; discount_type?: string }) {
  const res = await client.put(`/api/passengers/${id}`, payload)
  return res.data
}

export async function deletePassenger(id: number, userId: number) {
  const res = await client.delete(`/api/passengers/${id}`, { params: { userId } })
  return res.data
}