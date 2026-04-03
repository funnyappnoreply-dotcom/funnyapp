<template>
  <div class="perfil-page">
    <div class="perfil-card card">
      <h2>Meu Perfil</h2>

      <div v-if="sucesso" class="alerta alerta-sucesso">{{ sucesso }}</div>
      <div v-if="erro" class="alerta alerta-erro">{{ erro }}</div>

      <div class="avatar-section">
        <div class="avatar-wrapper" @click="triggerUpload">
          <img v-if="auth.usuario?.avatar" :src="auth.usuario.avatar" class="avatar-grande" />
          <div v-else class="avatar-grande avatar-placeholder" style="width:80px;height:80px;font-size:2rem;background:var(--cinza-700)">
            {{ auth.usuario?.username?.[0]?.toUpperCase() }}
          </div>
          <div class="avatar-overlay">
            <span>📷</span>
          </div>
        </div>
        <input ref="inputFoto" type="file" accept="image/jpeg,image/png,image/gif,image/webp" style="display:none" @change="uploadAvatar" />
        <div class="avatar-info">
          <div class="username">@{{ auth.usuario?.username }}</div>
          <div class="email">{{ auth.usuario?.email }}</div>
          <div v-if="isAdmin" class="perfil-badge">{{ auth.usuario?.perfil === 'superadmin' ? '⭐ Super Admin' : '🛡️ Admin' }}</div>
          <button class="btn-trocar-foto" @click="triggerUpload" :disabled="enviandoFoto">
            <span v-if="enviandoFoto" class="spinner" style="border-top-color:var(--amarelo)"></span>
            <span v-else>Trocar foto</span>
          </button>
        </div>
      </div>

      <form @submit.prevent="salvar">
        <div class="form-group">
          <label class="form-label">Bio</label>
          <textarea v-model="form.bio" class="form-textarea" placeholder="Fale um pouco sobre você..." maxlength="150"></textarea>
          <span style="font-size:0.75rem;color:var(--cinza-400);text-align:right">{{ form.bio.length }}/150</span>
        </div>

        <button type="submit" class="btn btn-amarelo btn-full" style="margin-top:16px" :disabled="salvando">
          <span v-if="salvando" class="spinner" style="border-top-color:var(--preto)"></span>
          <span v-else>Salvar alterações</span>
        </button>
      </form>

      <button class="btn-sair-mobile" @click="sair">⏻ Sair da conta</button>

      <div class="posts-section">
        <h3>Meus posts ({{ meusPosts.length }})</h3>
        <div v-if="meusPosts.length === 0" class="vazio">
          <p>Nenhum post ainda.</p>
          <router-link to="/novo" class="btn btn-outline btn-sm" style="margin-top:10px">Criar post</router-link>
        </div>
        <div v-else class="posts-grid">
          <router-link v-for="post in meusPosts" :key="post._id" :to="`/post/${post._id}`" class="grid-item">
            <img :src="post.imagem" />
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import api from '../services/api'

const auth = useAuthStore()
const router = useRouter()
const form = ref({ bio: auth.usuario?.bio || '' })
const salvando = ref(false)
const enviandoFoto = ref(false)
const sucesso = ref(null)
const erro = ref(null)
const meusPosts = ref([])
const inputFoto = ref(null)

const isAdmin = computed(() => ['admin', 'superadmin'].includes(auth.usuario?.perfil))

const triggerUpload = () => inputFoto.value?.click()

const uploadAvatar = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  enviandoFoto.value = true
  sucesso.value = null
  erro.value = null
  try {
    const formData = new FormData()
    formData.append('avatar', file)
    const { data } = await api.put('/usuarios/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    auth.atualizarUsuario(data.usuario)
    sucesso.value = 'Foto atualizada!'
  } catch (e) {
    erro.value = e.response?.data?.error || 'Erro ao enviar foto.'
  } finally {
    enviandoFoto.value = false
    inputFoto.value.value = ''
  }
}

const salvar = async () => {
  salvando.value = true
  sucesso.value = null
  erro.value = null
  try {
    const { data } = await api.put('/usuarios/me', { bio: form.value.bio })
    auth.atualizarUsuario(data.usuario)
    sucesso.value = 'Perfil atualizado!'
  } catch (e) {
    erro.value = e.response?.data?.error || 'Erro ao salvar.'
  } finally { salvando.value = false }
}

const sair = () => {
  auth.logout()
  router.push('/login')
}

onMounted(async () => {
  try {
    const { data } = await api.get(`/posts/usuario/${auth.usuario.username}`)
    meusPosts.value = data.posts
  } catch {}
})
</script>

<style scoped>
.perfil-page { max-width: 520px; margin: 0 auto; padding: 32px 16px; }
.perfil-card { padding: 28px; }
.perfil-card h2 { font-family: var(--fonte-titulo); font-size: 1.3rem; margin-bottom: 24px; }

.avatar-section { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--cinza-700); }

.avatar-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
}
.avatar-grande {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 1.4rem;
}
.avatar-wrapper:hover .avatar-overlay { opacity: 1; }

.btn-trocar-foto {
  margin-top: 8px;
  padding: 4px 12px;
  background: transparent;
  border: 1px solid var(--amarelo);
  color: var(--amarelo);
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-family: var(--fonte);
  cursor: pointer;
  transition: all var(--transition);
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn-trocar-foto:hover { background: rgba(255,200,0,0.1); }

.username { font-weight: 700; font-size: 1rem; }
.email { font-size: 0.82rem; color: var(--cinza-400); margin-top: 2px; }
.perfil-badge { font-size: 0.75rem; color: var(--amarelo); margin-top: 4px; }

.btn-sair-mobile {
  display: none;
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  background: rgba(255,68,68,0.1);
  color: var(--vermelho);
  border: 1px solid rgba(255,68,68,0.3);
  border-radius: var(--radius-sm);
  font-family: var(--fonte);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
}
.btn-sair-mobile:hover { background: rgba(255,68,68,0.2); }

.posts-section { margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--cinza-700); }
.posts-section h3 { font-size: 0.95rem; color: var(--cinza-200); margin-bottom: 14px; }
.posts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; border-radius: var(--radius-sm); overflow: hidden; }
.grid-item { aspect-ratio: 1; overflow: hidden; display: block; }
.grid-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s; }
.grid-item:hover img { transform: scale(1.05); }
.vazio { text-align: center; color: var(--cinza-400); font-size: 0.85rem; padding: 20px; }

@media (max-width: 768px) {
  .btn-sair-mobile { display: block; }
}
</style>
