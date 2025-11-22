import axios from 'axios'

export async function validateUsername(username: string) {
  const res = await axios.post('/api/register/validate-username', { username })
  return (res as any).data
}

export async function validateIdCard(idCardType: string, idCardNumber: string) {
  const res = await axios.post('/api/register/validate-idcard', { idCardType, idCardNumber })
  return (res as any).data
}

export async function register(data: any) {
  const res = await axios.post('/api/register', data)
  return (res as any).data
}

export async function sendRegistrationVerificationCode(payload: { sessionId: string; phone?: string; email?: string }) {
  const res = await axios.post('/api/register/send-verification-code', payload)
  return (res as any).data
}

export async function completeRegistration(payload: { sessionId: string; smsCode?: string; emailCode?: string }) {
  const res = await axios.post('/api/register/complete', payload)
  return (res as any).data
}
