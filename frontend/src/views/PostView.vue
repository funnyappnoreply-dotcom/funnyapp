<template>
  <div class="post-page">
    <div v-if="carregando" class="loading-wrap">
      <div class="spinner" style="width:32px;height:32px;border-width:3px"></div>
    </div>

    <div v-else-if="!post" class="vazio">
      <p>Post não encontrado.</p>
      <router-link to="/" class="btn btn-outline" style="margin-top:16px">Voltar</router-link>
    </div>

    <div v-else>
      <button class="btn-voltar" @click="$router.back()">← Voltar</button>

      <div class="post-detalhe card">
        <div class="post-header">
          <router-link :to="`/u/${post.autor.username}`" class="autor-link">
            <img v-if="post.autor.avatar" :src="post.autor.avatar" class="avatar-img" />
            <div v-else class="avatar-placeholder" style="width:42px;height:42px;font-size:1rem;background:var(--cinza-700)">
              {{ post.autor.username[0].toUpperCase() }}
            </div>
            <div>
              <div class="autor-nome">@{{ post.autor.username }}</div>
              <div class="post-data">{{ formatarData(post.createdAt) }}</div>
            </div>
          </router-link>
        </div>

        <img :src="post.imagem" :alt="post.legenda" class="post-imagem" />

        <div class="post-acoes">
          <button :class="['btn-acao', { curtido: jaCurtiu }]" @click="curtir">
            {{ jaCurtiu ? '❤️' : '🤍' }} {{ totalCurtidas }}
          </button>
          <span class="post-views">👁 {{ post.visualizacoes }}</span>
        </div>

        <div v-if="post.legenda" class="post-legenda">
          <span class="autor-bold">@{{ post.autor.username }}</span> {{ post.legenda }}
        </div>

        <div v-if="post.tags?.length" class="post-tags">
          <router-link v-for="tag in post.tags" :key="tag" :to="`/?tag=${tag}`" class="tag">#{{ tag }}</router-link>
        </div>

        <div class="comentarios-section">
          <h3>Comentários ({{ post.comentarios?.length || 0 }})</h3>

          <div v-if="auth.autenticado" class="comentar-form">
            <input v-model="novoComentario" type="text" class="form-input" placeholder="Adicione um comentário..." maxlength="300" @keyup.enter="comentar" />
            <button class="btn btn-amarelo btn-sm" @click="comentar" :disabled="enviando || !novoComentario.trim()">
              <span v-if="enviando" class="spinner" style="border-top-color:var(--preto)"></span>
              <span v-else>Enviar</span>
            </button>
          </div>
          <div v-else class="comentar-login">
            <router-link to="/login">Entre para comentar</router-link>
          </div>

          <div class="comentarios-lista">
            <div v-for="c in post.comentarios" :key="c._id" class="comentario">
              <img v-if="c.autor?.avatar" :src="c.autor.avatar" class="avatar-img-sm" />
              <div v-else class="avatar-placeholder" style="width:30px;height:30px;font-size:0.75rem;background:var(--cinza-700);flex-shrink:0">
                {{ c.autor?.username?.[0]?.toUpperCase() }}
              </div>
              <div class="comentario-conteudo">
                <span class="comentario-autor">@{{ c.autor?.username }}</span>
                <span class="comentario-texto">{{ c.texto }}</span>
              </div>
              <button v-if="auth.usuario?._id === c.autor?._id || auth.usuario?._id === post.autor?._id" class="btn-del-comentario" @click="deletarComentario(c._id)">×</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../store/auth'
import api from '../services/api'

const route = useRoute()
const auth = useAuthStore()
const post = ref(null)
const carregando = ref(true)
const novoComentario = ref('')
const enviando = ref(false)
const jaCurtiu = ref(false)
const totalCurtidas = ref(0)

const formatarData = (d) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

const curtir = async () => {
  if (!auth.autenticado) { window.location.href = '/login'; return }
  try {
    const { data } = await api.post(`/posts/${post.value._id}/curtir`)
    jaCurtiu.value = data.curtido
    totalCurtidas.value = data.total
  } catch {}
}

