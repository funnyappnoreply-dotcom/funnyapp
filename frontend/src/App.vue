<template>
  <div class="app-layout">
    <Sidebar />
    <main class="main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <NavbarMobile />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './store/auth'
import Sidebar from './components/Sidebar.vue'
import NavbarMobile from './components/NavbarMobile.vue'

const auth = useAuthStore()

// Ao abrir o app, verifica se tem cookie válido e busca os dados do usuário
onMounted(() => {
  auth.inicializar()
})
</script>
