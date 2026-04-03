<template>
  <div v-if="auth.autenticado" class="app-layout">
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

  <div v-else>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <NavbarMobile />
  </div>
</template>

<script setup>
import { useAuthStore } from './store/auth'
import Sidebar from './components/Sidebar.vue'
import NavbarMobile from './components/NavbarMobile.vue'
const auth = useAuthStore()
</script>
