const router = require('express').Router()
const { autenticar, requerAdmin, requerSuperAdmin } = require('../middleware/auth')
const {
  dashboard, listarUsuarios, alterarPerfil, banirUsuario, desbanirUsuario,
  listarPosts, deletarPost, listarDenuncias, analisarDenuncia
} = require('../controllers/adminController')

router.use(autenticar, requerAdmin)

router.get('/dashboard', dashboard)
router.get('/usuarios', listarUsuarios)
router.put('/usuarios/:id/perfil', requerSuperAdmin, alterarPerfil)
router.put('/usuarios/:id/banir', banirUsuario)
router.put('/usuarios/:id/desbanir', desbanirUsuario)
router.get('/posts', listarPosts)
router.delete('/posts/:id', deletarPost)
router.get('/denuncias', listarDenuncias)
router.put('/denuncias/:id', analisarDenuncia)

module.exports = router
