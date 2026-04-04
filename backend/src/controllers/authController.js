const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const Usuario = require('../models/Usuario')
const { enviarEmailConfirmacao, enviarEmailRecuperacao } = require('../utils/emailService')

const gerarToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
})

const cookieOpcoes = {
  httpOnly: true,                              // JS do browser NÃO consegue ler — protege de XSS
  secure: process.env.NODE_ENV === 'production', // HTTPS only em produção
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' necessário para cross-site (Railway + Vercel)
  maxAge: 7 * 24 * 60 * 60 * 1000             // 7 dias em ms
}

// POST /api/usuarios/registro
const registrar = async (req, res) => {
  try {
    const erros = validationResult(req)
    if (!erros.isEmpty()) return res.status(400).json({ errors: erros.array() })

    const { username, email, senha } = req.body
    const existente = await Usuario.findOne({ $or: [{ email }, { username }] })
    if (existente) {
      const campo = existente.email === email ? 'Email' : 'Username'
      return res.status(409).json({ error: `${campo} já cadastrado.` })
    }

    const usuario = new Usuario({ username, email, senha })
    const tokenConfirmacao = usuario.gerarTokenConfirmacao()
    await usuario.save()

    const token = gerarToken(usuario._id)

    // Seta o token como cookie HttpOnly — não fica exposto no JS do browser
    res.cookie('token', token, cookieOpcoes)

    res.status(201).json({
      message: 'Conta criada! Verifique seu email para confirmar a conta.',
      usuario
    })

    enviarEmailConfirmacao(email, username, tokenConfirmacao)
      .catch(e => console.log('Erro ao enviar email:', e.message))

  } catch (e) {
    res.status(500).json({ error: 'Erro ao registrar.' })
  }
}

// POST /api/usuarios/login
const login = async (req, res) => {
  try {
    const erros = validationResult(req)
    if (!erros.isEmpty()) return res.status(400).json({ errors: erros.array() })

    const { email, senha } = req.body
    const usuario = await Usuario.findOne({ email }).select('+senha')
    if (!usuario || !(await usuario.compararSenha(senha)))
      return res.status(401).json({ error: 'Credenciais inválidas.' })
    if (usuario.banido)
      return res.status(403).json({ error: `Conta banida. Motivo: ${usuario.motivoBanimento}` })

    const token = gerarToken(usuario._id)

    // Seta o token como cookie HttpOnly
    res.cookie('token', token, cookieOpcoes)

    res.json({ message: 'Login realizado!', usuario: usuario.toJSON() })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao fazer login.' })
  }
}

// POST /api/usuarios/logout
const logout = (req, res) => {
  res.clearCookie('token', cookieOpcoes)
  res.json({ message: 'Logout realizado!' })
}

// GET /api/usuarios/confirmar-email/:token
const confirmarEmail = async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ tokenConfirmacao: req.params.token })
    if (!usuario) return res.status(400).json({ error: 'Token inválido ou expirado.' })

    usuario.emailConfirmado = true
    usuario.tokenConfirmacao = undefined
    await usuario.save()

    res.json({ message: 'Email confirmado com sucesso! Você já pode usar o FunnyApp.' })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao confirmar email.' })
  }
}

// POST /api/usuarios/esqueci-senha
const esqueciSenha = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email é obrigatório.' })

    const usuario = await Usuario.findOne({ email })
    if (!usuario) return res.json({ message: 'Se o email existir, você receberá as instruções.' })

    const token = usuario.gerarTokenRecuperacao()
    await usuario.save()

    enviarEmailRecuperacao(email, usuario.username, token)
      .catch(e => console.log('Erro ao enviar email:', e.message))

    res.json({ message: 'Se o email existir, você receberá as instruções em breve.' })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao processar solicitação.' })
  }
}

// POST /api/usuarios/redefinir-senha/:token
const redefinirSenha = async (req, res) => {
  try {
    const { senha } = req.body
    if (!senha || senha.length < 6) return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres.' })

    const usuario = await Usuario.findOne({
      tokenRecuperacao: req.params.token,
      tokenRecuperacaoExpira: { $gt: new Date() }
    })

    if (!usuario) return res.status(400).json({ error: 'Token inválido ou expirado.' })

    usuario.senha = senha
    usuario.tokenRecuperacao = undefined
    usuario.tokenRecuperacaoExpira = undefined
    await usuario.save()

    res.json({ message: 'Senha redefinida com sucesso! Faça login com a nova senha.' })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao redefinir senha.' })
  }
}

// GET /api/usuarios/me
const perfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario._id)
      .populate('seguidores', 'username avatar')
      .populate('seguindo', 'username avatar')
    res.json({ usuario })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao buscar perfil.' })
  }
}

// PUT /api/usuarios/me
const atualizarPerfil = async (req, res) => {
  try {
    const { bio } = req.body
    const atualizacoes = {}
    if (bio !== undefined) atualizacoes.bio = bio
    if (req.file) atualizacoes.avatar = req.file.path

    const usuario = await Usuario.findByIdAndUpdate(req.usuario._id, atualizacoes, { new: true })
    res.json({ message: 'Perfil atualizado!', usuario })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao atualizar perfil.' })
  }
}

// GET /api/usuarios/:username
const buscarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ username: req.params.username })
      .populate('seguidores', 'username avatar')
      .populate('seguindo', 'username avatar')
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' })
    res.json({ usuario })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao buscar usuário.' })
  }
}

// POST /api/usuarios/:id/seguir
const seguir = async (req, res) => {
  try {
    const alvo = await Usuario.findById(req.params.id)
    if (!alvo) return res.status(404).json({ error: 'Usuário não encontrado.' })
    if (alvo._id.equals(req.usuario._id))
      return res.status(400).json({ error: 'Você não pode se seguir.' })

    const jaSeguindo = alvo.seguidores.includes(req.usuario._id)
    if (jaSeguindo) {
      await Usuario.findByIdAndUpdate(alvo._id, { $pull: { seguidores: req.usuario._id } })
      await Usuario.findByIdAndUpdate(req.usuario._id, { $pull: { seguindo: alvo._id } })
      res.json({ message: 'Deixou de seguir.', seguindo: false })
    } else {
      await Usuario.findByIdAndUpdate(alvo._id, { $addToSet: { seguidores: req.usuario._id } })
      await Usuario.findByIdAndUpdate(req.usuario._id, { $addToSet: { seguindo: alvo._id } })
      res.json({ message: 'Seguindo!', seguindo: true })
    }
  } catch (e) {
    res.status(500).json({ error: 'Erro ao seguir.' })
  }
}

// GET /api/usuarios/buscar
const buscarUsuarios = async (req, res) => {
  try {
    const { q } = req.query
    if (!q) return res.json({ usuarios: [] })
    const usuarios = await Usuario.find({
      username: { $regex: q, $options: 'i' }
    }).select('username avatar bio perfil').limit(10)
    res.json({ usuarios })
  } catch (e) {
    res.status(500).json({ error: 'Erro na busca.' })
  }
}

module.exports = {
  registrar, login, logout, confirmarEmail, esqueciSenha, redefinirSenha,
  perfil, atualizarPerfil, buscarUsuario, seguir, buscarUsuarios
}
