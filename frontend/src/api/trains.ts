import client from './client'

export async function searchTrains(params: { from: string; to: string; date: string; highspeed?: '1' | '0' }) {
  const res = await client.get('/api/trains/search', { params })
  return res.data
}

export async function getTrainDetail(trainNo: string) {
  const res = await client.get(`/api/trains/${encodeURIComponent(trainNo)}/detail`)
  return res.data
}