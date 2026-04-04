import axios from 'axios'

const api = axios.create({
  baseURL: 'https://funnyapp-production.up.railway.app/api',
  timeout: 15000,
  withCredentials: true // obrigatório para o browser enviar/receber cookies cross-origin
})

// Interceptor de request — não precisa mais pegar token do localStorage!
// O browser envia o cookie HttpOnly automaticamente em toda requisição
api.interceptors.request.use(cfg => cfg)

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      // Limpa apenas os dados do usuário (token está no cookie, o backend já limpou)
      localStorage.removeItem('usuario')
      if (!window.location.pathname.includes('/login')) window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
