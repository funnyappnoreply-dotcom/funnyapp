<template>
  <nav class="navbar-mobile">
    <div class="navbar-mobile-inner">

      <button class="navbar-btn" :class="{ ativo: $route.path === '/' }" @click="irFeed">
        <span class="nb-icon">🏠</span>
        <span>Feed</span>
      </button>

      <router-link to="/trending" class="navbar-btn" :class="{ ativo: $route.path === '/trending' }">
        <span class="nb-icon">🔥</span>
        <span>Trending</span>
      </router-link>

      <router-link v-if="auth.autenticado" to="/novo" class="navbar-btn postar">
        <span class="nb-icon">➕</span>
        <span>Postar</span>
      </router-link>
      <router-link v-else to="/login" class="navbar-btn postar">
        <span class="nb-icon">😂</span>
        <span>Entrar</span>
      </router-link>

      <button class="navbar-btn" :class="{ ativo: buscaAberta }" @click="buscaAberta = true">
        <span class="nb-icon">🔍</span>
        <span>Buscar</span>
      </button>

      <router-link v-if="auth.autenticado && isAdmin" to="/admin" class="navbar-btn" :class="{ ativo: $route.path === '/admin' }">
        <span class="nb-icon">🛡️</span>
        <span>Admin</span>
      </router-link>
      <router-link v-else-if="auth.autenticado" to="/perfil" class="navbar-btn" :class="{ ativo: $route.path === '/perfil' }">
        <span class="nb-icon">👤</span>
        <span>Perfil</span>
      </router-link>
      <router-link v-else to="/registro" class="navbar-btn" :class="{ ativo: $route.path === '/registro' }">
        <span class="nb-icon">✏️</span>
        <span>Registrar</span>
      </router-link>
    </div>

    <!-- Modal de busca -->
    <div v-if="buscaAberta" class="busca-overlay" @click.self="fecharBusca">
      <div class="busca-modal">
        <div class="busca-header">
          <input
            ref="inputBusca"
            v-model="query"
            type="text"
            class="busca-input"
            placeholder="Buscar usuário..."
            @input="buscar"
          />
          <button class="busca-fechar" @click="fecharBusca">✕</button>
        </div>
        <div v-if="carregando" class="busca-status">Buscando...</div>
        <div v-else-if="query && resultados.length === 0" class="busca-status">Nenhum usuário encontrado.</div>
        <div class="busca-resultados">
          <router-link
            v-for="u in resultados"
            :key="u._id"
            :to="`/u/${u.username}`"
            class="busca-item"
            @click="fecharBusca"
          >
            <img v-if="u.avatar" :src="u.avatar" class="busca-avatar" />
            <div v-else class="busca-avatar-placeholder">{{ u.username[0].toUpperCase() }}</div>
            <div>
              <div class="busca-username">@{{ u.username }}</div>
              <div v-if="u.bio" class="busca-bio">{{ u.bio }}</div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useAuthStore } from '../store/auth'
import { useRouter, useRoute } from 'vue-router'
import api from '../services/api'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const isAdmin = computed(() => ['admin', 'superadmin'].includes(auth.usuario?.perfil))

const irFeed = () => {
  if (route.path === '/') {
    window.dispatchEvent(new CustomEvent('refresh-feed'))
  } else {
    router.push('/')
  }
}

const buscaAberta = ref(false)
const query = ref('')
const resultados = ref([])
const carregando = ref(false)
const inputBusca = ref(null)

let debounce = null
const buscar = () => {
  clearTimeout(debounce)
  if (!query.value.trim()) { resultados.value = []; return }
  carregando.value = true
  debounce = setTimeout(async () => {
    try {
      const { data } = await api.get(`/usuarios/buscar?q=${query.value}`)
      resultados.value = data.usuarios
    } catch {
      resultados.value = []
    } finally { carregando.value = false }
  }, 400)
}

const fecharBusca = () => {
  buscaAberta.value = false
  query.value = ''
  resultados.value = []
}

watch(buscaAberta, async (val) => {
  if (val) {
    await nextTick()
    inputBusca.value?.focus()
  }
})
</script>

<style scoped>
.navbar-mobile {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 56px;
  background: var(--cinza-900);
  border-top: 1px solid var(--cinza-700);
  z-index: 200;
  padding: 0;
  padding-bottom: env(safe-area-inset-bottom);
}
.navbar-mobile-inner {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100%;
  width: 100%;
}
.navbar-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  flex: 1;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--cinza-400);
  font-size: 0.6rem;
  font-weight: 500;
  padding: 6px 0;
  text-decoration: none;
  transition: color 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}
.nb-icon { font-size: 1.3rem; line-height: 1; }
.navbar-btn.ativo { color: var(--amarelo); }
.navbar-btn:hover { color: var(--branco); }
.navbar-btn.postar {
  color: var(--preto);
  background: var(--amarelo);
  border-radius: 9999px;
  padding: 8px 16px;
  flex: 0 0 auto;
  min-width: 70px;
}
.busca-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 300;
  display: flex;
  align-items: flex-end;
}
.busca-modal {
  width: 100%;
  background: var(--cinza-900);
  border-top: 1px solid var(--cinza-700);
  border-radius: 16px 16px 0 0;
  padding: 16px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.busca-header { display: flex; gap: 10px; align-items: center; }
.busca-input {
  flex: 1;
  background: var(--cinza-800);
  border: 1px solid var(--cinza-600);
  border-radius: 999px;
  padding: 10px 16px;
  color: var(--branco);
  font-size: 0.95rem;
  outline: none;
}
.busca-input:focus { border-color: var(--amarelo); }
.busca-fechar {
  background: var(--cinza-700);
  border: none;
  color: var(--cinza-200);
  border-radius: 50%;
  width: 34px; height: 34px;
  cursor: pointer;
  font-size: 1rem;
  display: flex; align-items: center; justify-content: center;
}
.busca-status { text-align: center; color: var(--cinza-400); font-size: 0.85rem; padding: 12px 0; }
.busca-resultados { overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
.busca-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px; border-radius: var(--radius-md);
  text-decoration: none; color: var(--branco);
  transition: background 0.15s;
}
.busca-item:hover { background: var(--cinza-800); }
.busca-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.busca-avatar-placeholder {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--cinza-700);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; font-weight: 700; flex-shrink: 0;
}
.busca-username { font-size: 0.9rem; font-weight: 600; }
.busca-bio { font-size: 0.78rem; color: var(--cinza-400); margin-top: 2px; }
@media (max-width: 768px) {
  .navbar-mobile { display: flex; }
}
</style>
