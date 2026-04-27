import { createRouter, createWebHistory } from 'vue-router'
import { Message } from '../utils/message'
import Home from '../views/Home.vue'
import Adoption from '../views/Adoption.vue'
import PostAdoption from '../views/PostAdoption.vue'
import Lost from '../views/Lost.vue'
import PostLost from '../views/PostLost.vue'
import Forum from '../views/Forum.vue'
import Personal from '../views/Personal.vue'
import AiRecognize from '../views/AiRecognize.vue'
import AIChat from '../views/AIChat.vue';
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
      path: '/ai-model-info',
      name: 'aiModelInfo',
      component: () => import('../views/AiModelInfo.vue'),
      meta: {hideNavBar: true}
    },
    {
      path: '/personal',
      name: 'personal',
      // component: Personal,
      component: () => import('../views/Personal.vue'),
       // 隐藏菜单栏
      meta: {hideNavBar: true}
    },
    {
      path: '/aichat',
      name: 'aichat',
      component: AIChat,
      meta: { hideNavBar: true }
    }
  ],
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isLoggedIn = !!token

  // 如果页面需要登录，但未登录，跳转到登录页
  if (to.meta.requiresAuth && !isLoggedIn) {
    Message.warning('请先登录后再访问此页面')
    next(from.path !== '/' ? from.path : '/')
    return
  }

  next()
})

export default router

