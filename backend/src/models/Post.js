const mongoose = require('mongoose')

const comentarioSchema = new mongoose.Schema({
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  texto: { type: String, required: true, maxlength: 300 },
  curtidas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }]
}, { timestamps: true })

const postSchema = new mongoose.Schema({
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  tipo: { type: String, enum: ['imagem', 'video'], default: 'imagem' },
  imagem: { type: String, default: '' },
  imagemPublicId: { type: String },
  video: { type: String, default: '' },
  videoPublicId: { type: String },
  legenda: { type: String, maxlength: 500, default: '' },
  tags: [{ type: String, maxlength: 30 }],
  curtidas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
  comentarios: [comentarioSchema],
  visualizacoes: { type: Number, default: 0 }
}, { timestamps: true })

postSchema.index({ autor: 1, createdAt: -1 })
postSchema.index({ tags: 1 })
postSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Post', postSchema)
