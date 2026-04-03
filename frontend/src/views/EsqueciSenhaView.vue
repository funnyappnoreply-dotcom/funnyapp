<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">😂 <span>FunnyApp</span></div>
      <h2>Esqueci minha senha</h2>
      <p class="auth-sub">Digite seu email e enviaremos as instruções para redefinir sua senha.</p>

      <div v-if="sucesso" class="alerta alerta-sucesso">{{ sucesso }}</div>
      <div v-if="erro" class="alerta alerta-erro">{{ erro }}</div>

      <form v-if="!sucesso" @submit.prevent="enviar" class="auth-form">
        <div class="form-group">
          <label class="form-label">E-mail</label>
          <input v-model="email" type="email" class="form-input" placeholder="seu@email.com" required />
        </div>
        <button type="submit" class="btn btn-amarelo btn-full btn-lg" :disabled="carregando">
          <span v-if="carregando" class="spinner" style="border-top-color:var(--preto)"></span>
          <span v-else>Enviar instruções</span>
        </button>
      </form>

      <div class="auth-link">
        <router-link to="/login">← Voltar para o login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'

const email = ref('')
const carregando = ref(false)
const sucesso = ref(null)
const erro = ref(null)

const enviar = async () => {
  carregando.value = true
  erro.value = null
  try {
    const { data } = await api.post('/usuarios/esqueci-senha', { email: email.value })
    sucesso.value = data.message
  } catch (e) {
    erro.value = e.response?.data?.error || 'Erro ao enviar email.'
  } finally { carregando.value = false }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; background: var(--preto); }
.auth-card { background: var(--cinza-900); border: 1px solid var(--cinza-700); border-radius: var(--radius-lg); padding: 40px; width: 100%; max-width: 400px; }
.auth-logo { font-size: 2rem; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
.auth-logo span { font-family: var(--fonte-titulo); font-size: 1.6rem; color: var(--amarelo); }
.auth-card h2 { font-size: 1.3rem; margin-bottom: 8px; }
.auth-sub { font-size: 0.85rem; color: var(--cinza-400); margin-bottom: 24px; }
.auth-form { display: flex; flex-direction: column; gap: 16px; }
.auth-link { margin-top: 20px; text-align: center; font-size: 0.88rem; }
.auth-link a { color: var(--amarelo); text-decoration: none; font-weight: 600; }
.alerta { padding: 12px 16px; border-radius: var(--radius-sm); font-size: 0.85rem; margin-bottom: 16px; }
.alerta-erro { background: rgba(255,68,68,0.1); color: #ff8888; border: 1px solid rgba(255,68,68,0.3); }
.alerta-sucesso { background: rgba(34,197,94,0.1); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }
</style>
