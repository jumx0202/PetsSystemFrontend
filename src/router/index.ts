import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Adoption from '../views/Adoption.vue'
import PostAdoption from '../views/PostAdoption.vue'
import Lost from '../views/Lost.vue'
import PostLost from '../views/PostLost.vue'
import Forum from '../views/Forum.vue'
import Personal from '../views/Personal.vue'
import AiRecognize from '../views/AiRecognize.vue'
// @ts-ignore
import TestView from '../views/TestView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/test',
      name: 'test',
      component: TestView,
    },
    {
      path: '/ai-recognize',
      name: 'aiRecognize',
      component: AiRecognize,
    },
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/adoption',
      name: 'adoption',
      component: Adoption
    },
    {
      path: '/PostAdoption',
      name: 'PostAdoption',
      component: PostAdoption,
      // 隐藏菜单栏
      meta: {hideNavBar: true}
    },
    {
      path: '/lost',
      name: 'lost',
      component: Lost
    },
    {
      path: '/PostLost',
      name: 'PostLost',
      component: PostLost,
      // 隐藏菜单栏
      meta: {hideNavBar: true}
    },
    {
      path: '/forum',
      name: 'forum',
      component: Forum
    },
    {
      path: '/pet-profile',
      name: 'petProfile',
      component: () => import('../views/PetProfile.vue'),
      meta: {requiresAuth: true}
    },
    {
      path: '/personal',
      name: 'personal',
      // component: Personal,
      component: () => import('../views/Personal.vue'),
       // 隐藏菜单栏
      meta: {hideNavBar: true}
    }
  ],
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isLoggedIn = !!token

  // 如果页面需要登录，但未登录，跳转到登录页
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/')
    return
  }

  next()
})

export default router

