<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">😂 <span>FunnyApp</span></div>
      <h2>Redefinir senha</h2>

      <div v-if="sucesso" class="alerta alerta-sucesso">
        {{ sucesso }}
        <div style="margin-top:12px">
          <router-link to="/login" class="btn btn-amarelo btn-sm">Ir para o login</router-link>
        </div>
      </div>
      <div v-if="erro" class="alerta alerta-erro">{{ erro }}</div>

      <form v-if="!sucesso" @submit.prevent="redefinir" class="auth-form">
        <div class="form-group">
          <label class="form-label">Nova senha</label>
          <div class="input-senha-wrap">
            <input
              v-model="senha"
              :type="mostrarSenha ? 'text' : 'password'"
              class="form-input input-senha"
              placeholder="Mínimo 6 caracteres"
              required
              minlength="6"
            />
            <button type="button" class="btn-olho" @click="mostrarSenha = !mostrarSenha">
              {{ mostrarSenha ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Confirmar nova senha</label>
          <input v-model="confirmar" type="password" class="form-input" placeholder="Repita a senha" required />
          <span v-if="confirmar && senha !== confirmar" class="form-error">As senhas não coincidem</span>
        </div>
        <button type="submit" class="btn btn-amarelo btn-full btn-lg" :disabled="carregando || senha !== confirmar">
          <span v-if="carregando" class="spinner" style="border-top-color:var(--preto)"></span>
          <span v-else>Salvar nova senha</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const senha = ref('')
const confirmar = ref('')
const mostrarSenha = ref(false)
const carregando = ref(false)
const sucesso = ref(null)
const erro = ref(null)

const redefinir = async () => {
  if (senha.value !== confirmar.value) return
  carregando.value = true
  erro.value = null
  try {
    const { data } = await api.post(`/usuarios/redefinir-senha/${route.params.token}`, { senha: senha.value })
    sucesso.value = data.message
  } catch (e) {
    erro.value = e.response?.data?.error || 'Token inválido ou expirado.'
  } finally { carregando.value = false }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; background: var(--preto); }
.auth-card { background: var(--cinza-900); border: 1px solid var(--cinza-700); border-radius: var(--radius-lg); padding: 40px; width: 100%; max-width: 400px; }
.auth-logo { font-size: 2rem; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
.auth-logo span { font-family: var(--fonte-titulo); font-size: 1.6rem; color: var(--amarelo); }
.auth-card h2 { font-size: 1.3rem; margin-bottom: 24px; }
.auth-form { display: flex; flex-direction: column; gap: 16px; }
.input-senha-wrap { position: relative; display: flex; align-items: center; }
.input-senha { padding-right: 44px; }
.btn-olho { position: absolute; right: 10px; background: none; border: none; cursor: pointer; font-size: 1.1rem; color: var(--cinza-400); }
.btn-olho:hover { color: var(--branco); }
.alerta { padding: 12px 16px; border-radius: var(--radius-sm); font-size: 0.85rem; margin-bottom: 16px; }
.alerta-erro { background: rgba(255,68,68,0.1); color: #ff8888; border: 1px solid rgba(255,68,68,0.3); }
.alerta-sucesso { background: rgba(34,197,94,0.1); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }
</style>
