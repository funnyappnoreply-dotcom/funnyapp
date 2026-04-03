const Usuario = require('../models/Usuario')
const Post = require('../models/Post')
const Denuncia = require('../models/Denuncia')
const { cloudinary } = require('../config/cloudinary')

const dashboard = async (req, res) => {
  try {
    const [totalUsuarios, totalPosts, denunciasPendentes, usuariosBanidos] = await Promise.all([
      Usuario.countDocuments({ banido: false }),
      Post.countDocuments(),
      Denuncia.countDocuments({ status: 'pendente' }),
      Usuario.countDocuments({ banido: true })
    ])
    const postsRecentes = await Post.find().populate('autor', 'username avatar perfil').sort({ createdAt: -1 }).limit(5)
    const usuariosRecentes = await Usuario.find().sort({ createdAt: -1 }).limit(5)
    res.json({ totalUsuarios, totalPosts, denunciasPendentes, usuariosBanidos, postsRecentes, usuariosRecentes })
  } catch (e) { res.status(500).json({ error: 'Erro ao carregar dashboard.' }) }
}

const listarUsuarios = async (req, res) => {
  try {
    const { busca, perfil, banido, pagina = 1, limite = 20 } = req.query
    const filtro = {}
    if (busca) filtro.$or = [{ username: { $regex: busca, $options: 'i' } }, { email: { $regex: busca, $options: 'i' } }]
    if (perfil) filtro.perfil = perfil
    if (banido !== undefined) filtro.banido = banido === 'true'
    const total = await Usuario.countDocuments(filtro)
    const usuarios = await Usuario.find(filtro).sort({ createdAt: -1 }).skip((pagina - 1) * limite).limit(Number(limite))
    res.json({ usuarios, paginacao: { total, pagina: Number(pagina), totalPaginas: Math.ceil(total / limite) } })
  } catch (e) { res.status(500).json({ error: 'Erro ao listar usuários.' }) }
}

const alterarPerfil = async (req, res) => {
  try {
    const { perfil } = req.body
    const alvo = await Usuario.findById(req.params.id)
    if (!alvo) return res.status(404).json({ error: 'Usuário não encontrado.' })
    if (alvo.perfil === 'superadmin' && req.usuario.perfil !== 'superadmin')
      return res.status(403).json({ error: 'Não é possível alterar um super administrador.' })
    if (perfil === 'superadmin' && req.usuario.perfil !== 'superadmin')
      return res.status(403).json({ error: 'Apenas super admins podem promover outros super admins.' })
    alvo.perfil = perfil
    await alvo.save()
    res.json({ message: `Perfil alterado para ${perfil}!`, usuario: alvo })
  } catch (e) { res.status(500).json({ error: 'Erro ao alterar perfil.' }) }
}

const banirUsuario = async (req, res) => {
  try {
    const { motivo } = req.body
    const alvo = await Usuario.findById(req.params.id)
    if (!alvo) return res.status(404).json({ error: 'Usuário não encontrado.' })
    if (alvo.perfil === 'superadmin') return res.status(403).json({ error: 'Não é possível banir um super admin.' })
    if (alvo._id.equals(req.usuario._id)) return res.status(400).json({ error: 'Você não pode banir a si mesmo.' })
    alvo.banido = true
    alvo.motivoBanimento = motivo || 'Violação dos termos de uso'
    await alvo.save()
    res.json({ message: `Usuário @${alvo.username} banido!`, usuario: alvo })
  } catch (e) { res.status(500).json({ error: 'Erro ao banir usuário.' }) }
}

const desbanirUsuario = async (req, res) => {
  try {
    const alvo = await Usuario.findById(req.params.id)
    if (!alvo) return res.status(404).json({ error: 'Usuário não encontrado.' })
    alvo.banido = false
    alvo.motivoBanimento = ''
    await alvo.save()
    res.json({ message: `Usuário @${alvo.username} desbanido!`, usuario: alvo })
  } catch (e) { res.status(500).json({ error: 'Erro ao desbanir usuário.' }) }
}

