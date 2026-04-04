import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  // Nada fica no localStorage — tudo em memória
  // Token está no cookie HttpOnly (gerenciado pelo browser)
  // Dados do usuário são buscados do servidor ao iniciar
  const usuario = ref(null)
  const carregando = ref(false)
  const inicializado = ref(false)

  const autenticado = computed(() => !!usuario.value)

  // Busca os dados do usuário logado no servidor
  // Chamado automaticamente ao abrir o app
  const inicializar = async () => {
    if (inicializado.value) return
    try {
      const { data } = await api.get('/usuarios/me')
      usuario.value = data.usuario
    } catch (e) {
      usuario.value = null // cookie inválido ou expirado
    } finally {
      inicializado.value = true
    }
  }

  const login = async (email, senha) => {
    carregando.value = true
    try {
      // Backend seta o cookie HttpOnly automaticamente
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
      usuario.value = data.usuario
      return { sucesso: true }
    } catch (e) {
      const msg = e.response?.data?.errors?.[0]?.msg || e.response?.data?.error || 'Erro ao registrar.'
      return { sucesso: false, erro: msg }
    } finally { carregando.value = false }
  }

  const logout = async () => {
    try {
      await api.post('/usuarios/logout') // limpa o cookie HttpOnly no servidor
    } catch (e) {}
    finally {
      usuario.value = null
      inicializado.value = false
    }
  }

  const atualizarUsuario = (u) => {
    usuario.value = u // só atualiza em memória
  }

  return { usuario, carregando, inicializado, autenticado, inicializar, login, registrar, logout, atualizarUsuario }
})
