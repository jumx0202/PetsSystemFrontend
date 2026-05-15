<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-title">宠物管理系统</div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/adoption" class="nav-link">领养/救助</router-link>
        <router-link to="/lost" class="nav-link">寻宠</router-link>
        <router-link to="/forum" class="nav-link">论坛</router-link>
        <router-link to="/ai-recognize" class="nav-link">AI识别</router-link>
        <router-link to="/pet-profile" class="nav-link">宠物档案</router-link>
        <router-link to="/pet-location" class="nav-link">实时定位</router-link>
      </div>
      
      <!-- 右侧登录/用户区域 -->
      <div class="nav-user">
        <!-- 未登录状态 -->
        <template v-if="!isLoggedIn">
          <button class="auth-btn login-btn" @click="openLoginModal">登录</button>
          <button class="auth-btn register-btn" @click="openRegisterModal">注册</button>
        </template>
        
        <!-- 已登录状态 -->
        <template v-else>
          <div class="user-avatar-wrapper" @click="toggleUserMenu">
            <img :src="currentUser.avatar" alt="用户头像" class="user-avatar" />
            <div v-if="showUserMenu" class="user-dropdown">
              <div class="user-info">
                <span class="user-name">{{ currentUser.username }}</span>
                <span class="user-phone">{{ currentUser.phone }}</span>
              </div>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item" @click="goToProfile">个人空间</button>
              <button class="dropdown-item" @click="openProfileModal">修改资料</button>
              <button class="dropdown-item logout-btn" @click="logout">退出登录</button>
            </div>
          </div>
        </template>
      </div>
    </div>
    
    <!-- 登录弹窗 -->
    <div v-if="showLoginModal" class="modal-overlay" @click="closeLoginModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeLoginModal">×</button>
        <h3 class="modal-title">用户登录</h3>
        <div class="form-group">
          <label>手机号码</label>
          <input 
            v-model="loginForm.phone" 
            type="tel" 
            placeholder="请输入11位手机号码"
            maxlength="11"
            @keyup.enter="handleLogin"
          />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
          />
        </div>
        <div v-if="loginError" class="error-message">{{ loginError }}</div>
        <div class="modal-footer">
          <button class="submit-btn" @click="handleLogin" :disabled="isLoading">
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
        </div>
        <div class="switch-tip">
          还没有账号？<span @click="switchToRegister">立即注册</span>
        </div>
      </div>
    </div>
    
    <!-- 注册弹窗 -->
    <div v-if="showRegisterModal" class="modal-overlay" @click="closeRegisterModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeRegisterModal">×</button>
        <h3 class="modal-title">用户注册</h3>
        <div class="form-group">
          <label>用户名</label>
          <input 
            v-model="registerForm.username" 
            type="text" 
            placeholder="请输入用户名"
          />
        </div>
        <div class="form-group">
          <label>手机号码</label>
          <input 
            v-model="registerForm.phone" 
            type="tel" 
            placeholder="请输入11位手机号码"
            maxlength="11"
          />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input 
            v-model="registerForm.password" 
            type="password" 
            placeholder="请输入密码（至少6位）"
          />
        </div>
        <div class="form-group">
          <label>确认密码</label>
          <input 
            v-model="registerForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入密码"
            @keyup.enter="handleRegister"
          />
        </div>
        <div v-if="registerError" class="error-message">{{ registerError }}</div>
        <div class="modal-footer">
          <button class="submit-btn" @click="handleRegister" :disabled="isLoading">
            {{ isLoading ? '注册中...' : '注册' }}
          </button>
        </div>
        <div class="switch-tip">
          已有账号？<span @click="switchToLogin">立即登录</span>
        </div>
      </div>
    </div>

    <div v-if="showProfileModal" class="modal-overlay" @click="closeProfileModal">
      <div class="modal-content profile-modal" @click.stop>
        <button class="modal-close" @click="closeProfileModal">×</button>
        <h3 class="modal-title">修改资料</h3>

        <input class="fake-autofill" type="text" autocomplete="username" tabindex="-1" />
        <input class="fake-autofill" type="password" autocomplete="new-password" tabindex="-1" />

        <div class="form-group">
          <label>用户昵称</label>
          <input
            v-model.trim="profileForm.username"
            type="text"
            placeholder="请输入新的昵称"
            maxlength="20"
          />
        </div>

        <div class="form-group">
          <label>头像地址</label>
          <input
            v-model.trim="profileForm.avatar"
            type="url"
            placeholder="请输入头像图片地址"
            autocomplete="off"
          />
        </div>

        <div class="avatar-preview-block">
          <div class="avatar-preview-label">头像预览</div>
          <img
            :src="profileAvatarPreview"
            alt="头像预览"
            class="profile-avatar-preview"
            @error="handleProfileAvatarError"
          />
        </div>

        <div class="form-group">
          <label>原密码</label>
          <input
            v-model="profileForm.oldPassword"
            :readonly="!passwordFieldsEnabled"
            type="password"
            placeholder="请输入原密码"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            data-lpignore="true"
            @focus="unlockPasswordFields"
          />
        </div>

        <div class="form-group">
          <label>新密码</label>
          <input
            v-model="profileForm.newPassword"
            :readonly="!passwordFieldsEnabled"
            type="password"
            placeholder="请输入新密码（至少6位）"
            autocomplete="new-password"
            autocapitalize="off"
            spellcheck="false"
            data-lpignore="true"
            @focus="unlockPasswordFields"
          />
        </div>

        <div class="form-group">
          <label>确认新密码</label>
          <input
            v-model="profileForm.confirmPassword"
            :readonly="!passwordFieldsEnabled"
            type="password"
            placeholder="请再次输入新密码"
            autocomplete="new-password"
            autocapitalize="off"
            spellcheck="false"
            data-lpignore="true"
            @focus="unlockPasswordFields"
          />
        </div>

        <div v-if="profileError" class="error-message">{{ profileError }}</div>
        <div v-if="profileSuccess" class="success-message">{{ profileSuccess }}</div>

        <div class="modal-footer">
          <button class="submit-btn" @click="handleProfileSave" :disabled="isProfileSaving">
            {{ isProfileSaving ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ============ 用户状态 ============
const isLoggedIn = ref(false)
const currentUser = ref({
  id: null as number | null,
  username: '',
  phone: '',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
  token: ''
})
const showUserMenu = ref(false)

// ============ 登录弹窗 ============
const showLoginModal = ref(false)
const loginForm = reactive({
  phone: '',
  password: ''
})
const loginError = ref('')

// ============ 注册弹窗 ============
const showRegisterModal = ref(false)
const registerForm = reactive({
  username: '',
  phone: '',
  password: '',
  confirmPassword: ''
})
const registerError = ref('')

// ============ 加载状态 ============
const isLoading = ref(false)
const isProfileSaving = ref(false)

// ============ API 基础配置 ============
const API_BASE_URL = 'http://localhost:8080/api'  // 根据后端实际地址修改

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

const showProfileModal = ref(false)
const passwordFieldsEnabled = ref(false)
const profileError = ref('')
const profileSuccess = ref('')
const profileForm = reactive({
  username: '',
  avatar: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const profileAvatarPreview = computed(() => profileForm.avatar || currentUser.value.avatar || DEFAULT_AVATAR)

// 封装请求方法
const request = async (url: string, method: string, data?: any) => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  }
  
  if (data) {
    options.body = JSON.stringify(data)
  }
  
  // 如果有token，添加到请求头
  const token = localStorage.getItem('token')
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, options)
  return response.json()
}

// ============ 初始化：检查本地存储的登录状态 ============
onMounted(() => {
  const savedToken = localStorage.getItem('token')
  const savedUser = localStorage.getItem('userInfo')
  
  if (savedUser) {
    const parsedUser = JSON.parse(savedUser)
    const token = savedToken || parsedUser.token

    // 避免 token 丢失导致后续页面误判未登录
    if (token) {
      localStorage.setItem('token', token)
      currentUser.value = { ...parsedUser, token }
      isLoggedIn.value = true
    }
  }
  
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// ============ 弹窗控制 ============
const openLoginModal = () => {
  showLoginModal.value = true
  loginError.value = ''
}

const openRegisterModal = () => {
  showRegisterModal.value = true
  registerError.value = ''
}

const closeLoginModal = () => {
  showLoginModal.value = false
  loginForm.phone = ''
  loginForm.password = ''
  loginError.value = ''
}

const closeRegisterModal = () => {
  showRegisterModal.value = false
  registerForm.username = ''
  registerForm.phone = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
  registerError.value = ''
}

const resetProfileForm = () => {
  profileForm.username = currentUser.value.username || ''
  profileForm.avatar = currentUser.value.avatar || ''
  profileForm.oldPassword = ''
  profileForm.newPassword = ''
  profileForm.confirmPassword = ''
  passwordFieldsEnabled.value = false
  profileError.value = ''
  profileSuccess.value = ''
}

const openProfileModal = () => {
  showUserMenu.value = false
  resetProfileForm()
  showProfileModal.value = true
}

const closeProfileModal = () => {
  showProfileModal.value = false
  resetProfileForm()
}

const switchToRegister = () => {
  closeLoginModal()
  openRegisterModal()
}

const switchToLogin = () => {
  closeRegisterModal()
  openLoginModal()
}

// ============ 登录处理 ============
const handleLogin = async () => {
  // 表单验证
  if (!loginForm.phone.trim()) {
    loginError.value = '请输入手机号码'
    return
  }
  if (!/^1[3-9]\d{9}$/.test(loginForm.phone)) {
    loginError.value = '请输入正确的11位手机号码'
    return
  }
  if (!loginForm.password) {
    loginError.value = '请输入密码'
    return
  }
  
  isLoading.value = true
  loginError.value = ''
  
  try {
    const result = await request(
      `/user/login?phone=${loginForm.phone}&password=${loginForm.password}`,
      'POST'
    )
    
    if (result.code === 200) {
      // 登录成功，保存用户信息
      const userData = result.data
      const token = userData.token || ''
      currentUser.value = {
        id: userData.id,
        username: userData.username,
        phone: userData.phone,
        avatar: userData.avatar || DEFAULT_AVATAR,
        token
      }
      
      // 保存到本地存储
      localStorage.setItem('token', token)
      localStorage.setItem('userInfo', JSON.stringify(currentUser.value))
      
      isLoggedIn.value = true
      closeLoginModal()
      
      // 登录成功提示（可选）
      console.log('登录成功')
    } else {
      // 登录失败
      loginError.value = result.message || '登录失败'
      
      // 如果用户不存在，提示注册
      if (result.message && result.message.includes('不存在')) {
        setTimeout(() => {
          closeLoginModal()
          openRegisterModal()
          registerForm.phone = loginForm.phone
        }, 1500)
      }
    }
  } catch (error) {
    loginError.value = '网络错误，请稍后重试'
    console.error('登录错误:', error)
  } finally {
    isLoading.value = false
  }
}

// ============ 注册处理 ============
const handleRegister = async () => {
  // 表单验证
  if (!registerForm.username.trim()) {
    registerError.value = '请输入用户名'
    return
  }
  if (!registerForm.phone.trim()) {
    registerError.value = '请输入手机号码'
    return
  }
  if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
    registerError.value = '请输入正确的11位手机号码'
    return
  }
  if (!registerForm.password || registerForm.password.length < 6) {
    registerError.value = '密码至少6位'
    return
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    registerError.value = '两次输入的密码不一致'
    return
  }
  
  isLoading.value = true
  registerError.value = ''
  
  try {
    const result = await request('/user/register', 'POST', {
      username: registerForm.username,
      phone: registerForm.phone,
      password: registerForm.password
    })
    
    if (result.code === 200) {
      // 注册成功，自动登录
      const userData = result.data
      const token = userData.token || ''
      currentUser.value = {
        id: userData.id,
        username: userData.username,
        phone: userData.phone,
        avatar: userData.avatar || DEFAULT_AVATAR,
        token
      }
      
      // 保存到本地存储
      localStorage.setItem('token', token)
      localStorage.setItem('userInfo', JSON.stringify(currentUser.value))
      
      isLoggedIn.value = true
      closeRegisterModal()
      
      console.log('注册并登录成功')
    } else {
      // 注册失败
      registerError.value = result.message || '注册失败'
      
      // 如果手机号已注册，提示登录
      if (result.message && result.message.includes('已注册')) {
        setTimeout(() => {
          closeRegisterModal()
          openLoginModal()
          loginForm.phone = registerForm.phone
        }, 1500)
      }
    }
  } catch (error) {
    registerError.value = '网络错误，请稍后重试'
    console.error('注册错误:', error)
  } finally {
    isLoading.value = false
  }
}

// ============ 退出登录 ============
const logout = () => {
  isLoggedIn.value = false
  currentUser.value = {
    id: null,
    username: '',
    phone: '',
    avatar: DEFAULT_AVATAR,
    token: ''
  }
  
  // 清除本地存储
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  
  showUserMenu.value = false
  showProfileModal.value = false
  router.push('/')
}

// ============ 辅助方法 ============
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-avatar-wrapper')) {
    showUserMenu.value = false
  }
}

