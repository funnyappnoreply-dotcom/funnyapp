<template>
  <div class="feed-page">
    <div class="feed-header">
      <h1>👥 Seguindo</h1>
    </div>

    <div v-if="carregando" class="loading-wrap">
      <div class="spinner" style="width:32px;height:32px;border-width:3px"></div>
    </div>

    <div v-else-if="posts.length === 0" class="vazio">
      <div class="vazio-icon">🔭</div>
      <p>Nenhum post de quem você segue ainda.</p>
      <router-link to="/" class="btn btn-outline" style="margin-top:16px">Explorar feed</router-link>
    </div>

    <div v-else class="posts-grid">
      <PostCard v-for="post in posts" :key="post._id" :post="post" @deletar="deletar" />
    </div>

    <div v-if="temMais" class="carregar-mais">
      <button class="btn btn-outline" @click="carregarMais" :disabled="carregando">Carregar mais</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PostCard from '../components/PostCard.vue'
import api from '../services/api'

const posts = ref([])
const carregando = ref(true)
const pagina = ref(1)
const temMais = ref(false)

const carregar = async () => {
  try {
    const { data } = await api.get('/posts/seguindo', { params: { pagina: pagina.value } })
    posts.value = [...posts.value, ...data.posts]
    temMais.value = pagina.value < data.paginacao.totalPaginas
  } finally { carregando.value = false }
}

const carregarMais = () => { pagina.value++; carregar() }
const deletar = (id) => { posts.value = posts.value.filter(p => p._id !== id) }

onMounted(carregar)
</script>

<style scoped>
.feed-page { max-width: 680px; margin: 0 auto; padding: 24px 16px; }
.feed-header { margin-bottom: 24px; }
.feed-header h1 { font-family: var(--fonte-titulo); font-size: 1.5rem; }
.posts-grid { display: flex; flex-direction: column; gap: 16px; }
.loading-wrap { display: flex; justify-content: center; padding: 60px; }
.vazio { text-align: center; padding: 80px 20px; }
.vazio-icon { font-size: 4rem; margin-bottom: 12px; }
.vazio p { color: var(--cinza-400); }
.carregar-mais { display: flex; justify-content: center; margin-top: 24px; }
</style>
