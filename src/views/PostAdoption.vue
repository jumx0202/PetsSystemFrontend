<template>
  <div class="publish-adoption">
    <!-- 顶部导航栏 -->
    <div class="header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="page-title">
        <span class="icon">🐕</span>
        {{ isEditMode ? '编辑领养' : '发布领养' }}
      </h1>
      <div class="placeholder"></div>
    </div>

    <!-- 表单内容 -->
    <div class="form-container">
      <!-- 图片上传区域 -->
      <div class="form-section">
        <div class="section-title">
          <span class="required">*</span>
          宠物照片
        </div>
        <div class="upload-area">
          <div 
            v-for="(img, index) in uploadedImages" 
            :key="index" 
            class="image-preview"
          >
            <img :src="img" />
            <button class="remove-btn" @click="removeImage(index)">×</button>
          </div>
          
          <!-- 移除了数量限制 v-if="uploadedImages.length < 4" -->
          <div 
            class="upload-btn"
            @click="triggerUpload"
          >
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            <span class="upload-text">添加图片</span>
            <!-- 显示当前上传数量 -->
            <span class="upload-hint">已上传 {{ uploadedImages.length }} 张</span>
          </div>
          
          <input 
            ref="fileInput" 
            type="file" 
            accept="image/jpeg,image/png" 
            multiple 
            style="display: none"
            @change="handleFileChange"
          />
        </div>
        <!-- 移除了大小限制提示 -->
        <p class="upload-tip">支持 JPG/PNG 格式</p>
      </div>

      <!-- 基本信息 -->
      <div class="form-section">
        <div class="form-row">
          <label class="form-label">
            <span class="required">*</span>
            性别
          </label>
          <div class="select-wrapper">
            <div 
              class="custom-select"
              @click="showGenderDropdown = !showGenderDropdown"
            >
              <span :class="{ 'placeholder': !form.gender }">
                {{ form.gender || '请选择性别' }}
              </span>
              <svg 
                class="arrow-icon"
                :class="{ 'rotate': showGenderDropdown }"
                viewBox="0 0 24 24" 
                width="16" 
                height="16" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            
            <div v-show="showGenderDropdown" class="dropdown-menu">
              <div 
                v-for="gender in genders" 
                :key="gender"
                class="dropdown-item"
                :class="{ 'active': form.gender === gender }"
                @click="selectGender(gender)"
              >
                {{ gender }}
              </div>
            </div>
          </div>
        </div>

        <div class="form-row">
          <label class="form-label">
            <span class="required">*</span>
            种类
          </label>
          <input 
            v-model="form.breed"
            type="text" 
            class="form-input"
            placeholder="请填写宠物种类，如：金毛寻回犬、布偶猫"
          />
        </div>
      </div>

      <!-- 地点信息 -->
      <div class="form-section">
        <div class="section-title">地点信息</div>
        
        <div class="form-row">
          <label class="form-label">
            <span class="required">*</span>
            所在城市
          </label>
          <div class="location-input-wrapper">
            <input 
              v-model="form.city"
              type="text" 
              class="form-input"
              placeholder="请输入城市名称"
            />
            <button class="location-btn" @click="getLocation" :disabled="isLocating">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
              </svg>
              <span>{{ isLocating ? '定位中...' : '定位' }}</span>
            </button>
          </div>
        </div>

        <div class="form-row">
          <label class="form-label">
            <span class="required">*</span>
            详细地址
          </label>
          <input 
            v-model="form.district"
            type="text" 
            class="form-input"
            placeholder="请输入详细地址"
          />
        </div>
      </div>

      <!-- 联系方式（非必填） -->
      <div class="form-section">
        <div class="section-title">
          联系方式
        </div>
        
        <div class="form-row">
          <label class="form-label">
            <span class="required">*</span>
            联系人
          </label>
          <input 
            v-model="form.contactName"
            type="text" 
            class="form-input"
            placeholder="请输入联系人姓名"
          />
        </div>

        <div class="form-row">
          <label class="form-label">
            <span class="required">*</span>
            联系电话
          </label>
          <input 
            v-model="form.contactPhone"
            type="tel" 
            class="form-input"
            placeholder="请输入手机号码"
          />
        </div>

        <div class="form-row">
          <label class="form-label">微信号</label>
          <input 
            v-model="form.contactWechat"
            type="text" 
            class="form-input"
            placeholder="请输入微信号"
          />
        </div>
      </div>

      <!-- 补充描述 -->
      <div class="form-section">
        <div class="section-title">补充描述</div>
        <textarea 
          v-model="form.description"
          class="form-textarea"
          placeholder="描述一下宠物的性格、健康状况、领养要求等..."
          rows="4"
        ></textarea>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="footer-bar">
      <button class="draft-btn" @click="saveDraft">存草稿</button>
      <button 
        class="submit-btn" 
        :disabled="!isFormValid"
        @click="submitForm"
      >
        {{ isEditMode ? '保存修改' : '立即发布' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// @ts-ignore
import request from '../api/request.js'

const router = useRouter()
const route = useRoute()
const editingPostId = ref<number | null>(null)
const isEditMode = computed(() => editingPostId.value !== null)

// ============ 表单数据 ============
const form = reactive({
  gender: '',
  breed: '',
  city: '',
  district: '',
  contactName: '',
  contactPhone: '',
  contactWechat: '',
  description: ''
})

// ============ 性别选择 ============
const genders = ['公', '母', '不详']
const showGenderDropdown = ref(false)

const selectGender = (gender: string) => {
  form.gender = gender
  showGenderDropdown.value = false
}

// 点击外部关闭下拉
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.select-wrapper')) {
    showGenderDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// ============ 图片上传 ============
const fileInput = ref<HTMLInputElement | null>(null)
const uploadedImages = ref<string[]>([])

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  
  if (!files) return
  
  Array.from(files).forEach(file => {
    // 移除了 5MB 大小限制检查
    
    const reader = new FileReader()
    reader.onload = (e) => {
      // 移除了 4张数量限制，可以无限添加
      uploadedImages.value.push(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  })
  
  // 清空input，允许重复选择相同文件
  target.value = ''
}

const removeImage = (index: number) => {
  uploadedImages.value.splice(index, 1)
}

const dataUrlToFile = (dataUrl: string, filename: string): File => {
  const parts = dataUrl.split(',')
  const header = parts[0] ?? ''
  const mimeMatch = header.match(/data:(.*?);base64/)
  const mime = mimeMatch?.[1] || 'image/png'
  const base64 = parts[1]
  if (!base64) {
    throw new Error('图片数据格式错误')
  }
  const binary = atob(base64)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i)
  }
  return new File([array], filename, { type: mime })
}

const resolveImageUrls = async (): Promise<string[]> => {
  const existingUrls = uploadedImages.value.filter(img => /^https?:\/\//.test(img))
  const newImages = uploadedImages.value.filter(img => !/^https?:\/\//.test(img))
  if (newImages.length === 0) {
    return existingUrls
  }

  const files = newImages.map((img, index) =>
    dataUrlToFile(img, `adoption-${Date.now()}-${index}.png`)
  )
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))
  const res = await request.post('/api/upload/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  if (res?.code === 200 && Array.isArray(res?.data)) {
    return [...existingUrls, ...(res.data as string[])]
  }
  throw new Error(res?.message || '图片上传失败')
}

const loadPostForEdit = async (postId: number) => {
  try {
    const res = await request.get(`/api/adoption/${postId}`)
    const post = res?.data
    if (res?.code !== 200 || !post) {
      alert(res?.message || '加载帖子失败')
      router.replace('/personal')
      return
    }
    form.gender = post.gender || ''
    form.breed = post.breed || ''
    form.city = post.city || ''
    form.district = post.district || ''
    form.contactName = post.contactName || ''
    form.contactPhone = post.contactPhone || ''
    form.contactWechat = post.contactWechat || ''
    form.description = post.description || ''
    uploadedImages.value = Array.isArray(post.images) ? post.images : []
  } catch (error) {
    console.error('加载领养帖子失败', error)
    alert('加载帖子失败，请稍后重试')
    router.replace('/personal')
  }
}

// ============ 定位功能 ============
const isLocating = ref(false)

const getLocation = () => {
  isLocating.value = true
  
  if (!navigator.geolocation) {
    alert('您的浏览器不支持地理定位')
    isLocating.value = false
    return
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setTimeout(() => {
        form.city = '北京市'
        form.district = '朝阳区'
        isLocating.value = false
      }, 1000)
    },
    (error) => {
      alert('定位失败，请手动输入地址')
      isLocating.value = false
    }
  )
}

