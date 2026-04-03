const mongoose = require('mongoose')

const denunciaSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  denunciante: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  motivo: {
    type: String,
    enum: ['spam', 'conteudo_inapropriado', 'discurso_odio', 'violencia', 'outro'],
    required: true
  },
  descricao: { type: String, maxlength: 300, default: '' },
  status: {
    type: String,
    enum: ['pendente', 'analisada', 'ignorada'],
    default: 'pendente'
  },
  analisadaPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, { timestamps: true })

denunciaSchema.index({ post: 1, denunciante: 1 }, { unique: true })

module.exports = mongoose.model('Denuncia', denunciaSchema)
