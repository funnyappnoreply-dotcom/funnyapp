<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">😂 <span>FunnyApp</span></div>
      <h2>Criar conta grátis</h2>

      <div v-if="erro" class="alerta alerta-erro">{{ erro }}</div>

      <form @submit.prevent="registrar" class="auth-form">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input v-model="form.username" type="text" class="form-input" placeholder="seunome123" required minlength="3" maxlength="20" />
          <span class="form-error" v-if="form.username && !/^[a-zA-Z0-9_]+$/.test(form.username)">
            Só letras, números e _
          </span>
        </div>
        <div class="form-group">
          <label class="form-label">E-mail</label>
          <input v-model="form.email" type="email" class="form-input" placeholder="seu@email.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">Senha</label>
          <input v-model="form.senha" type="password" class="form-input" placeholder="Mínimo 6 caracteres" required minlength="6" />
        </div>
        <button type="submit" class="btn btn-amarelo btn-full btn-lg" :disabled="auth.carregando">
          <span v-if="auth.carregando" class="spinner" style="border-top-color:var(--preto)"></span>
          <span v-else>Criar conta</span>
        </button>
      </form>

      <div class="auth-link">
        Já tem conta? <router-link to="/login">Entrar</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const auth = useAuthStore()
const router = useRouter()
const erro = ref(null)
const form = ref({ username: '', email: '', senha: '' })

const registrar = async () => {
  erro.value = null
  const r = await auth.registrar(form.value)
  if (r.sucesso) router.push('/')
  else erro.value = r.erro
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; background: var(--preto); }
.auth-card { background: var(--cinza-900); border: 1px solid var(--cinza-700); border-radius: var(--radius-lg); padding: 40px; width: 100%; max-width: 400px; }
.auth-logo { font-size: 2rem; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
.auth-logo span { font-family: var(--fonte-titulo); font-size: 1.6rem; color: var(--amarelo); }
.auth-card h2 { font-size: 1.3rem; margin-bottom: 24px; color: var(--cinza-200); font-weight: 500; }
.auth-form { display: flex; flex-direction: column; gap: 16px; }
.auth-link { margin-top: 20px; text-align: center; font-size: 0.88rem; color: var(--cinza-400); }
.auth-link a { color: var(--amarelo); text-decoration: none; font-weight: 600; }
</style>