// ============ 表单验证 ============
const isFormValid = computed(() => {
  return form.gender && 
         form.breed.trim() && 
         form.city.trim() &&
         uploadedImages.value.length > 0  // 仍需要至少一张图片
})

// ============ 操作按钮 ============
const goBack = () => {
  router.back()
}

const saveDraft = () => {
  const draft = {
    ...form,
    images: uploadedImages.value,
    savedAt: new Date().toISOString()
  }
  localStorage.setItem('adoptionDraft', JSON.stringify(draft))
  alert('草稿已保存')
}

const submitForm = async () => {
  if (!isFormValid.value) return

  let imageUrls: string[] = []
  try {
    imageUrls = await resolveImageUrls()
  } catch (error) {
    console.error('上传图片失败', error)
    alert('图片上传失败，请重试')
    return
  }

  const payload = {
    gender: form.gender,
    breed: form.breed,
    city: form.city,
    district: form.district,
    contactName: form.contactName,
    contactPhone: form.contactPhone,
    contactWechat: form.contactWechat,
    description: form.description,
    images: imageUrls,
  }

  try {
    const res = isEditMode.value
      ? await request.put(`/api/adoption/${editingPostId.value}`, payload)
      : await request.post('/api/adoption/publish', payload)
    if (res?.code === 200) {
      alert(isEditMode.value ? '更新成功！' : '发布成功！')
      router.push('/personal')
      return
    }
    alert(res?.message || (isEditMode.value ? '更新失败，请稍后再试' : '发布失败，请稍后再试'))
  } catch (error) {
    console.error('保存领养帖子失败', error)
    alert(isEditMode.value ? '更新失败，请检查网络或登录状态' : '发布失败，请检查网络或登录状态')
  }
}

