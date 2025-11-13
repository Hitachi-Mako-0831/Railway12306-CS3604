export function useValidation() {
  const isEmpty = (v?: string) => !v || v.trim() === ''
  const minLen = (v: string, n: number) => v.length >= n

  const validateLogin = (username: string, password: string) => {
    if (isEmpty(username)) return '请输入用户名！'
    if (isEmpty(password)) return '请输入密码！'
    if (!minLen(password, 6)) return '密码长度不能少于6位！'
    return ''
  }

  return { validateLogin }
}
