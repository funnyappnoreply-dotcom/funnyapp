<template>
  <div class="admin-page">
    <div class="admin-header">
      <h1>🛡️ Painel Admin</h1>
      <span class="admin-badge">{{ auth.usuario?.perfil === 'superadmin' ? '⭐ Super Admin' : '🛡️ Admin' }}</span>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button v-for="t in tabs" :key="t.id" :class="['tab', { ativo: aba === t.id }]" @click="aba = t.id">
        {{ t.icon }} {{ t.label }}
        <span v-if="t.badge" class="tab-badge">{{ t.badge }}</span>
      </button>
    </div>

    <!-- Dashboard -->
    <div v-if="aba === 'dashboard'">
      <div v-if="carregando" class="loading-wrap"><div class="spinner" style="width:32px;height:32px;border-width:3px"></div></div>
      <div v-else>
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-num">{{ stats.totalUsuarios }}</div><div class="stat-label">Usuários ativos</div></div>
          <div class="stat-card"><div class="stat-num">{{ stats.totalPosts }}</div><div class="stat-label">Posts</div></div>
          <div class="stat-card vermelho"><div class="stat-num">{{ stats.denunciasPendentes }}</div><div class="stat-label">Denúncias pendentes</div></div>
          <div class="stat-card cinza"><div class="stat-num">{{ stats.usuariosBanidos }}</div><div class="stat-label">Usuários banidos</div></div>
        </div>
        <div class="card" style="padding:20px">
          <h3 style="margin-bottom:16px;font-size:1rem">Posts recentes</h3>
          <div class="tabela-wrap">
            <table class="tabela">
              <thead><tr><th>Imagem</th><th>Autor</th><th>Legenda</th><th>Curtidas</th><th>Ação</th></tr></thead>
              <tbody>
                <tr v-for="p in stats.postsRecentes" :key="p._id">
                  <td><img :src="p.imagem" style="width:48px;height:48px;object-fit:cover;border-radius:6px" /></td>
                  <td><span class="usuario-chip">@{{ p.autor?.username }}</span></td>
                  <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ p.legenda || '—' }}</td>
                  <td>❤️ {{ p.curtidas?.length || 0 }}</td>
                  <td><button class="btn btn-sm btn-vermelho" @click="deletarPost(p._id)">🗑 Deletar</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Usuários -->
    <div v-if="aba === 'usuarios'">
      <div class="filtros-bar">
        <input v-model="buscaUsuario" type="text" class="form-input" placeholder="Buscar username ou email..." style="max-width:260px" @input="buscarUsuarios" />
        <select v-model="filtroPerfil" class="form-input" style="max-width:140px" @change="buscarUsuarios">
          <option value="">Todos perfis</option>
          <option value="usuario">Usuário</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
        </select>
        <select v-model="filtroBanido" class="form-input" style="max-width:140px" @change="buscarUsuarios">
          <option value="">Todos status</option>
          <option value="false">Ativos</option>
          <option value="true">Banidos</option>
        </select>
      </div>

      <div class="card" style="padding:0;overflow:hidden">
        <div v-if="carregandoUsuarios" class="loading-wrap"><div class="spinner" style="width:24px;height:24px;border-width:2px"></div></div>
        <div v-else class="tabela-wrap">
          <table class="tabela">
            <thead><tr><th>Usuário</th><th>Email</th><th>Perfil</th><th>Status</th><th>Desde</th><th>Ações</th></tr></thead>
            <tbody>
              <tr v-for="u in usuarios" :key="u._id">
                <td><span class="usuario-chip">@{{ u.username }}</span></td>
                <td style="font-size:0.82rem;color:var(--cinza-400)">{{ u.email }}</td>
                <td>
                  <span :class="['perfil-badge', u.perfil]">{{ u.perfil }}</span>
                </td>
                <td>
                  <span :class="['status-badge', u.banido ? 'banido' : 'ativo']">{{ u.banido ? 'Banido' : 'Ativo' }}</span>
                </td>
                <td style="font-size:0.78rem;color:var(--cinza-400)">{{ formatarData(u.createdAt) }}</td>
                <td>
                  <div class="acoes-cel">
                    <!-- Dar/tirar admin (só superadmin) -->
                    <template v-if="isSuperAdmin && u._id !== auth.usuario._id">
                      <button v-if="u.perfil === 'usuario'" class="btn btn-sm" style="background:rgba(99,102,241,0.2);color:#a5b4fc;border:none" @click="alterarPerfil(u, 'admin')">+ Admin</button>
                      <button v-if="u.perfil === 'admin'" class="btn btn-sm" style="background:rgba(99,102,241,0.2);color:#a5b4fc;border:none" @click="alterarPerfil(u, 'usuario')">- Admin</button>
                      <button v-if="u.perfil === 'admin'" class="btn btn-sm" style="background:rgba(255,214,0,0.15);color:var(--amarelo);border:none" @click="alterarPerfil(u, 'superadmin')">+ Super</button>
                      <button v-if="u.perfil === 'superadmin'" class="btn btn-sm" style="background:rgba(255,214,0,0.15);color:var(--amarelo);border:none" @click="alterarPerfil(u, 'admin')">- Super</button>
                    </template>
                    <!-- Banir/desbanir -->
                    <button v-if="!u.banido && u._id !== auth.usuario._id && u.perfil !== 'superadmin'" class="btn btn-sm btn-vermelho" @click="abrirModalBanir(u)">🔨 Banir</button>
                    <button v-if="u.banido" class="btn btn-sm" style="background:rgba(34,197,94,0.15);color:#4ade80;border:none" @click="desbanir(u)">✅ Desbanir</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Posts -->
    <div v-if="aba === 'posts'">
      <div class="filtros-bar">
        <input v-model="buscaPost" type="text" class="form-input" placeholder="Buscar na legenda..." style="max-width:300px" @input="buscarPosts" />
      </div>
      <div class="card" style="padding:0;overflow:hidden">
        <div v-if="carregandoPosts" class="loading-wrap"><div class="spinner" style="width:24px;height:24px;border-width:2px"></div></div>
        <div v-else class="tabela-wrap">
          <table class="tabela">
            <thead><tr><th>Imagem</th><th>Autor</th><th>Legenda</th><th>Tags</th><th>Curtidas</th><th>Ação</th></tr></thead>
            <tbody>
              <tr v-for="p in posts" :key="p._id">
                <td><img :src="p.imagem" style="width:52px;height:52px;object-fit:cover;border-radius:6px" /></td>
                <td>
                  <span class="usuario-chip">@{{ p.autor?.username }}</span>
                  <div v-if="p.autor?.banido" style="font-size:0.7rem;color:var(--vermelho)">banido</div>
                </td>
                <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.85rem">{{ p.legenda || '—' }}</td>
                <td style="font-size:0.78rem;color:var(--amarelo)">{{ p.tags?.map(t => '#'+t).join(' ') || '—' }}</td>
                <td>❤️ {{ p.curtidas?.length || 0 }}</td>
                <td><button class="btn btn-sm btn-vermelho" @click="deletarPost(p._id)">🗑 Deletar</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Denúncias -->
    <div v-if="aba === 'denuncias'">
      <div class="filtros-bar">
        <select v-model="filtroDenuncia" class="form-input" style="max-width:160px" @change="buscarDenuncias">
          <option value="pendente">Pendentes</option>
          <option value="analisada">Analisadas</option>
          <option value="ignorada">Ignoradas</option>
          <option value="">Todas</option>
        </select>
      </div>
      <div class="card" style="padding:0;overflow:hidden">
        <div v-if="carregandoDenuncias" class="loading-wrap"><div class="spinner" style="width:24px;height:24px;border-width:2px"></div></div>
        <div v-else-if="denuncias.length === 0" class="vazio">Nenhuma denúncia {{ filtroDenuncia || '' }}.</div>
        <div v-else class="tabela-wrap">
          <table class="tabela">
            <thead><tr><th>Post</th><th>Denunciante</th><th>Motivo</th><th>Descrição</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              <tr v-for="d in denuncias" :key="d._id">
                <td>
                  <img v-if="d.post?.imagem" :src="d.post.imagem" style="width:48px;height:48px;object-fit:cover;border-radius:6px" />
                  <span v-else style="color:var(--cinza-400);font-size:0.78rem">Post deletado</span>
                </td>
                <td><span class="usuario-chip">@{{ d.denunciante?.username }}</span></td>
                <td><span class="motivo-badge">{{ labelMotivo(d.motivo) }}</span></td>
                <td style="max-width:160px;font-size:0.82rem;color:var(--cinza-200)">{{ d.descricao || '—' }}</td>
                <td><span :class="['status-badge', d.status]">{{ d.status }}</span></td>
                <td>
                  <div class="acoes-cel" v-if="d.status === 'pendente'">
                    <button class="btn btn-sm btn-vermelho" @click="analisar(d, 'analisada', true)" :disabled="!d.post">🗑 Deletar post</button>
                    <button class="btn btn-sm" style="background:rgba(255,214,0,0.15);color:var(--amarelo);border:none" @click="analisar(d, 'ignorada', false)">Ignorar</button>
                  </div>
                  <span v-else style="font-size:0.78rem;color:var(--cinza-400)">{{ d.analisadaPor?.username ? 'por @'+d.analisadaPor.username : '—' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal banir -->
    <div v-if="modalBanir" class="modal-overlay" @click.self="modalBanir = false">
      <div class="modal-box">
        <h3>🔨 Banir @{{ usuarioBanindo?.username }}</h3>
        <div class="form-group" style="margin-top:16px">
          <label class="form-label">Motivo do banimento</label>
          <input v-model="motivoBanimento" type="text" class="form-input" placeholder="Ex: Spam, conteúdo impróprio..." />
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
          <button class="btn btn-outline btn-sm" @click="modalBanir = false">Cancelar</button>
          <button class="btn btn-vermelho btn-sm" @click="banir" :disabled="salvando">
            <span v-if="salvando" class="spinner" style="width:14px;height:14px;border-width:2px"></span>
            <span v-else>Confirmar banimento</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../store/auth'
import api from '../services/api'

const auth = useAuthStore()
const aba = ref('dashboard')
const carregando = ref(true)
const stats = ref({})
const usuarios = ref([])
const posts = ref([])
const denuncias = ref([])
const carregandoUsuarios = ref(false)
const carregandoPosts = ref(false)
const carregandoDenuncias = ref(false)
const buscaUsuario = ref('')
const filtroPerfil = ref('')
const filtroBanido = ref('')
const buscaPost = ref('')
const filtroDenuncia = ref('pendente')
const modalBanir = ref(false)
const usuarioBanindo = ref(null)
const motivoBanimento = ref('')
const salvando = ref(false)

const isSuperAdmin = computed(() => auth.usuario?.perfil === 'superadmin')
const denunciasPendentes = computed(() => stats.value.denunciasPendentes || 0)

const tabs = computed(() => [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'usuarios', icon: '👥', label: 'Usuários' },
  { id: 'posts', icon: '🖼️', label: 'Posts' },
  { id: 'denuncias', icon: '🚩', label: 'Denúncias', badge: denunciasPendentes.value || null }
])

const formatarData = d => new Date(d).toLocaleDateString('pt-BR')
const labelMotivo = m => ({ spam: 'Spam', conteudo_inapropriado: 'Inapropriado', discurso_odio: 'Ódio', violencia: 'Violência', outro: 'Outro' }[m] || m)

const carregarDashboard = async () => {
  carregando.value = true
  try {
    const { data } = await api.get('/admin/dashboard')
    stats.value = data
  } finally { carregando.value = false }
}

const buscarUsuarios = async () => {
  carregandoUsuarios.value = true
  try {
    const params = {}
    if (buscaUsuario.value) params.busca = buscaUsuario.value
    if (filtroPerfil.value) params.perfil = filtroPerfil.value
    if (filtroBanido.value !== '') params.banido = filtroBanido.value
    const { data } = await api.get('/admin/usuarios', { params })
    usuarios.value = data.usuarios
  } finally { carregandoUsuarios.value = false }
}

const buscarPosts = async () => {
  carregandoPosts.value = true
  try {
    const params = {}
    if (buscaPost.value) params.busca = buscaPost.value
    const { data } = await api.get('/admin/posts', { params })
    posts.value = data.posts
  } finally { carregandoPosts.value = false }
}

const buscarDenuncias = async () => {
  carregandoDenuncias.value = true
  try {
    const params = {}
    if (filtroDenuncia.value) params.status = filtroDenuncia.value
    const { data } = await api.get('/admin/denuncias', { params })
    denuncias.value = data.denuncias
  } finally { carregandoDenuncias.value = false }
}

const deletarPost = async (id) => {
  if (!confirm('Deletar este post?')) return
  try {
    await api.delete(`/admin/posts/${id}`)
    posts.value = posts.value.filter(p => p._id !== id)
    stats.value.postsRecentes = stats.value.postsRecentes?.filter(p => p._id !== id)
    stats.value.totalPosts = (stats.value.totalPosts || 1) - 1
  } catch (e) { alert(e.response?.data?.error || 'Erro ao deletar.') }
}

const alterarPerfil = async (u, perfil) => {
  if (!confirm(`Alterar perfil de @${u.username} para ${perfil}?`)) return
  try {
    await api.put(`/admin/usuarios/${u._id}/perfil`, { perfil })
    u.perfil = perfil
  } catch (e) { alert(e.response?.data?.error || 'Erro.') }
}

const abrirModalBanir = (u) => {
  usuarioBanindo.value = u
  motivoBanimento.value = ''
  modalBanir.value = true
}

const banir = async () => {
  salvando.value = true
  try {
    await api.put(`/admin/usuarios/${usuarioBanindo.value._id}/banir`, { motivo: motivoBanimento.value })
    usuarioBanindo.value.banido = true
    modalBanir.value = false
    stats.value.usuariosBanidos = (stats.value.usuariosBanidos || 0) + 1
  } catch (e) { alert(e.response?.data?.error || 'Erro.') }
  finally { salvando.value = false }
}

const desbanir = async (u) => {
  if (!confirm(`Desbanir @${u.username}?`)) return
  try {
    await api.put(`/admin/usuarios/${u._id}/desbanir`)
    u.banido = false
    stats.value.usuariosBanidos = Math.max(0, (stats.value.usuariosBanidos || 1) - 1)
  } catch (e) { alert(e.response?.data?.error || 'Erro.') }
}

const analisar = async (d, status, deletar) => {
  try {
    await api.put(`/admin/denuncias/${d._id}`, { status, deletarPost: deletar })
    d.status = status
    stats.value.denunciasPendentes = Math.max(0, (stats.value.denunciasPendentes || 1) - 1)
    if (deletar) { posts.value = posts.value.filter(p => p._id !== d.post?._id) }
  } catch (e) { alert(e.response?.data?.error || 'Erro.') }
}

onMounted(() => {
  carregarDashboard()
  buscarUsuarios()
  buscarPosts()
  buscarDenuncias()
})
</script>

<style scoped>
.admin-page { max-width: 1100px; margin: 0 auto; padding: 24px 20px; }
.admin-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
.admin-header h1 { font-family: var(--fonte-titulo); font-size: 1.5rem; }
.admin-badge { background: rgba(99,102,241,0.2); color: #a5b4fc; padding: 4px 12px; border-radius: 20px; font-size: 0.82rem; font-weight: 600; }

.tabs { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 1px solid var(--cinza-700); }
.tab { padding: 10px 18px; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-family: var(--fonte); font-size: 0.88rem; color: var(--cinza-400); font-weight: 500; transition: all var(--transition); display: flex; align-items: center; gap: 6px; }
.tab:hover { color: var(--branco); }
.tab.ativo { color: var(--amarelo); border-bottom-color: var(--amarelo); }
.tab-badge { background: var(--vermelho); color: #fff; font-size: 0.7rem; padding: 1px 6px; border-radius: 20px; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 20px; }
.stat-card { background: var(--cinza-900); border: 1px solid var(--cinza-700); border-radius: var(--radius-md); padding: 18px; }
.stat-card.vermelho .stat-num { color: var(--vermelho); }
.stat-card.cinza .stat-num { color: var(--cinza-400); }
.stat-num { font-size: 2rem; font-weight: 700; line-height: 1; }
.stat-label { font-size: 0.78rem; color: var(--cinza-400); margin-top: 6px; }

.filtros-bar { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.tabela-wrap { overflow-x: auto; }
.tabela { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.tabela th { padding: 10px 14px; text-align: left; font-size: 0.75rem; font-weight: 500; color: var(--cinza-400); border-bottom: 1px solid var(--cinza-700); white-space: nowrap; }
.tabela td { padding: 12px 14px; border-bottom: 1px solid var(--cinza-800); vertical-align: middle; }
.tabela tr:last-child td { border-bottom: none; }
.tabela tr:hover td { background: rgba(255,255,255,0.02); }

.usuario-chip { font-size: 0.85rem; font-weight: 600; color: var(--branco); }
.acoes-cel { display: flex; gap: 6px; flex-wrap: wrap; }

.perfil-badge { font-size: 0.72rem; padding: 3px 8px; border-radius: 20px; font-weight: 500; }
.perfil-badge.usuario { background: var(--cinza-800); color: var(--cinza-200); }
.perfil-badge.admin { background: rgba(99,102,241,0.2); color: #a5b4fc; }
.perfil-badge.superadmin { background: rgba(255,214,0,0.15); color: var(--amarelo); }

.status-badge { font-size: 0.72rem; padding: 3px 8px; border-radius: 20px; font-weight: 500; }
.status-badge.ativo { background: rgba(34,197,94,0.15); color: #4ade80; }
.status-badge.banido { background: rgba(255,68,68,0.15); color: var(--vermelho); }
.status-badge.pendente { background: rgba(255,214,0,0.15); color: var(--amarelo); }
.status-badge.analisada { background: rgba(34,197,94,0.15); color: #4ade80; }
.status-badge.ignorada { background: var(--cinza-800); color: var(--cinza-400); }

.motivo-badge { font-size: 0.75rem; padding: 3px 8px; border-radius: 20px; background: rgba(255,68,68,0.15); color: #ff8888; }

.loading-wrap { display: flex; justify-content: center; padding: 40px; }
.vazio { text-align: center; padding: 40px; color: var(--cinza-400); font-size: 0.9rem; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 20px; }
.modal-box { background: var(--cinza-900); border: 1px solid var(--cinza-600); border-radius: var(--radius-lg); padding: 24px; width: 100%; max-width: 400px; }
.modal-box h3 { font-size: 1rem; }
</style>
