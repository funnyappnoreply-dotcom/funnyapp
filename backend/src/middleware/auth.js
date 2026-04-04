const jwt = require('jsonwebtoken')
const Usuario = require('../models/Usuario')

const autenticar = async (req, res, next) => {
  try {
    // Lê o token do cookie HttpOnly (não acessível via JS no browser)
    const token = req.cookies?.token
    if (!token)
      return res.status(401).json({ error: 'Token não fornecido.' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const usuario = await Usuario.findById(decoded.id)
    if (!usuario) return res.status(401).json({ error: 'Usuário não encontrado.' })
    if (usuario.banido) return res.status(403).json({ error: 'Conta banida.' })

    req.usuario = usuario
    next()
  } catch (e) {
    if (e.name === 'TokenExpiredError')
      return res.status(401).json({ error: 'Token expirado.' })
    return res.status(401).json({ error: 'Token inválido.' })
  }
}

const autenticarOpcional = async (req, res, next) => {
  try {
    const token = req.cookies?.token
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const usuario = await Usuario.findById(decoded.id)
      if (usuario && !usuario.banido) req.usuario = usuario
    }
  } catch (e) {}
  next()
}

const requerAdmin = (req, res, next) => {
  if (!['admin', 'superadmin'].includes(req.usuario?.perfil))
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' })
  next()
}

const requerSuperAdmin = (req, res, next) => {
  if (req.usuario?.perfil !== 'superadmin')
    return res.status(403).json({ error: 'Acesso negado. Apenas super administradores.' })
  next()
}

module.exports = { autenticar, autenticarOpcional, requerAdmin, requerSuperAdmin }