const goToProfile = () => {
  showUserMenu.value = false
  router.push('/personal')
}

const unlockPasswordFields = () => {
  if (!passwordFieldsEnabled.value) {
    passwordFieldsEnabled.value = true
  }
}

const handleProfileAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = currentUser.value.avatar || DEFAULT_AVATAR
}

const syncCurrentUser = (payload: { username: string; avatar: string }) => {
  currentUser.value = {
    ...currentUser.value,
    username: payload.username,
    avatar: payload.avatar || DEFAULT_AVATAR
  }
  localStorage.setItem('userInfo', JSON.stringify(currentUser.value))
  window.dispatchEvent(new CustomEvent('user-info-updated', { detail: currentUser.value }))
}

const handleProfileSave = async () => {
  profileError.value = ''
  profileSuccess.value = ''

  if (!profileForm.username) {
    profileError.value = '请输入用户昵称'
    return
  }

  const wantsPasswordChange = !!(profileForm.oldPassword || profileForm.newPassword || profileForm.confirmPassword)
  if (wantsPasswordChange) {
    if (!profileForm.oldPassword) {
      profileError.value = '修改密码前请先输入原密码'
      return
    }
    if (!profileForm.newPassword || profileForm.newPassword.length < 6) {
      profileError.value = '新密码至少需要 6 位'
      return
    }
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      profileError.value = '两次输入的新密码不一致'
      return
    }
    if (profileForm.oldPassword === profileForm.newPassword) {
      profileError.value = '新密码不能与原密码相同'
      return
    }
  }

  isProfileSaving.value = true

  try {
    const updateResult = await request('/user/update', 'PUT', {
      username: profileForm.username,
      phone: currentUser.value.phone,
      avatar: profileForm.avatar
    })

    if (updateResult.code !== 200) {
      profileError.value = updateResult.message || '资料保存失败'
      return
    }

    if (wantsPasswordChange) {
      const passwordResult = await request(
        `/user/password?oldPassword=${encodeURIComponent(profileForm.oldPassword)}&newPassword=${encodeURIComponent(profileForm.newPassword)}`,
        'PUT'
      )

      if (passwordResult.code !== 200) {
        profileError.value = passwordResult.message || '密码修改失败'
        return
      }
    }

    syncCurrentUser({
      username: profileForm.username,
      avatar: profileForm.avatar || DEFAULT_AVATAR
    })
    profileSuccess.value = wantsPasswordChange ? '资料和密码已更新' : '资料已更新'
    resetProfileForm()
    showProfileModal.value = false
  } catch (error) {
    profileError.value = '保存失败，请稍后重试'
    console.error('更新资料失败:', error)
  } finally {
    isProfileSaving.value = false
  }
}
</script>

