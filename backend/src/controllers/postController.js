const Post = require('../models/Post')
const Usuario = require('../models/Usuario')
const { cloudinary, uploadParaCloudinary, tiposVideo } = require('../config/cloudinary')

// GET /api/posts — feed público
const feed = async (req, res) => {
  try {
    const { pagina = 1, limite = 12, tag } = req.query
    const filtro = tag ? { tags: tag } : {}

    const total = await Post.countDocuments(filtro)
    const posts = await Post.find(filtro)
      .populate('autor', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((pagina - 1) * limite)
      .limit(Number(limite))

    res.json({
      posts,
      paginacao: { total, pagina: Number(pagina), totalPaginas: Math.ceil(total / limite) }
    })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao carregar feed.' })
  }
}

// GET /api/posts/seguindo
const feedSeguindo = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario._id)
    const ids = [...usuario.seguindo, req.usuario._id]

    const { pagina = 1, limite = 12 } = req.query
    const total = await Post.countDocuments({ autor: { $in: ids } })
    const posts = await Post.find({ autor: { $in: ids } })
      .populate('autor', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((pagina - 1) * limite)
      .limit(Number(limite))

    res.json({
      posts,
      paginacao: { total, pagina: Number(pagina), totalPaginas: Math.ceil(total / limite) }
    })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao carregar feed.' })
  }
}

// POST /api/posts — criar post (imagem ou vídeo)
const criar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Arquivo é obrigatório.' })

    const { legenda, tags } = req.body
    const tagsArray = tags ? tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : []
    const isVideo = tiposVideo.includes(req.file.mimetype)

    // Faz upload no Cloudinary com o tipo correto
    const resultado = await uploadParaCloudinary(req.file.buffer, req.file.mimetype, req.file.originalname)

    const dadosPost = {
      autor: req.usuario._id,
      tipo: isVideo ? 'video' : 'imagem',
      legenda: legenda || '',
      tags: tagsArray
    }

    if (isVideo) {
      dadosPost.video = resultado.secure_url
      dadosPost.videoPublicId = resultado.public_id
      dadosPost.imagem = '' // thumbnail pode ser gerada pelo cloudinary futuramente
    } else {
      dadosPost.imagem = resultado.secure_url
      dadosPost.imagemPublicId = resultado.public_id
    }

    const post = await Post.create(dadosPost)
    await Usuario.findByIdAndUpdate(req.usuario._id, { $inc: { totalPosts: 1 } })
    await post.populate('autor', 'username avatar')

    res.status(201).json({ message: 'Post criado!', post })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erro ao criar post.' })
  }
}

// GET /api/posts/:id
const buscarPorId = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('autor', 'username avatar bio')
      .populate('comentarios.autor', 'username avatar')

    if (!post) return res.status(404).json({ error: 'Post não encontrado.' })
    await Post.findByIdAndUpdate(req.params.id, { $inc: { visualizacoes: 1 } })

    res.json({ post })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao buscar post.' })
  }
}

// DELETE /api/posts/:id
const deletar = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post não encontrado.' })
    if (!post.autor.equals(req.usuario._id))
      return res.status(403).json({ error: 'Sem permissão.' })

    if (post.imagemPublicId) {
      await cloudinary.uploader.destroy(post.imagemPublicId)
    }
    if (post.videoPublicId) {
      await cloudinary.uploader.destroy(post.videoPublicId, { resource_type: 'video' })
    }

    await post.deleteOne()
    await Usuario.findByIdAndUpdate(req.usuario._id, { $inc: { totalPosts: -1 } })

    res.json({ message: 'Post deletado.' })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao deletar post.' })
  }
}

// POST /api/posts/:id/curtir
const curtir = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post não encontrado.' })

    const jaCurtiu = post.curtidas.includes(req.usuario._id)
    if (jaCurtiu) {
      await Post.findByIdAndUpdate(req.params.id, { $pull: { curtidas: req.usuario._id } })
      res.json({ curtido: false, total: post.curtidas.length - 1 })
    } else {
      await Post.findByIdAndUpdate(req.params.id, { $addToSet: { curtidas: req.usuario._id } })
      res.json({ curtido: true, total: post.curtidas.length + 1 })
    }
  } catch (e) {
    res.status(500).json({ error: 'Erro ao curtir.' })
  }
}

// POST /api/posts/:id/comentarios
const comentar = async (req, res) => {
  try {
    const { texto } = req.body
    if (!texto?.trim()) return res.status(400).json({ error: 'Comentário vazio.' })

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $push: { comentarios: { autor: req.usuario._id, texto } } },
      { new: true }
    ).populate('comentarios.autor', 'username avatar')

    if (!post) return res.status(404).json({ error: 'Post não encontrado.' })
    const novoComentario = post.comentarios[post.comentarios.length - 1]
    res.status(201).json({ message: 'Comentário adicionado!', comentario: novoComentario })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao comentar.' })
  }
}

// DELETE /api/posts/:id/comentarios/:cid
const deletarComentario = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post não encontrado.' })

    const comentario = post.comentarios.id(req.params.cid)
    if (!comentario) return res.status(404).json({ error: 'Comentário não encontrado.' })

    if (!comentario.autor.equals(req.usuario._id) && !post.autor.equals(req.usuario._id))
      return res.status(403).json({ error: 'Sem permissão.' })

    await Post.findByIdAndUpdate(req.params.id, { $pull: { comentarios: { _id: req.params.cid } } })
    res.json({ message: 'Comentário removido.' })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao deletar comentário.' })
  }
}

// GET /api/posts/usuario/:username
const postsPorUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ username: req.params.username })
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' })

    const posts = await Post.find({ autor: usuario._id })
      .populate('autor', 'username avatar')
      .sort({ createdAt: -1 })

    res.json({ posts })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao buscar posts.' })
  }
}

// GET /api/posts/trending
const trending = async (req, res) => {
  try {
    const posts = await Post.aggregate([
      { $addFields: { totalCurtidas: { $size: '$curtidas' } } },
      { $sort: { totalCurtidas: -1, createdAt: -1 } },
      { $limit: 20 },
      { $lookup: { from: 'usuarios', localField: 'autor', foreignField: '_id', as: 'autor' } },
      { $unwind: '$autor' },
      { $project: { 'autor.senha': 0 } }
    ])
    res.json({ posts })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao buscar trending.' })
  }
}

module.exports = { feed, feedSeguindo, criar, buscarPorId, deletar, curtir, comentar, deletarComentario, postsPorUsuario, trending }
