const API_BASE_URL = '/api'

export const getAllStations = async (): Promise<any[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/stations`)
    const data = await res.json()
    const list = data.stations || []
    return list.map((name: any) => ({ name }))
  } catch { return [] }
}

export const searchStations = async (keyword: string): Promise<any[]> => {
  // 简化为在全部站点中前端过滤，避免后端改动
  const all = await getAllStations()
  const key = String(keyword || '').toLowerCase()
  return all.filter((s: any) => String(s.name || '').toLowerCase().includes(key))
}

export const validateStation = async (stationName: string): Promise<{ valid: boolean; station?: any; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/stations/validate?name=${encodeURIComponent(stationName)}`)
    const data = await res.json()
    return { valid: !!data.valid, station: data.valid ? { name: stationName } : undefined, error: data.valid ? undefined : '无法匹配该站点' }
  } catch { return { valid: false, error: '验证站点失败' } }
}