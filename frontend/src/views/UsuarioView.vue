<template>
  <div class="usuario-page">
    <div v-if="carregando" class="loading-wrap">
      <div class="spinner" style="width:32px;height:32px;border-width:3px"></div>
    </div>

    <div v-else-if="!usuario" class="vazio">
      <p>Usuário não encontrado.</p>
    </div>

    <div v-else>
      <!-- Perfil header -->
      <div class="perfil-header card">
        <div class="avatar-wrap" style="width:80px;height:80px;flex-shrink:0">
          <img
            v-if="usuario.avatar"
            :src="usuario.avatar"
            :alt="usuario.username"
            style="width:80px;height:80px;border-radius:50%;object-fit:cover"
          />
          <div
            v-else
            class="avatar-placeholder"
            style="width:80px;height:80px;font-size:2rem;background:var(--cinza-700);border-radius:50%;display:flex;align-items:center;justify-content:center"
          >
            {{ usuario.username[0].toUpperCase() }}
          </div>
        </div>
        <div class="perfil-info">
          <h1>@{{ usuario.username }}</h1>
          <p v-if="usuario.bio" class="bio">{{ usuario.bio }}</p>
          <div class="perfil-stats">
            <div class="stat"><strong>{{ posts.length }}</strong><span>posts</span></div>
            <div class="stat"><strong>{{ usuario.seguidores?.length || 0 }}</strong><span>seguidores</span></div>
            <div class="stat"><strong>{{ usuario.seguindo?.length || 0 }}</strong><span>seguindo</span></div>
          </div>
        </div>
        <button v-if="auth.autenticado && !ehMeu" :class="['btn', seguindo ? 'btn-outline' : 'btn-amarelo']" @click="seguirUsuario" :disabled="seguindoLoading">
          <span v-if="seguindoLoading" class="spinner" :style="{ borderTopColor: seguindo ? 'white' : 'black' }"></span>
          <span v-else>{{ seguindo ? 'Seguindo' : 'Seguir' }}</span>
        </button>
        <router-link v-if="ehMeu" to="/perfil" class="btn btn-outline btn-sm">Editar perfil</router-link>
      </div>

      <!-- Grid de posts -->
      <div v-if="posts.length === 0" class="vazio" style="margin-top:32px">
        <div class="vazio-icon">📭</div>
        <p>Nenhum post ainda.</p>
      </div>

      <div v-else class="posts-grid">
        <router-link v-for="post in posts" :key="post._id" :to="`/post/${post._id}`" class="grid-item">
          <img :src="post.imagem" :alt="post.legenda" />
          <div class="grid-overlay">
            <span>❤️ {{ post.curtidas?.length || 0 }}</span>
            <span>💬 {{ post.comentarios?.length || 0 }}</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../store/auth'
import api from '../services/api'

const route = useRoute()
const auth = useAuthStore()
const usuario = ref(null)
const posts = ref([])
const carregando = ref(true)
const seguindo = ref(false)
const seguindoLoading = ref(false)

const ehMeu = computed(() => auth.usuario?.username === route.params.username)

const seguirUsuario = async () => {
  seguindoLoading.value = true
  try {
    const { data } = await api.post(`/usuarios/${usuario.value._id}/seguir`)
    seguindo.value = data.seguindo
    if (data.seguindo) usuario.value.seguidores.push(auth.usuario._id)
    else usuario.value.seguidores = usuario.value.seguidores.filter(id => id !== auth.usuario._id)
  } finally { seguindoLoading.value = false }
}

onMounted(async () => {
  try {
    const [uResp, pResp] = await Promise.all([
      api.get(`/usuarios/${route.params.username}`),
      api.get(`/posts/usuario/${route.params.username}`)
    ])
    usuario.value = uResp.data.usuario
    posts.value = pResp.data.posts
    seguindo.value = usuario.value.seguidores?.some(s =>
      (s._id || s) === auth.usuario?._id
    )
  } finally { carregando.value = false }
})
</script>

<style scoped>
.usuario-page { max-width: 680px; margin: 0 auto; padding: 24px 16px; }
.perfil-header { display: flex; align-items: flex-start; gap: 20px; padding: 24px; margin-bottom: 24px; flex-wrap: wrap; }
.perfil-info { flex: 1; }
.perfil-info h1 { font-family: var(--fonte-titulo); font-size: 1.3rem; margin-bottom: 6px; }
.bio { color: var(--cinza-200); font-size: 0.88rem; margin-bottom: 12px; }
.perfil-stats { display: flex; gap: 24px; }
.stat { display: flex; flex-direction: column; align-items: center; }
.stat strong { font-size: 1.1rem; font-weight: 700; }
.stat span { font-size: 0.75rem; color: var(--cinza-400); }

.posts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
.grid-item { position: relative; aspect-ratio: 1; overflow: hidden; display: block; }
.grid-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s; }
.grid-item:hover img { transform: scale(1.05); }
.grid-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; gap: 16px; opacity: 0; transition: opacity 0.2s; font-size: 0.9rem; font-weight: 600; }
.grid-item:hover .grid-overlay { opacity: 1; }

.loading-wrap { display: flex; justify-content: center; padding: 80px; }
.vazio { text-align: center; padding: 60px; color: var(--cinza-400); }
.vazio-icon { font-size: 3rem; margin-bottom: 12px; }
</style>
