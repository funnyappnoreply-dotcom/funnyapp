<template>
  <nav class="navbar-mobile">
    <div class="navbar-mobile-inner">
      <router-link to="/" class="navbar-btn" :class="{ ativo: $route.path === '/' }">
        <span class="nb-icon">🏠</span>
        <span>Feed</span>
      </router-link>

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

      <router-link v-if="auth.autenticado" to="/seguindo" class="navbar-btn" :class="{ ativo: $route.path === '/seguindo' }">
        <span class="nb-icon">👥</span>
        <span>Seguindo</span>
      </router-link>
      <router-link v-else to="/registro" class="navbar-btn" :class="{ ativo: $route.path === '/registro' }">
        <span class="nb-icon">✏️</span>
        <span>Registrar</span>
      </router-link>

      <router-link v-if="auth.autenticado && isAdmin" to="/admin" class="navbar-btn" :class="{ ativo: $route.path === '/admin' }">
        <span class="nb-icon">🛡️</span>
        <span>Admin</span>
      </router-link>
      <router-link v-else-if="auth.autenticado" to="/perfil" class="navbar-btn" :class="{ ativo: $route.path === '/perfil' }">
        <span class="nb-icon">👤</span>
        <span>Perfil</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../store/auth'

const auth = useAuthStore()
const isAdmin = computed(() => ['admin', 'superadmin'].includes(auth.usuario?.perfil))
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

.nb-icon {
  font-size: 1.3rem;
  line-height: 1;
}

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

@media (max-width: 768px) {
  .navbar-mobile { display: flex; }
}
</style>