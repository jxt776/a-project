import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import('../views/Login.vue')
const Main = () => import('../views/Main.vue')
const User = () => import('../views/User.vue')
const School = () => import('../views/School.vue')
const Logs = () => import('../views/Logs.vue')

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    redirect:'/login'
  },
  {
    path: '/login',
    component:Login
  },
  {
    path: '/Main',
    component:Main,
    redirect: '/Main/User',
    children:[
        { path: '/Main/User', component: User },
        { path: '/Main/School', component: School },
        { path: '/Main/Logs', component: Logs }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if(to.path == '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next()
})

export default router
