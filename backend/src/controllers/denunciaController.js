const Denuncia = require('../models/Denuncia')
const Post = require('../models/Post')

// POST /api/posts/:id/denunciar
const denunciar = async (req, res) => {
  try {
    const { motivo, descricao } = req.body
    if (!motivo) return res.status(400).json({ error: 'Motivo é obrigatório.' })

    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post não encontrado.' })

    if (post.autor.equals(req.usuario._id))
      return res.status(400).json({ error: 'Você não pode denunciar seu próprio post.' })

    const jaDenou = await Denuncia.findOne({ post: req.params.id, denunciante: req.usuario._id })
    if (jaDenou) return res.status(409).json({ error: 'Você já denunciou este post.' })

    await Denuncia.create({
      post: req.params.id,
      denunciante: req.usuario._id,
      motivo,
      descricao: descricao || ''
    })

    res.status(201).json({ message: 'Denúncia enviada! Nossa equipe irá analisar.' })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao enviar denúncia.' })
  }
}

module.exports = { denunciar }
