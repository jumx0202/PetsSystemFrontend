<script setup lang="ts">
import NavBar from './components/NavBar.vue'

// 隐藏导航栏
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <div id="app">
    <!-- 隐藏菜单栏 -->
    <NavBar v-if="!route.meta.hideNavBar" />
    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* 灰色背景 */
  /* background-color: #f0f0f0;  */
  background-color: #ffffff;
  min-height: 100vh;
}

/* main {
  padding: 20px;
} */
</style>
