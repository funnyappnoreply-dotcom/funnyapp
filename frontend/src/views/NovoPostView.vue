<template>
  <div class="novo-page">
    <div class="novo-card card">
      <h2>📸 Novo Post</h2>

      <div v-if="erro" class="alerta alerta-erro">{{ erro }}</div>
      <div v-if="sucesso" class="alerta alerta-sucesso">{{ sucesso }}</div>

      <form @submit.prevent="postar">
        <div class="upload-area" @click="$refs.inputMidia.click()" @dragover.prevent @drop.prevent="onDrop">
          <div v-if="!preview" class="upload-placeholder">
            <div class="upload-icon">🖼️</div>
            <p>Clique ou arraste uma imagem ou vídeo aqui</p>
            <span>JPG, PNG, GIF, WebP, MP4, MOV, WebM — máx 100MB</span>
          </div>
          <img v-else-if="tipoArquivo === 'imagem'" :src="preview" class="upload-preview" />
          <video v-else-if="tipoArquivo === 'video'" :src="preview" class="upload-preview" controls muted playsinline />
          <div v-if="preview" class="upload-troca" @click.stop="$refs.inputMidia.click()">Trocar arquivo</div>
        </div>
        <input ref="inputMidia" type="file" accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm,video/avi" hidden @change="onFile" />

        <div class="form-group" style="margin-top:16px">
          <label class="form-label">Legenda</label>
          <textarea v-model="form.legenda" class="form-textarea" placeholder="Adicione uma legenda engraçada..." maxlength="500"></textarea>
          <span style="font-size:0.75rem;color:var(--cinza-400);text-align:right">{{ form.legenda.length }}/500</span>
        </div>

        <div class="form-group">
          <label class="form-label">Tags (separadas por vírgula)</label>
          <input v-model="form.tags" type="text" class="form-input" placeholder="meme, humor, gato..." />
        </div>

        <div v-if="salvando && progresso > 0" class="progresso-wrap">
          <div class="progresso-barra" :style="{ width: progresso + '%' }"></div>
          <span class="progresso-texto">{{ progresso }}%</span>
        </div>

        <button type="submit" class="btn btn-amarelo btn-full btn-lg" style="margin-top:20px" :disabled="salvando || !arquivoSelecionado">
          <span v-if="salvando" class="spinner" style="border-top-color:var(--preto)"></span>
          <span v-else>Publicar Post</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const form = ref({ legenda: '', tags: '' })
const preview = ref(null)
const arquivoSelecionado = ref(null)
const tipoArquivo = ref(null)
const salvando = ref(false)
const progresso = ref(0)
const erro = ref(null)
const sucesso = ref(null)

const tiposVideo = ['video/mp4', 'video/quicktime', 'video/webm', 'video/avi']

const processarArquivo = (file) => {
  if (!file) return
  arquivoSelecionado.value = file
  preview.value = URL.createObjectURL(file)
  tipoArquivo.value = tiposVideo.includes(file.type) ? 'video' : 'imagem'
}

const onFile = (e) => processarArquivo(e.target.files[0])
const onDrop = (e) => processarArquivo(e.dataTransfer.files[0])

const postar = async () => {
  if (!arquivoSelecionado.value) return
  salvando.value = true
  progresso.value = 0
  erro.value = null
  try {
    const fd = new FormData()
    fd.append('midia', arquivoSelecionado.value)
    fd.append('legenda', form.value.legenda)
    fd.append('tags', form.value.tags)

    await api.post('/posts', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        progresso.value = Math.round((e.loaded * 100) / e.total)
      }
    })

    sucesso.value = 'Post publicado! Redirecionando...'
    setTimeout(() => router.push('/'), 1500)
  } catch (e) {
    erro.value = e.response?.data?.error || 'Erro ao publicar.'
  } finally { salvando.value = false }
}
</script>

<style scoped>
.novo-page { max-width: 580px; margin: 0 auto; padding: 32px 24px; width: 100%; }
.novo-card { padding: 28px; }
.novo-card h2 { font-family: var(--fonte-titulo); font-size: 1.3rem; margin-bottom: 24px; }

.upload-area {
  border: 2px dashed var(--cinza-600); border-radius: var(--radius-md);
  cursor: pointer; transition: border-color var(--transition); overflow: hidden;
  min-height: 220px; display: flex; align-items: center; justify-content: center;
  position: relative;
}
.upload-area:hover { border-color: var(--amarelo); }
.upload-placeholder { text-align: center; padding: 40px 20px; }
.upload-icon { font-size: 3rem; margin-bottom: 12px; }
.upload-placeholder p { color: var(--cinza-200); font-weight: 500; margin-bottom: 6px; }
.upload-placeholder span { font-size: 0.78rem; color: var(--cinza-400); }
.upload-preview { width: 100%; max-height: 400px; object-fit: contain; display: block; }
.upload-troca {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(0,0,0,0.6); text-align: center; padding: 8px;
  font-size: 0.82rem; color: var(--branco);
}

.progresso-wrap {
  margin-top: 12px; background: var(--cinza-700); border-radius: 99px;
  height: 8px; overflow: hidden; position: relative;
}
.progresso-barra {
  height: 100%; background: var(--amarelo);
  border-radius: 99px; transition: width 0.2s;
}
.progresso-texto {
  position: absolute; right: 0; top: -20px;
  font-size: 0.75rem; color: var(--cinza-400);
}
</style>