const deletarUsuario = async (req, res) => {
  try {
    const alvo = await Usuario.findById(req.params.id)
    if (!alvo) return res.status(404).json({ error: 'Usuário não encontrado.' })
    if (alvo.perfil === 'superadmin') return res.status(403).json({ error: 'Não é possível deletar um super admin.' })
    if (alvo._id.equals(req.usuario._id)) return res.status(400).json({ error: 'Você não pode deletar a si mesmo.' })
    const postsUsuario = await Post.find({ autor: alvo._id })
    for (const post of postsUsuario) {
      if (post.imagemPublicId) await cloudinary.uploader.destroy(post.imagemPublicId)
      await post.deleteOne()
    }
    await alvo.deleteOne()
    res.json({ message: `Conta de @${alvo.username} deletada com sucesso.` })
  } catch (e) { res.status(500).json({ error: 'Erro ao deletar usuário.' }) }
}

const listarPosts = async (req, res) => {
  try {
    const { pagina = 1, limite = 20, busca } = req.query
    const filtro = {}
    if (busca) filtro.legenda = { $regex: busca, $options: 'i' }
    const total = await Post.countDocuments(filtro)
    const posts = await Post.find(filtro).populate('autor', 'username avatar perfil banido').sort({ createdAt: -1 }).skip((pagina - 1) * limite).limit(Number(limite))
    res.json({ posts, paginacao: { total, pagina: Number(pagina), totalPaginas: Math.ceil(total / limite) } })
  } catch (e) { res.status(500).json({ error: 'Erro ao listar posts.' }) }
}

const deletarPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post não encontrado.' })
    if (post.imagemPublicId) await cloudinary.uploader.destroy(post.imagemPublicId)
    await post.deleteOne()
    await Usuario.findByIdAndUpdate(post.autor, { $inc: { totalPosts: -1 } })
    res.json({ message: 'Post deletado pelo administrador.' })
  } catch (e) { res.status(500).json({ error: 'Erro ao deletar post.' }) }
}

const listarDenuncias = async (req, res) => {
  try {
    const { status = 'pendente', pagina = 1, limite = 20 } = req.query
    const filtro = status ? { status } : {}
    const total = await Denuncia.countDocuments(filtro)
    const denuncias = await Denuncia.find(filtro).populate('post', 'imagem legenda autor').populate('denunciante', 'username avatar').populate('analisadaPor', 'username').sort({ createdAt: -1 }).skip((pagina - 1) * limite).limit(Number(limite))
    res.json({ denuncias, paginacao: { total, pagina: Number(pagina), totalPaginas: Math.ceil(total / limite) } })
  } catch (e) { res.status(500).json({ error: 'Erro ao listar denúncias.' }) }
}

const analisarDenuncia = async (req, res) => {
  try {
    const { status, deletarPost: deveDeletar } = req.body
    const denuncia = await Denuncia.findById(req.params.id).populate('post')
    if (!denuncia) return res.status(404).json({ error: 'Denúncia não encontrada.' })
    denuncia.status = status
    denuncia.analisadaPor = req.usuario._id
    await denuncia.save()
    if (deveDeletar && denuncia.post) {
      if (denuncia.post.imagemPublicId) await cloudinary.uploader.destroy(denuncia.post.imagemPublicId)
      await Post.findByIdAndDelete(denuncia.post._id)
      await Usuario.findByIdAndUpdate(denuncia.post.autor, { $inc: { totalPosts: -1 } })
    }
    res.json({ message: 'Denúncia analisada!', denuncia })
  } catch (e) { res.status(500).json({ error: 'Erro ao analisar denúncia.' }) }
}

module.exports = { dashboard, listarUsuarios, alterarPerfil, banirUsuario, desbanirUsuario, deletarUsuario, listarPosts, deletarPost, listarDenuncias, analisarDenuncia }
