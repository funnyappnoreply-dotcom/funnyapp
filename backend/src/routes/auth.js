const router = require('express').Router()
const { body } = require('express-validator')
const { autenticar } = require('../middleware/auth')
const { upload } = require('../config/cloudinary')
const {
  registrar, login, confirmarEmail, esqueciSenha, redefinirSenha,
  perfil, atualizarPerfil, buscarUsuario, seguir, buscarUsuarios
} = require('../controllers/authController')

router.post('/registro', [
  body('username').trim().isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username inválido'),
  body('email').isEmail().normalizeEmail(),
  body('senha').isLength({ min: 6 }).withMessage('Senha mínimo 6 caracteres')
], registrar)

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('senha').notEmpty()
], login)

router.get('/confirmar-email/:token', confirmarEmail)
router.post('/esqueci-senha', esqueciSenha)
router.post('/redefinir-senha/:token', redefinirSenha)

router.get('/me', autenticar, perfil)
router.put('/me', autenticar, upload.single('avatar'), atualizarPerfil)
router.get('/buscar', buscarUsuarios)
router.get('/:username', buscarUsuario)
router.post('/:id/seguir', autenticar, seguir)

module.exports = router
