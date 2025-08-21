import axios from 'axios'
import Cookies from 'js-cookie'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

apiClient.interceptors.request.use(
  config => {
    console.log('Request Body:', config.data)
    const token = Cookies.get('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      console.error('Unauthorized access - redirecting to login')
    }

    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirecionar para login ou renovar token
      Cookies.remove('token') // Limpa o token inválido

      // window.location.href = '/login'Redireciona para a página de login
    }

    return Promise.reject(error)
  }
)
