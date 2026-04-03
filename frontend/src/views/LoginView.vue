<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">😂 <span>FunnyApp</span></div>
      <h2>Entrar na conta</h2>

      <div v-if="erro" class="alerta alerta-erro">{{ erro }}</div>

      <form @submit.prevent="entrar" class="auth-form">
        <div class="form-group">
          <label class="form-label">E-mail</label>
          <input v-model="form.email" type="email" class="form-input" placeholder="seu@email.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">Senha</label>
          <div class="input-senha-wrap">
            <input
              v-model="form.senha"
              :type="mostrarSenha ? 'text' : 'password'"
              class="form-input input-senha"
              placeholder="••••••"
              required
            />
            <button type="button" class="btn-olho" @click="mostrarSenha = !mostrarSenha">
              {{ mostrarSenha ? '🙈' : '👁️' }}
            </button>
          </div>
          <div style="text-align:right;margin-top:4px">
            <router-link to="/esqueci-senha" class="link-esqueci">Esqueci minha senha</router-link>
          </div>
        </div>
        <button type="submit" class="btn btn-amarelo btn-full btn-lg" :disabled="auth.carregando">
          <span v-if="auth.carregando" class="spinner" style="border-top-color:var(--preto)"></span>
          <span v-else>Entrar</span>
        </button>
      </form>

      <div class="auth-link">
        Não tem conta? <router-link to="/registro">Criar grátis</router-link>
      </div>

      <div class="auth-termos">
        <router-link to="/termos">Termos de Uso</router-link>
        •
        <router-link to="/privacidade">Privacidade</router-link>
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
const mostrarSenha = ref(false)
const form = ref({ email: '', senha: '' })

const entrar = async () => {
  erro.value = null
  const r = await auth.login(form.value.email, form.value.senha)
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
.auth-termos { margin-top: 16px; text-align: center; font-size: 0.78rem; color: var(--cinza-600); display: flex; align-items: center; justify-content: center; gap: 8px; }
.auth-termos a { color: var(--cinza-500); text-decoration: none; }
.auth-termos a:hover { color: var(--cinza-200); }
.alerta { padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.85rem; margin-bottom: 4px; }
.alerta-erro { background: rgba(255,68,68,0.1); color: #ff8888; border: 1px solid rgba(255,68,68,0.3); }
.input-senha-wrap { position: relative; display: flex; align-items: center; }
.input-senha { padding-right: 44px; }
.btn-olho { position: absolute; right: 10px; background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 4px; line-height: 1; color: var(--cinza-400); transition: color var(--transition); }
.btn-olho:hover { color: var(--branco); }
.link-esqueci { font-size: 0.78rem; color: var(--cinza-400); text-decoration: none; }
.link-esqueci:hover { color: var(--amarelo); }
</style>
