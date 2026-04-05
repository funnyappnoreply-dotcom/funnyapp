<template>
  <div class="feed-page">
    <div class="feed-header">
      <h1>Feed</h1>
      <div class="header-direita">
        <div v-if="tag" class="tag-filtro">
          Filtrando: <span>#{{ tag }}</span>
          <button @click="limparTag">×</button>
        </div>
        <!-- Lupa -->
        <button class="btn-lupa" @click="buscaAberta = !buscaAberta" :class="{ ativo: buscaAberta }">🔍</button>
      </div>
    </div>

    <!-- Painel de busca (aparece abaixo do header) -->
    <div v-if="buscaAberta" class="busca-painel">
      <input
        ref="inputBusca"
        v-model="query"
        type="text"
        class="busca-input"
        placeholder="Buscar usuário..."
        @input="buscar"
      />
      <div v-if="buscando" class="busca-status">Buscando...</div>
      <div v-else-if="query && resultados.length === 0" class="busca-status">Nenhum usuário encontrado.</div>
      <div class="busca-resultados">
        <router-link
          v-for="u in resultados"
          :key="u._id"
          :to="`/u/${u.username}`"
          class="busca-item"
          @click="buscaAberta = false; query = ''; resultados = []"
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
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
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

// Busca
const buscaAberta = ref(false)
const query = ref('')
const resultados = ref([])
const buscando = ref(false)
const inputBusca = ref(null)

let debounce = null
const buscar = () => {
  clearTimeout(debounce)
  if (!query.value.trim()) { resultados.value = []; return }
  buscando.value = true
  debounce = setTimeout(async () => {
    try {
      const { data } = await api.get(`/usuarios/buscar?q=${query.value}`)
      resultados.value = data.usuarios
    } catch {
      resultados.value = []
    } finally { buscando.value = false }
  }, 400)
}

watch(buscaAberta, async (val) => {
  if (val) {
    await nextTick()
    inputBusca.value?.focus()
  } else {
    query.value = ''
    resultados.value = []
  }
})

// Feed
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

.feed-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
  position: sticky; top: 0; z-index: 10;
  background: var(--preto);
  padding: 12px 0;
}
.feed-header h1 { font-family: var(--fonte-titulo); font-size: 1.5rem; }
.header-direita { display: flex; align-items: center; gap: 10px; }

.btn-lupa {
  background: var(--cinza-800); border: none; border-radius: 50%;
  width: 38px; height: 38px; font-size: 1.1rem;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.btn-lupa:hover, .btn-lupa.ativo { background: var(--cinza-700); }

.busca-painel {
  background: var(--cinza-900);
  border: 1px solid var(--cinza-700);
  border-radius: var(--radius-md);
  padding: 12px;
  margin-bottom: 16px;
  display: flex; flex-direction: column; gap: 8px;
}
.busca-input {
  width: 100%; background: var(--cinza-800);
  border: 1px solid var(--cinza-600); border-radius: 999px;
  padding: 10px 16px; color: var(--branco); font-size: 0.95rem; outline: none;
  box-sizing: border-box;
}
.busca-input:focus { border-color: var(--amarelo); }
.busca-status { text-align: center; color: var(--cinza-400); font-size: 0.85rem; padding: 8px 0; }
.busca-resultados { display: flex; flex-direction: column; gap: 4px; }
.busca-item {
  display: flex; align-items: center; gap: 12px;
  padding: 8px; border-radius: var(--radius-md);
  text-decoration: none; color: var(--branco); transition: background 0.15s;
}
.busca-item:hover { background: var(--cinza-800); }
.busca-avatar { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.busca-avatar-placeholder {
  width: 38px; height: 38px; border-radius: 50%;
  background: var(--cinza-700);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem; font-weight: 700; flex-shrink: 0;
}
.busca-username { font-size: 0.88rem; font-weight: 600; }
.busca-bio { font-size: 0.75rem; color: var(--cinza-400); margin-top: 2px; }

.tag-filtro { display: flex; align-items: center; gap: 8px; background: var(--cinza-800); padding: 6px 12px; border-radius: var(--radius-full); font-size: 0.85rem; color: var(--amarelo); }
.tag-filtro button { background: none; border: none; cursor: pointer; color: var(--cinza-400); font-size: 1rem; line-height: 1; }
.posts-grid { display: flex; flex-direction: column; gap: 16px; }
.loading-wrap { display: flex; justify-content: center; padding: 60px; }
.vazio { text-align: center; padding: 80px 20px; }
.vazio-icon { font-size: 4rem; margin-bottom: 12px; }
.vazio p { color: var(--cinza-400); }
.carregar-mais { display: flex; justify-content: center; margin-top: 24px; }
</style>
