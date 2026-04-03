const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const usuarioSchema = new mongoose.Schema({
  username: {
    type: String, required: true, unique: true, trim: true,
    minlength: 3, maxlength: 20,
    match: [/^[a-zA-Z0-9_]+$/, 'Username só pode ter letras, números e _']
  },
  email: {
    type: String, required: true, unique: true,
    lowercase: true, trim: true
  },
  senha: { type: String, required: true, minlength: 6, select: false },
  bio: { type: String, maxlength: 150, default: '' },
  avatar: { type: String, default: '' },
  seguidores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
  seguindo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
  totalPosts: { type: Number, default: 0 },
  perfil: {
    type: String,
    enum: ['usuario', 'admin', 'superadmin'],
    default: 'usuario'
  },
  banido: { type: Boolean, default: false },
  motivoBanimento: { type: String, default: '' },
  emailConfirmado: { type: Boolean, default: false },
  tokenConfirmacao: { type: String },
  tokenRecuperacao: { type: String },
  tokenRecuperacaoExpira: { type: Date }
}, { timestamps: true })

usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next()
  this.senha = await bcrypt.hash(this.senha, 12)
  next()
})

usuarioSchema.methods.compararSenha = async function (s) {
  return bcrypt.compare(s, this.senha)
}

usuarioSchema.methods.gerarTokenConfirmacao = function () {
  const token = crypto.randomBytes(32).toString('hex')
  this.tokenConfirmacao = token
  return token
}

usuarioSchema.methods.gerarTokenRecuperacao = function () {
  const token = crypto.randomBytes(32).toString('hex')
  this.tokenRecuperacao = token
  this.tokenRecuperacaoExpira = new Date(Date.now() + 60 * 60 * 1000) // 1 hora
  return token
}

usuarioSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.senha
  delete obj.tokenConfirmacao
  delete obj.tokenRecuperacao
  delete obj.tokenRecuperacaoExpira
  return obj
}

module.exports = mongoose.model('Usuario', usuarioSchema)
