import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref(null)
  const carregando = ref(false)
  const inicializado = ref(false)

  const autenticado = computed(() => !!usuario.value)

  const inicializar = async () => {
    if (inicializado.value) return
    try {
      const { data } = await api.get('/usuarios/me')
      usuario.value = data.usuario
    } catch (e) {
      usuario.value = null
    } finally {
      inicializado.value = true
    }
  }

  const login = async (email, senha) => {
    carregando.value = true
    try {
      const { data } = await api.post('/usuarios/login', { email, senha })
      usuario.value = data.usuario
      return { sucesso: true }
    } catch (e) {
      return { sucesso: false, erro: e.response?.data?.error || 'Erro ao fazer login.' }
    } finally { carregando.value = false }
  }

  const registrar = async (dados) => {
    carregando.value = true
    try {
      const { data } = await api.post('/usuarios/registro', dados)
      usuario.value =
