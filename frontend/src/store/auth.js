import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref(JSON.parse(localStorage.getItem('usuario') || 'null'))
  const token = ref(localStorage.getItem('token') || null)
  const carregando = ref(false)

  const autenticado = computed(() => !!token.value)

  const salvar = (t, u) => {
    token.value = t; usuario.value = u
    localStorage.setItem('token', t)
    localStorage.setItem('usuario', JSON.stringify(u))
  }

  const login = async (email, senha) => {
    carregando.value = true
    try {
      const { data } = await api.post('/usuarios/login', { email, senha })
      salvar(data.token, data.usuario)
      return { sucesso: true }
    } catch (e) {
      return { sucesso: false, erro: e.response?.data?.error || 'Erro ao fazer login.' }
    } finally { carregando.value = false }
  }

  const registrar = async (dados) => {
    carregando.value = true
    try {
      const { data } = await api.post('/usuarios/registro', dados)
      salvar(data.token, data.usuario)
      return { sucesso: true }
    } catch (e) {
      const msg = e.response?.data?.errors?.[0]?.msg || e.response?.data?.error || 'Erro ao registrar.'
      return { sucesso: false, erro: msg }
    } finally { carregando.value = false }
  }

  const logout = () => {
    token.value = null; usuario.value = null
    localStorage.removeItem('token'); localStorage.removeItem('usuario')
  }

  const atualizarUsuario = (u) => {
    usuario.value = u
    localStorage.setItem('usuario', JSON.stringify(u))
  }

  return { usuario, token, carregando, autenticado, login, registrar, logout, atualizarUsuario }
})
