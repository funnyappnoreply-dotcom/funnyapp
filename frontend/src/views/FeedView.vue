<template>
  <div class="feed-page">
    <div class="feed-header">
      <h1>Feed</h1>
      <div v-if="tag" class="tag-filtro">
        Filtrando: <span>#{{ tag }}</span>
        <button @click="limparTag">×</button>
      </div>
    </div>
    <div v-if="carregando && posts.length === 0" class="loading-wrap">
      <div class="spinner" style="width:32px;height:32px;border-width:3px"></div>
    </div>
    <div v-else-if="posts.length === 0" class="vazio">
      <div class="vazio-icon">😶</div>
      <p>Nenhum post ainda. Seja o primeiro!</p>
      <router-link to="/novo" class="btn btn-amarelo" style="margin-top:16px">Postar agora</router-link>
    </div>
    <div v-else class="posts-grid">
      <PostCard
        v-for="post in posts"
        :key="post._id"
        :post="post"
        @deletar="deletarPost"
      />
    </div>
    <div v-if="temMais" class="carregar-mais">
      <button class="btn btn-outline" @click="carregarMais" :disabled="carregando">
        <span v-if="carregando" class="spinner"></span>
        <span v-else>Carregar mais</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PostCard from '../components/PostCard.vue'
import api from '../services/api'

const route = useRoute()
const router = useRouter()
const posts = ref([])
const carregando = ref(false)
const pagina = ref(1)
const temMais = ref(false)
const tag = ref(route.query.tag || '')

const carregar = async (reset = false) => {
  if (reset) { pagina.value = 1; posts.value = [] }
  carregando.value = true
  try {
    const params = { pagina: pagina.value, limite: 12 }
    if (tag.value) params.tag = tag.value
    const { data } = await api.get('/posts', { params })
    const novos = data.posts.sort(() => Math.random() - 0.5)
    posts.value = reset ? novos : [...posts.value, ...novos]
    temMais.value = pagina.value < data.paginacao.totalPaginas
  } finally { carregando.value = false }
}

const carregarMais = () => { pagina.value++; carregar() }
const limparTag = () => { tag.value = ''; router.push('/'); carregar(true) }

const deletarPost = async (id) => {
  if (!confirm('Deletar este post?')) return
  try {
    await api.delete(`/posts/${id}`)
    posts.value = posts.value.filter(p => p._id !== id)
  } catch {}
}

watch(() => route.query.tag, (nova) => { tag.value = nova || ''; carregar(true) })

const refreshFeed = () => carregar(true)
window.addEventListener('refresh-feed', refreshFeed)

onMounted(() => carregar())
onUnmounted(() => window.removeEventListener('refresh-feed', refreshFeed))
</script>

<style scoped>
.feed-page { max-width: 680px; margin: 0 auto; padding: 24px 16px; }
.feed-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.feed-header h1 { font-family: var(--fonte-titulo); font-size: 1.5rem; }
.tag-filtro { display: flex; align-items: center; gap: 8px; background: var(--cinza-800); padding: 6px 12px; border-radius: var(--radius-full); font-size: 0.85rem; color: var(--amarelo); }
.tag-filtro button { background: none; border: none; cursor: pointer; color: var(--cinza-400); font-size: 1rem; line-height: 1; }
.posts-grid { display: flex; flex-direction: column; gap: 16px; }
.loading-wrap { display: flex; justify-content: center; padding: 60px; }
.vazio { text-align: center; padding: 80px 20px; }
.vazio-icon { font-size: 4rem; margin-bottom: 12px; }
.vazio p { color: var(--cinza-400); }
.carregar-mais { display: flex; justify-content: center; margin-top: 24px; }
</style>
