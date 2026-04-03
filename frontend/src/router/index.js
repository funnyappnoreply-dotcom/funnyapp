import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

const routes = [
  { path: '/', component: () => import('../views/FeedView.vue') },
  { path: '/trending', component: () => import('../views/TrendingView.vue') },
  { path: '/login', component: () => import('../views/LoginView.vue'), meta: { publico: true } },
  { path: '/registro', component: () => import('../views/RegistroView.vue'), meta: { publico: true } },
  { path: '/esqueci-senha', component: () => import('../views/EsqueciSenhaView.vue'), meta: { publico: true } },
  { path: '/redefinir-senha/:token', component: () => import('../views/RedefinirSenhaView.vue'), meta: { publico: true } },
  { path: '/confirmar-email/:token', component: () => import('../views/ConfirmarEmailView.vue') },
  { path: '/termos', component: () => import('../views/TermosView.vue') },
  { path: '/privacidade', component: () => import('../views/PrivacidadeView.vue') },
  { path: '/novo', component: () => import('../views/NovoPostView.vue'), meta: { requerAuth: true } },
  { path: '/seguindo', component: () => import('../views/SeguindoView.vue'), meta: { requerAuth: true } },
  { path: '/perfil', component: () => import('../views/PerfilView.vue'), meta: { requerAuth: true } },
  { path: '/post/:id', component: () => import('../views/PostView.vue') },
  { path: '/u/:username', component: () => import('../views/UsuarioView.vue') },
  { path: '/admin', component: () => import('../views/AdminView.vue'), meta: { requerAuth: true, requerAdmin: true } },
  { path: '/:pathMatch(.*)*', component: () => import('../views/NotFoundView.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requerAuth && !auth.autenticado) return next('/login')
  if (to.meta.publico && auth.autenticado) return next('/')
  if (to.meta.requerAdmin && !['admin', 'superadmin'].includes(auth.usuario?.perfil)) return next('/')
  next()
})

export default router
