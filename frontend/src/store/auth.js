import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  // Token NÃO fica mais no frontend — está no cookie HttpOnly gerenciado pelo browser
  // Apenas os dados públicos do usuário ficam em memória (sem senha, sem token)
  const usuario = ref(JSON.parse(localStorage.getItem('usuario') || 'null'))
  const carregando = ref(false)

  // Para saber se está autenticado, basta checar se temos dados do usuário
  const autenticado = computed(() => !!usuario.value)

  const salvar = (u) => {
    usuario.value = u
    // Apenas dados do usuário (sem token) ficam no localStorage
    // Isso é seguro pois não contém credenciais sensíveis
    localStorage.setItem('usuario', JSON.stringify(u))
  }

  const login = async (email, senha) => {
    carregando.value = true
    try {
      // O backend vai setar o cookie HttpOnly automaticamente na resposta
      // O browser salva e envia esse cookie em toda requisição — o JS nunca o acessa
      const { data } = await api.post('/usuarios/login', { email, senha })
      salvar(data.usuario)
      return { sucesso: true }
    } catch (e) {
      return { sucesso: false, erro: e.response?.data?.error || 'Erro ao fazer login.' }
    } finally { carregando.value = false }
  }

  const registrar = async (dados) => {
    carregando.value = true
    try {
      const { data } = await api.post('/usuarios/registro', dados)
      salvar(data.usuario)
      return { sucesso: true }
    } catch (e) {
      const msg = e.response?.data?.errors?.[0]?.msg || e.response?.data?.error || 'Erro ao registrar.'
      return { sucesso: false, erro: msg }
    } finally { carregando.value = false }
  }

  const logout = async () => {
    try {
      // Chama o backend para limpar o cookie HttpOnly
      // O frontend não consegue limpar o cookie diretamente pois é HttpOnly
      await api.post('/usuarios/logout')
    } catch (e) {
      // Mesmo se falhar, limpa o estado local
    } finally {
      usuario.value = null
      localStorage.removeItem('usuario')
    }
  }

  const atualizarUsuario = (u) => {
    usuario.value = u
    localStorage.setItem('usuario', JSON.stringify(u))
  }

  return { usuario, carregando, autenticado, login, registrar, logout, atualizarUsuario }
})