onMounted(async () => {
  const mode = String(route.query.mode || '')
  const id = Number(route.query.id)
  if (mode === 'edit' && Number.isFinite(id) && id > 0) {
    editingPostId.value = id
    await loadPostForEdit(id)
  }
})
</script>

<style scoped>
.publish-adoption {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 80px;
}

/* ========== 顶部导航 ========== */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.back-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #e8e8e8;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.page-title .icon {
  font-size: 22px;
}

.placeholder {
  width: 36px;
}

/* ========== 表单容器 ========== */
.form-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-section {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ========== 图片上传 ========== */
.upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.image-preview {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border: none;
  background: rgba(0,0,0,0.5);
  color: #fff;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: rgba(0,0,0,0.7);
}

.upload-btn {
  width: 100px;
  height: 100px;
  border: 2px dashed #d0d0d0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #999;
}

.upload-btn:hover {
  border-color: #00a8e8;
  color: #00a8e8;
  background: #f0f9ff;
}

.upload-text {
  font-size: 13px;
  margin-top: 6px;
}

.upload-hint {
  font-size: 11px;
  color: #bbb;
  margin-top: 2px;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin: 12px 0 0;
}

/* ========== 表单行 ========== */
.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 14px;
  color: #555;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 2px;
}

.required {
  color: #ff6b6b;
  font-weight: 600;
}

/* ========== 输入框 ========== */
.form-input {
  height: 44px;
  padding: 0 14px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  color: #333;
  background: #fafafa;
  transition: all 0.2s;
  outline: none;
}

.form-input:focus {
  border-color: #00a8e8;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(0,168,232,0.1);
}

.form-input::placeholder {
  color: #bbb;
}

/* ========== 下拉选择 ========== */
.select-wrapper {
  position: relative;
}

.custom-select {
  height: 44px;
  padding: 0 14px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
}

.custom-select:hover {
  border-color: #00a8e8;
}

.custom-select span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  flex: 1;
  min-width: 0;
}

.custom-select .placeholder {
  color: #bbb;
}

.arrow-icon {
  color: #999;
  transition: transform 0.2s;
  flex-shrink: 0;
  margin-left: 8px;
}

.arrow-icon.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 50;
  overflow: hidden;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  padding: 12px 14px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
  border-bottom: 1px solid #f5f5f5;
  white-space: nowrap;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: #f0f9ff;
  color: #00a8e8;
}

.dropdown-item.active {
  background: #e6f7ff;
  color: #00a8e8;
  font-weight: 500;
}

/* ========== 定位按钮 ========== */
.location-input-wrapper {
  display: flex;
  gap: 10px;
}

.location-input-wrapper .form-input {
  flex: 1;
}

.location-btn {
  height: 44px;
  padding: 0 16px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background: #fff;
  color: #00a8e8;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  white-space: nowrap;
}

.location-btn:hover:not(:disabled) {
  background: #f0f9ff;
  border-color: #00a8e8;
}

.location-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ========== 文本域 ========== */
.form-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  color: #333;
  background: #fafafa;
  resize: vertical;
  min-height: 100px;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.6;
}

.form-textarea:focus {
  border-color: #00a8e8;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(0,168,232,0.1);
}

.form-textarea::placeholder {
  color: #bbb;
}

/* ========== 底部操作栏 ========== */
.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px 24px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 12px;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
}

.draft-btn {
  flex: 1;
  height: 46px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  color: #666;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.draft-btn:hover {
  background: #f5f5f5;
  border-color: #d0d0d0;
}

.submit-btn {
  flex: 2;
  height: 46px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #00a8e8 0%, #0090c9 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0,168,232,0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,168,232,0.4);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

/* ========== 响应式 ========== */
@media (max-width: 480px) {
  .form-container {
    padding: 12px;
  }
  
  .form-section {
    padding: 16px;
  }
  
  .image-preview,
  .upload-btn {
    width: 80px;
    height: 80px;
  }
}
</style>