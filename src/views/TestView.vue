<template>
  <div class="test-box">
    <h2>🔌 前后端连接测试</h2>
    <button @click="checkConnection" :disabled="loading">
      {{ loading ? '测试中...' : '点击测试连接' }}
    </button>
    
    <div v-if="result" :class="['result', success ? 'success' : 'fail']">
      {{ result }}
    </div>
  </div>
</template>

<script>
import { testPing } from '@/api/test.js'

export default {
  data() {
    return {
      loading: false,
      result: '',
      success: false
    }
  },
  methods: {
    async checkConnection() {
      this.loading = true
      this.result = ''
      
      try {
        const data = await testPing()
        this.result = `✅ ${data.message} (时间: ${data.time})`
        this.success = true
      } catch (err) {
        this.result = `❌ 连接失败: ${err.message}`
        this.success = false
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.test-box { padding: 20px; text-align: center; }
button { 
  padding: 10px 20px; 
  cursor: pointer;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
}
button:disabled { background: #ccc; }
.result { 
  margin-top: 20px; 
  padding: 15px;
  border-radius: 4px;
}
.success { background: #e8f5e9; color: #2e7d32; }
.fail { background: #ffebee; color: #c62828; }
</style>