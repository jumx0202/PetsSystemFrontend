import axios from 'axios'

const request = axios.create({
  baseURL: 'http://localhost:8080',  // 后端地址
  timeout: 5000  // 超时时间
})

// 请求拦截器 - 添加 Token
request.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    
    // 如果有 token，添加到请求头
    if (token) {
    //   config.headers['Authorization'] = token
      // 或者如果后端需要 Bearer 前缀：
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    console.log('发送请求:', config.url, token ? '(已携带token)' : '(未登录)')
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器 - 处理 401 错误
request.interceptors.response.use(
  response => {
    console.log('收到响应:', response.data)
    return response.data
  },
  error => {
    console.error('请求错误:', error.message)
    
    // 处理 401 未授权错误
    if (error.response && error.response.status === 401) {
      console.warn('Token 无效或过期，清除登录状态')
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      
      // 可以在这里跳转登录页或打开登录弹窗
      // window.location.href = '/'
      window.dispatchEvent(new CustomEvent('auth-erroe'))  // 触发全局 logout 事件，组件可以监听这个事件来处理 UI 更新
    }
    
    return Promise.reject(error)
  }
)

export default request