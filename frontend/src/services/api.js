import axios from 'axios'

const api = axios.create({
  baseURL: 'https://funnyapp-production.up.railway.app/api',
  timeout: 15000,
  withCredentials: true
})

api.interceptors.request.use(cfg => cfg)

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('usuario')
      if (!window.location.pathname.includes('/login')) window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
