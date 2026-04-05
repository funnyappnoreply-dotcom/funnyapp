<template>
  <div class="post-card">
    <div class="post-header">
      <router-link :to="`/u/${post.autor.username}`" class="autor-link">
        <img v-if="post.autor.avatar" :src="post.autor.avatar" class="avatar-img" />
        <div v-else class="avatar-placeholder" :style="avatarStyle">
          {{ post.autor.username[0].toUpperCase() }}
        </div>
        <div>
          <div class="autor-nome">
            @{{ post.autor.username }}
            <span v-if="post.autor.perfil === 'admin'" class="badge-admin">Admin</span>
            <span v-if="post.autor.perfil === 'superadmin'" class="badge-superadmin">Super Admin</span>
          </div>
          <div class="post-data">{{ formatarData(post.createdAt) }}</div>
        </div>
      </router-link>
      <div class="header-acoes">
        <button v-if="ehMeu || isAdmin" class="btn-acao-icon vermelho" @click="$emit('deletar', post._id)" title="Deletar post">🗑</button>
        <button v-if="auth.autenticado && !ehMeu" class="btn-acao-icon" @click="abrirDenuncia" title="Denunciar post">🚩</button>
      </div>
    </div>

    <!-- Vídeo fora do router-link para não bloquear controles -->
    <div class="post-midia-wrap" v-if="post.tipo === 'video' && post.video">
      <video
        :src="post.video"
        class="post-midia"
        controls
        playsinline
        preload="metadata"
      />
    </div>
    <!-- Imagem dentro do router-link -->
    <router-link v-else :to="`/post/${post._id}`">
      <div class="post-midia-wrap">
        <img
          :src="post.imagem"
          :alt="post.legenda || 'Post'"
          class="post-midia"
          loading="lazy"
        />
      </div>
    </router-link>

    <div class="post-acoes">
      <button :class="['btn-acao', { curtido: jaCurtiu }]" @click="curtir">
        <span>{{ jaCurtiu ? '❤️' : '🤍' }}</span>
        <span>{{ totalCurtidas }}</span>
      </button>
      <router-link :to="`/post/${post._id}`" class="btn-acao">
        <span>💬</span>
        <span>{{ post.comentarios?.length || 0 }}</span>
      </router-link>
      <div class="post-views">👁 {{ post.visualizacoes || 0 }}</div>
    </div>

    <div v-if="post.legenda" class="post-legenda">
      <span class="autor-bold">@{{ post.autor.username }}</span> {{ post.legenda }}
    </div>

    <div v-if="post.tags?.length" class="post-tags">
      <router-link v-for="tag in post.tags" :key="tag" :to="`/?tag=${tag}`" class="tag">#{{ tag }}</router-link>
    </div>

    <div v-if="modalDenuncia" class="modal-overlay" @click.self="modalDenuncia = false">
      <div class="modal-denuncia">
        <h3>🚩 Denunciar post</h3>
        <div v-if="denunciaEnviada" class="alerta alerta-sucesso">{{ denunciaEnviada }}</div>
        <div v-else>
          <div class="form-group">
            <label class="form-label">Motivo</label>
            <select v-model="motivoDenuncia" class="form-input">
              <option value="">Selecione...</option>
              <option value="spam">Spam</option>
              <option value="conteudo_inapropriado">Conteúdo inapropriado</option>
              <option value="discurso_odio">Discurso de ódio</option>
              <option value="violencia">Violência</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div class="form-group" style="margin-top:10px">
            <label class="form-label">Descrição (opcional)</label>
            <textarea v-model="descricaoDenuncia" class="form-input" style="min-height:70px;resize:none" placeholder="Descreva o problema..."></textarea>
          </div>
          <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end">
            <button class="btn btn-outline btn-sm" @click="modalDenuncia = false">Cancelar</button>
            <button class="btn btn-amarelo btn-sm" @click="enviarDenuncia" :disabled="!motivoDenuncia || enviandoDenuncia">
              <span v-if="enviandoDenuncia" class="spinner" style="border-top-color:black;width:14px;height:14px"></span>
              <span v-else>Enviar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../store/auth'
import api from '../services/api'

const props = defineProps({ post: { type: Object, required: true } })
const emit = defineEmits(['deletar'])

const auth = useAuthStore()
const totalCurtidas = ref(props.post.curtidas?.length || 0)
const jaCurtiu = ref(props.post.curtidas?.includes(auth.usuario?._id))
const modalDenuncia = ref(false)
const motivoDenuncia = ref('')
const descricaoDenuncia = ref('')
const enviandoDenuncia = ref(false)
const denunciaEnviada = ref('')

