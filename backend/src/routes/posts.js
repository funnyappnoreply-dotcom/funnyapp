const router = require('express').Router()
const { autenticar, autenticarOpcional } = require('../middleware/auth')
const { uploadMidia } = require('../config/cloudinary')
const { denunciar } = require('../controllers/denunciaController')
const {
  feed, feedSeguindo, criar, buscarPorId, deletar,
  curtir, comentar, deletarComentario, postsPorUsuario, trending
} = require('../controllers/postController')

router.get('/', feed)
router.get('/trending', trending)
router.get('/seguindo', autenticar, feedSeguindo)
router.get('/usuario/:username', postsPorUsuario)
router.get('/:id', autenticarOpcional, buscarPorId)
router.post('/', autenticar, uploadMidia.any(), criar)
router.delete('/:id', autenticar, deletar)
router.post('/:id/curtir', autenticar, curtir)
router.post('/:id/comentarios', autenticar, comentar)
router.delete('/:id/comentarios/:cid', autenticar, deletarComentario)
router.post('/:id/denunciar', autenticar, denunciar)
module.exports = router
