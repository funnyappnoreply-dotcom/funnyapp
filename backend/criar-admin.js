/**
 * Script para criar conta Super Admin
 * Uso: node criar-admin.js
 * Execute dentro da pasta: funnyapp/backend
 */

require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const usuarioSchema = new mongoose.Schema({
  username: String, email: String, senha: String,
  bio: String, avatar: String,
  seguidores: [], seguindo: [], totalPosts: Number,
  perfil: { type: String, default: 'usuario' },
  banido: { type: Boolean, default: false },
  motivoBanimento: String
}, { timestamps: true })

const Usuario = mongoose.model('Usuario', usuarioSchema)

const criarAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Conectado ao MongoDB...')

  // Dados do super admin — altere aqui
  const dados = {
    username: 'admin',
    email: 'admin@funnyapp.com',
    senha: 'Admin@123',
    perfil: 'superadmin',
    bio: 'Administrador do FunnyApp',
    totalPosts: 0
  }

  const existente = await Usuario.findOne({ $or: [{ email: dados.email }, { username: dados.username }] })

  if (existente) {
    // Se já existe, só promove para superadmin
    existente.perfil = 'superadmin'
    await existente.save()
    console.log(`\n✅ Usuário @${existente.username} promovido para superadmin!`)
  } else {
    // Cria novo
    dados.senha = await bcrypt.hash(dados.senha, 12)
    const admin = await Usuario.create(dados)
    console.log(`\n✅ Super Admin criado com sucesso!`)
    console.log(`   Username: @${admin.username}`)
    console.log(`   Email:    ${dados.email}`)
    console.log(`   Senha:    Admin@123`)
    console.log(`\n⚠️  Troque a senha após o primeiro login!`)
  }

  await mongoose.disconnect()
}

criarAdmin().catch(console.error)