<style scoped>
/* 样式保持不变，与原来相同 */
.navbar {
  background-color: white;
  padding: 20px;
  position: relative;
}

.nav-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 0 0 0 75px;
  gap: 100px;
  position: relative;
}

.nav-title {
  font-size: 1.5em;
  font-weight: bold;
  color: black;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: black;
  text-decoration: none;
  padding: 10px 15px;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: #e0e0e0;
}

.nav-link.router-link-active {
  background-color: #007bff;
  color: white;
}

/* 用户区域样式 */
.nav-user {
  position: absolute;
  right: 75px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.auth-btn {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.login-btn {
  background-color: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}

.login-btn:hover {
  background-color: #007bff;
  color: white;
}

.register-btn {
  background-color: #007bff;
  color: white;
}

.register-btn:hover {
  background-color: #0056b3;
}

.user-avatar-wrapper {
  position: relative;
  cursor: pointer;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e0e0e0;
  transition: border-color 0.3s;
}

.user-avatar:hover {
  border-color: #007bff;
}

.user-dropdown {
  position: absolute;
  top: 50px;
  right: 0;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  padding: 10px 0;
  z-index: 1000;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-info {
  padding: 10px 15px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.user-phone {
  font-size: 12px;
  color: #888;
}

.dropdown-divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 8px 0;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 15px;
  text-align: left;
  background: none;
  border: none;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.logout-btn {
  color: #dc3545;
}

.logout-btn:hover {
  background-color: #fff5f5;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  padding: 30px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #e0e0e0;
  color: #333;
}

.modal-title {
  text-align: center;
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
  text-align: left;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.error-message {
  color: #dc3545;
  font-size: 13px;
  margin-bottom: 15px;
  text-align: center;
  padding: 8px;
  background-color: #fff5f5;
  border-radius: 6px;
}

.success-message {
  color: #1b7f3b;
  font-size: 13px;
  margin-bottom: 15px;
  text-align: center;
  padding: 8px;
  background-color: #eefbf3;
  border-radius: 6px;
}

.modal-footer {
  margin-top: 20px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.switch-tip {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.switch-tip span {
  color: #007bff;
  cursor: pointer;
  font-weight: 500;
}

.switch-tip span:hover {
  text-decoration: underline;
}

.profile-modal {
  max-width: 440px;
}

.avatar-preview-block {
  margin: -4px 0 18px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.avatar-preview-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.profile-avatar-preview {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
  background: #f8fafc;
}

.fake-autofill {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

/* 响应式 */
@media (max-width: 768px) {
  .nav-container {
    margin: 0 20px;
    gap: 20px;
  }
  
  .nav-links {
    gap: 10px;
  }
  
  .nav-link {
    padding: 8px 10px;
    font-size: 14px;
  }
  
  .nav-user {
    right: 20px;
  }
  
  .auth-btn {
    padding: 6px 14px;
    font-size: 13px;
  }
}
</style>
