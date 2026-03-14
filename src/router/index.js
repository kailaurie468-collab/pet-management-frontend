import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    component: Layout,
    redirect: '/pets',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'pets',
        name: 'Pets',
        component: () => import('../views/Pets.vue'),
        meta: { requiresAuth: true, requiresAdmin: false }
      },
      {
        path: 'health-records',
        name: 'HealthRecords',
        component: () => import('../views/HealthRecords.vue'),
        meta: { requiresAuth: true, requiresAdmin: false }
      },
      {
        path: 'doctors',
        name: 'Doctors',
        component: () => import('../views/Doctors.vue'),
        meta: { requiresAuth: true, requiresAdmin: false }
      },
      {
        path: 'services',
        name: 'Services',
        component: () => import('../views/Services.vue'),
        meta: { requiresAuth: true, requiresAdmin: false }
      },
      {
        path: 'expenses',
        name: 'Expenses',
        component: () => import('../views/Expenses.vue'),
        meta: { requiresAuth: true, requiresAdmin: false }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/Users.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'vaccine-records',
        name: 'VaccineRecords',
        component: () => import('../views/VaccineRecords.vue'),
        meta: { requiresAuth: true, requiresAdmin: false }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')

  if (to.path === '/login') {
    if (token && user) {
      next('/')
    } else {
      next()
    }
  } else {
    if (!token || !user) {
      next('/login')
    } else {
      const userInfo = JSON.parse(user)
      if (to.meta.requiresAdmin && userInfo.role.toUpperCase() !== 'ADMIN') {
        next('/pets')
      } else {
        next()
      }
    }
  }
})

export default router