const comentar = async () => {
  if (!novoComentario.value.trim()) return
  enviando.value = true
  try {
    const { data } = await api.post(`/posts/${post.value._id}/comentarios`, { texto: novoComentario.value })
    post.value.comentarios.push(data.comentario)
    novoComentario.value = ''
  } catch {} finally { enviando.value = false }
}

const deletarComentario = async (cid) => {
  try {
    await api.delete(`/posts/${post.value._id}/comentarios/${cid}`)
    post.value.comentarios = post.value.comentarios.filter(c => c._id !== cid)
  } catch {}
}

onMounted(async () => {
  try {
    const { data } = await api.get(`/posts/${route.params.id}`)
    post.value = data.post
    totalCurtidas.value = data.post.curtidas?.length || 0
    jaCurtiu.value = data.post.curtidas?.includes(auth.usuario?._id)
  } finally { carregando.value = false }
})
</script>

<style scoped>
.post-page { max-width: 680px; margin: 0 auto; padding: 24px 16px; }
.btn-voltar { background: none; border: none; color: var(--cinza-200); cursor: pointer; font-size: 0.9rem; margin-bottom: 16px; padding: 0; transition: color var(--transition); }
.btn-voltar:hover { color: var(--branco); }
.post-detalhe { overflow: hidden; }
.post-header { display: flex; align-items: center; padding: 14px 16px; }
.autor-link { display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--branco); }
.autor-nome { font-weight: 700; font-size: 0.95rem; }
.post-data { font-size: 0.78rem; color: var(--cinza-400); }
.avatar-img { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; }
.avatar-img-sm { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.post-imagem { width: 100%; display: block; max-height: 700px; object-fit: contain; background: var(--cinza-800); }
.post-acoes { display: flex; align-items: center; gap: 12px; padding: 12px 16px; }
.btn-acao { background: var(--cinza-800); border: none; border-radius: var(--radius-full); padding: 8px 16px; cursor: pointer; font-size: 0.9rem; color: var(--cinza-200); transition: all var(--transition); }
.btn-acao:hover { background: var(--cinza-700); color: var(--branco); }
.btn-acao.curtido { color: var(--vermelho); }
.post-views { margin-left: auto; font-size: 0.8rem; color: var(--cinza-400); }
.post-legenda { padding: 0 16px 10px; font-size: 0.9rem; color: var(--cinza-200); }
.autor-bold { font-weight: 700; color: var(--branco); margin-right: 6px; }
.post-tags { display: flex; gap: 8px; padding: 0 16px 12px; flex-wrap: wrap; }
.tag { font-size: 0.82rem; color: var(--amarelo); text-decoration: none; }
.comentarios-section { border-top: 1px solid var(--cinza-700); padding: 16px; }
.comentarios-section h3 { font-size: 0.95rem; margin-bottom: 14px; color: var(--cinza-200); }
.comentar-form { display: flex; gap: 8px; margin-bottom: 20px; }
.comentar-form .form-input { flex: 1; }
.comentar-login { font-size: 0.85rem; color: var(--cinza-400); margin-bottom: 16px; }
.comentar-login a { color: var(--amarelo); }
.comentarios-lista { display: flex; flex-direction: column; gap: 12px; }
.comentario { display: flex; align-items: flex-start; gap: 10px; }
.comentario-conteudo { flex: 1; font-size: 0.88rem; }
.comentario-autor { font-weight: 700; color: var(--branco); margin-right: 6px; }
.comentario-texto { color: var(--cinza-200); }
.btn-del-comentario { background: none; border: none; cursor: pointer; color: var(--cinza-400); font-size: 1rem; padding: 2px 6px; transition: color var(--transition); }
.btn-del-comentario:hover { color: var(--vermelho); }
.loading-wrap { display: flex; justify-content: center; padding: 80px; }
.vazio { text-align: center; padding: 80px; }
</style>
