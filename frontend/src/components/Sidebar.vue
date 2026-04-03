<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <span class="logo-emoji">😂</span>
      <span class="logo-texto">FunnyApp</span>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/" class="nav-item" :class="{ ativo: $route.path === '/' }">
        <span class="nav-icon">🏠</span> Feed
      </router-link>
      <router-link to="/trending" class="nav-item" :class="{ ativo: $route.path === '/trending' }">
        <span class="nav-icon">🔥</span> Trending
      </router-link>
      <router-link v-if="auth.autenticado" to="/seguindo" class="nav-item" :class="{ ativo: $route.path === '/seguindo' }">
        <span class="nav-icon">👥</span> Seguindo
      </router-link>
      <router-link v-if="auth.autenticado" to="/novo" class="nav-item destaque">
        <span class="nav-icon">➕</span> Postar
      </router-link>
      <router-link v-if="isAdmin" to="/admin" class="nav-item admin" :class="{ ativo: $route.path === '/admin' }">
        <span class="nav-icon">🛡️</span> Painel Admin
      </router-link>
    </nav>

    <div class="sidebar-busca">
      <input v-model="buscaQuery" type="text" class="form-input busca-input" placeholder="🔍 Buscar usuário..." @input="buscar" />
      <div v-if="resultados.length" class="busca-resultados">
        <router-link v-for="u in resultados" :key="u._id" :to="`/u/${u.username}`" class="busca-item" @click="limparBusca">
          <div class="avatar-placeholder" style="width:30px;height:30px;font-size:0.75rem">{{ u.username[0].toUpperCase() }}</div>
          <span>@{{ u.username }}</span>
          <span v-if="u.perfil !== 'usuario'" class="busca-badge">{{ u.perfil }}</span>
        </router-link>
      </div>
    </div>

    <div class="sidebar-footer">
      <template v-if="auth.autenticado">
        <router-link to="/perfil" class="footer-usuario">
          <div class="avatar-placeholder" style="width:36px;height:36px;font-size:0.9rem">{{ auth.usuario?.username?.[0]?.toUpperCase() }}</div>
          <div class="footer-info">
            <div class="footer-nome">@{{ auth.usuario?.username }}</div>
            <div v-if="isAdmin" class="footer-perfil">{{ auth.usuario?.perfil === 'superadmin' ? '⭐ Super Admin' : '🛡️ Admin' }}</div>
          </div>
        </router-link>
        <button class="btn-sair" @click="sair" title="Sair">⏻</button>
      </template>
      <template v-else>
        <div class="footer-auth">
          <router-link to="/login" class="btn btn-amarelo btn-full">Entrar</router-link>
          <router-link to="/registro" class="btn btn-outline btn-full" style="margin-top:8px">Criar conta</router-link>
        </div>
      </template>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import api from '../services/api'

const auth = useAuthStore()
const router = useRouter()
const buscaQuery = ref('')
const resultados = ref([])
let timer = null

const isAdmin = computed(() => ['admin', 'superadmin'].includes(auth.usuario?.perfil))

const buscar = () => {
  clearTimeout(timer)
  if (!buscaQuery.value.trim()) { resultados.value = []; return }
  timer = setTimeout(async () => {
    try {
      const { data } = await api.get(`/usuarios/buscar?q=${buscaQuery.value}`)
      resultados.value = data.usuarios
    } catch {}
  }, 300)
}

const limparBusca = () => { buscaQuery.value = ''; resultados.value = [] }
const sair = () => { auth.logout(); router.push('/login') }
</script>

<style scoped>
.sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 24px 20px 16px; }
.logo-emoji { font-size: 1.8rem; }
.logo-texto { font-family: var(--fonte-titulo); font-size: 1.3rem; font-weight: 700; color: var(--amarelo); }

.sidebar-nav { display: flex; flex-direction: column; gap: 4px; padding: 8px 12px; flex: 1; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: var(--radius-sm); text-decoration: none; font-size: 0.92rem; font-weight: 500; color: var(--cinza-200); transition: all var(--transition); }
.nav-item:hover, .nav-item.ativo { background: var(--cinza-800); color: var(--branco); }
.nav-item.destaque { background: var(--amarelo); color: var(--preto); margin-top: 8px; font-weight: 700; }
.nav-item.destaque:hover { background: var(--amarelo-hover); }
.nav-item.admin { background: rgba(99,102,241,0.15); color: #a5b4fc; margin-top: 4px; }
.nav-item.admin:hover, .nav-item.admin.ativo { background: rgba(99,102,241,0.25); color: #c7d2fe; }
.nav-icon { font-size: 1.1rem; }

.sidebar-busca { padding: 0 12px 12px; position: relative; }
.busca-input { font-size: 0.83rem; padding: 8px 12px; }
.busca-resultados { position: absolute; top: 100%; left: 12px; right: 12px; background: var(--cinza-800); border: 1px solid var(--cinza-600); border-radius: var(--radius-sm); z-index: 200; overflow: hidden; }
.busca-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; text-decoration: none; color: var(--branco); font-size: 0.85rem; transition: background var(--transition); }
.busca-item:hover { background: var(--cinza-700); }
.busca-badge { margin-left: auto; font-size: 0.65rem; background: rgba(255,214,0,0.2); color: var(--amarelo); padding: 2px 6px; border-radius: 20px; }

.sidebar-footer { padding: 12px; border-top: 1px solid var(--cinza-700); display: flex; align-items: center; gap: 8px; }
.footer-auth { width: 100%; }
.footer-usuario { display: flex; align-items: center; gap: 10px; text-decoration: none; flex: 1; min-width: 0; }
.footer-info { min-width: 0; }
.footer-nome { font-size: 0.82rem; font-weight: 600; color: var(--branco); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.footer-perfil { font-size: 0.72rem; color: var(--amarelo); margin-top: 1px; }
.btn-sair { background: none; border: none; cursor: pointer; font-size: 1.1rem; color: var(--cinza-400); padding: 6px; border-radius: var(--radius-sm); transition: all var(--transition); }
.btn-sair:hover { color: var(--vermelho); background: rgba(255,68,68,0.1); }
</style>
