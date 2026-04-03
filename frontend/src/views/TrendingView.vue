<template>
  <div class="feed-page">
    <div class="feed-header">
      <h1>🔥 Trending</h1>
      <span class="sub">Os posts mais curtidos</span>
    </div>

    <div v-if="carregando" class="loading-wrap">
      <div class="spinner" style="width:32px;height:32px;border-width:3px"></div>
    </div>

    <div v-else class="posts-grid">
      <PostCard v-for="post in posts" :key="post._id" :post="post" @deletar="deletar" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PostCard from '../components/PostCard.vue'
import api from '../services/api'

const posts = ref([])
const carregando = ref(true)

const deletar = (id) => { posts.value = posts.value.filter(p => p._id !== id) }

onMounted(async () => {
  try {
    const { data } = await api.get('/posts/trending')
    posts.value = data.posts
  } finally { carregando.value = false }
})
</script>

<style scoped>
.feed-page { max-width: 680px; margin: 0 auto; padding: 24px 16px; }
.feed-header { margin-bottom: 24px; }
.feed-header h1 { font-family: var(--fonte-titulo); font-size: 1.5rem; }
.sub { font-size: 0.85rem; color: var(--cinza-400); }
.posts-grid { display: flex; flex-direction: column; gap: 16px; }
.loading-wrap { display: flex; justify-content: center; padding: 60px; }
</style>