const ehMeu = computed(() => auth.usuario?._id === props.post.autor._id)
const isAdmin = computed(() => ['admin', 'superadmin'].includes(auth.usuario?.perfil))

const cores = ['#2a1a3e', '#1a2e3e', '#2e1a1a', '#1a3e2a', '#3e2a1a']
const avatarStyle = computed(() => {
  const idx = props.post.autor.username.charCodeAt(0) % cores.length
  return { width: '38px', height: '38px', fontSize: '1rem', background: cores[idx] }
})

const formatarData = (d) => {
  const diff = Date.now() - new Date(d)
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h`
  const dias = Math.floor(h / 24)
  if (dias < 7) return `${dias}d`
  return new Date(d).toLocaleDateString('pt-BR')
}

const curtir = async () => {
  if (!auth.autenticado) { window.location.href = '/login'; return }
  try {
    const { data } = await api.post(`/posts/${props.post._id}/curtir`)
    jaCurtiu.value = data.curtido
    totalCurtidas.value = data.total
  } catch {}
}

const abrirDenuncia = () => {
  motivoDenuncia.value = ''
  descricaoDenuncia.value = ''
  denunciaEnviada.value = ''
  modalDenuncia.value = true
}

const enviarDenuncia = async () => {
  if (!motivoDenuncia.value) return
  enviandoDenuncia.value = true
  try {
    const { data } = await api.post(`/posts/${props.post._id}/denunciar`, {
      motivo: motivoDenuncia.value,
      descricao: descricaoDenuncia.value
    })
    denunciaEnviada.value = data.message
    setTimeout(() => { modalDenuncia.value = false }, 2000)
  } catch (e) {
    denunciaEnviada.value = e.response?.data?.error || 'Erro ao enviar.'
  } finally { enviandoDenuncia.value = false }
}
</script>

<style scoped>
.post-card { background: var(--cinza-900); border: 1px solid var(--cinza-700); border-radius: var(--radius-md); overflow: hidden; transition: border-color var(--transition); }
.post-card:hover { border-color: var(--cinza-600); }
.post-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; }
.autor-link { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--branco); }
.autor-nome { font-size: 0.88rem; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.post-data { font-size: 0.75rem; color: var(--cinza-400); }
.badge-admin { font-size: 0.65rem; background: rgba(59,130,246,0.2); color: #60a5fa; padding: 2px 6px; border-radius: 20px; font-weight: 500; }
.badge-superadmin { font-size: 0.65rem; background: rgba(255,214,0,0.2); color: var(--amarelo); padding: 2px 6px; border-radius: 20px; font-weight: 500; }
.avatar-img { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; }
.header-acoes { display: flex; gap: 4px; }
.btn-acao-icon { background: none; border: none; cursor: pointer; font-size: 1rem; padding: 5px 8px; border-radius: var(--radius-sm); transition: all var(--transition); color: var(--cinza-400); }
.btn-acao-icon:hover { background: var(--cinza-800); color: var(--branco); }
.btn-acao-icon.vermelho:hover { background: rgba(255,68,68,0.15); color: var(--vermelho); }
.post-midia-wrap { width: 100%; background: var(--cinza-800); }
.post-midia { width: 100%; display: block; max-height: 600px; object-fit: contain; }
.post-acoes { display: flex; align-items: center; gap: 4px; padding: 10px 14px; }
.btn-acao { display: flex; align-items: center; gap: 5px; padding: 7px 12px; background: var(--cinza-800); border: none; border-radius: var(--radius-full); color: var(--cinza-200); font-size: 0.85rem; cursor: pointer; transition: all var(--transition); text-decoration: none; }
.btn-acao:hover { background: var(--cinza-700); color: var(--branco); }
.btn-acao.curtido { color: var(--vermelho); }
.post-views { margin-left: auto; font-size: 0.78rem; color: var(--cinza-400); }
.post-legenda { padding: 0 14px 8px; font-size: 0.88rem; color: var(--cinza-200); line-height: 1.5; }
.autor-bold { font-weight: 700; color: var(--branco); }
.post-tags { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 14px 12px; }
.tag { font-size: 0.8rem; color: var(--amarelo); text-decoration: none; }
.tag:hover { text-decoration: underline; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 20px; }
.modal-denuncia { background: var(--cinza-900); border: 1px solid var(--cinza-600); border-radius: var(--radius-lg); padding: 24px; width: 100%; max-width: 400px; }
.modal-denuncia h3 { font-size: 1rem; margin-bottom: 16px; }
.alerta { padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.85rem; }
.alerta-sucesso { background: rgba(34,197,94,0.1); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }
</style>
