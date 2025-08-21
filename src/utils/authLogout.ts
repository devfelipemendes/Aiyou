// src/utils/authLogout.ts
import Cookies from 'js-cookie'

export const forceLogout = (reason: string = 'Sua sessão expirou') => {
  console.log('🚨 LOGOUT FORÇADO:', reason)

  // Limpa o token
  Cookies.remove('token')

  // Limpa outros dados se necessário
  localStorage.removeItem('user')

  // Notifica o usuário

  // Redireciona para login (evita loops)
  setTimeout(() => {
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }, 1000)
}
