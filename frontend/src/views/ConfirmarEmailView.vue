<template>
  <div class="auth-page">
    <div class="auth-card" style="text-align:center">
      <div class="auth-logo" style="justify-content:center">😂 <span>FunnyApp</span></div>

      <div v-if="carregando" style="padding:20px">
        <div class="spinner spinner-amarelo" style="width:40px;height:40px;border-width:3px;margin:0 auto"></div>
        <p style="margin-top:16px;color:var(--cinza-400)">Confirmando seu email...</p>
      </div>

      <div v-else-if="sucesso">
        <div style="font-size:3rem;margin:16px 0">✅</div>
        <h2>Email confirmado!</h2>
        <p style="color:var(--cinza-400);margin:12px 0 24px">Sua conta está ativa. Bem-vindo ao FunnyApp!</p>
        <router-link to="/" class="btn btn-amarelo btn-lg">Ir para o feed</router-link>
      </div>

      <div v-else>
        <div style="font-size:3rem;margin:16px 0">❌</div>
        <h2>Link inválido</h2>
        <p style="color:var(--cinza-400);margin:12px 0 24px">Este link de confirmação é inválido ou já foi usado.</p>
        <router-link to="/" class="btn btn-outline">Ir para o início</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const carregando = ref(true)
const sucesso = ref(false)

onMounted(async () => {
  try {
    await api.get(`/usuarios/confirmar-email/${route.params.token}`)
    sucesso.value = true
  } catch {
    sucesso.value = false
  } finally {
    carregando.value = false
  }
})
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; background: var(--preto); }
.auth-card { background: var(--cinza-900); border: 1px solid var(--cinza-700); border-radius: var(--radius-lg); padding: 40px; width: 100%; max-width: 400px; }
.auth-logo { font-size: 2rem; margin-bottom: 24px; display: flex; align-items: center; gap: 10px; }
.auth-logo span { font-family: var(--fonte-titulo); font-size: 1.6rem; color: var(--amarelo); }
.spinner-amarelo { border-color: rgba(255,214,0,0.2); border-top-color: var(--amarelo); }
</style>
