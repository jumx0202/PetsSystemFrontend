<template>
  <div class="publish-adoption">
    <div class="header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="page-title">
        <span class="icon">🐾</span>
        {{ isEditMode ? '编辑领养信息' : '发布领养信息' }}
      </h1>
      <div class="placeholder"></div>
    </div>

    <div class="form-container">
      <div class="form-section">
        <div class="section-title">
          <span class="required">*</span>
          宠物照片
        </div>
        <div class="upload-area">
          <div v-for="(img, index) in uploadedImages" :key="`${img}-${index}`" class="image-preview">
            <img :src="img" alt="宠物照片" />
            <button class="remove-btn" @click="removeImage(index)">×</button>
          </div>

          <div class="upload-btn" @click="triggerUpload">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span class="upload-text">添加图片</span>
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
        <p class="upload-tip">支持 JPG / PNG。上传后会自动识别宠物种类和品种，并辅助填写下方字段。</p>

        <div v-if="aiRecognizing" class="ai-banner ai-loading">
          正在识别图片中的宠物信息...
        </div>
        <div v-else-if="aiRecognitionMessage" class="ai-banner">
          {{ aiRecognitionMessage }}
        </div>
        <div v-else-if="aiRecognitionError" class="ai-banner ai-error">
          {{ aiRecognitionError }}
        </div>
      </div>

      <div class="form-section">
        <div class="form-row">
          <label class="form-label">
            <span class="required">*</span>
            性别
          </label>
          <!-- 横向性别按钮组 -->
          <div class="gender-options">
            <button
                v-for="gender in genders"
                :key="gender"
                type="button"
                class="gender-btn"
                :class="{ active: form.gender === gender }"
                @click="selectGender(gender)"
            >
              {{ gender }}
            </button>
          </div>
        </div>

        <div class="form-row">
          <label class="form-label">
            <span class="required">*</span>
            宠物种类 / 品种
          </label>
          <input
              v-model="form.breed"
              type="text"
              class="form-input"
              placeholder="例如：狗 - 金毛寻回犬，猫 - 布偶猫"
          />
          <p class="field-tip">系统会优先根据图片自动回填，你也可以手动修改。</p>
        </div>
      </div>

      <div class="form-section">
        <div class="section-title">地点信息</div>

        <div class="form-row">
          <label class="form-label">
            <span class="required">*</span>
            所在城市
          </label>
          <div class="location-input-wrapper">
            <input v-model="form.city" type="text" class="form-input address-input" placeholder="请输入城市名称" />
            <button class="location-btn" @click="getLocation" :disabled="isLocating">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
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
          <input v-model="form.district" type="text" class="form-input address-input" placeholder="请输入详细地址" />
        </div>
      </div>

      <div class="form-section">
        <div class="section-title">联系方式</div>

        <div class="form-row">
          <label class="form-label">
            <span class="required">*</span>
            联系人
          </label>
          <input v-model="form.contactName" type="text" class="form-input" placeholder="请输入联系人姓名" />
        </div>

        <div class="form-row">
          <label class="form-label">
            <span class="required">*</span>
            联系电话
          </label>
          <input v-model="form.contactPhone" type="tel" class="form-input" placeholder="请输入手机号" />
        </div>

        <div class="form-row">
          <label class="form-label">微信号</label>
          <input v-model="form.contactWechat" type="text" class="form-input" placeholder="请输入微信号" />
        </div>
      </div>

      <div class="form-section">
        <div class="section-title">补充描述</div>
        <textarea
            v-model="form.description"
            class="form-textarea"
            placeholder="可以补充性格、健康状况、领养要求等信息"
            rows="4"
        ></textarea>
      </div>
    </div>

    <div class="footer-bar">
      <button class="draft-btn" @click="saveDraft">存草稿</button>
      <button class="submit-btn" :disabled="!isFormValid" @click="submitForm">
        {{ isEditMode ? '保存修改' : '立即发布' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// @ts-ignore
import request from '../api/request.js'
import { recognizePetImage, type AiRecognitionResult } from '../utils/aiRecognition'

const router = useRouter()
const route = useRoute()
const editingPostId = ref<number | null>(null)
const isEditMode = computed(() => editingPostId.value !== null)

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

const genders = ['公', '母', '不详']

const fileInput = ref<HTMLInputElement | null>(null)
const uploadedImages = ref<string[]>([])
const aiRecognizing = ref(false)
const aiRecognitionMessage = ref('')
const aiRecognitionError = ref('')
const latestRecognition = ref<AiRecognitionResult | null>(null)

const selectGender = (gender: string) => {
  form.gender = gender
}

const triggerUpload = () => {
  fileInput.value?.click()
}

const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve((e.target?.result as string) || '')
      reader.onerror = () => reject(new Error('图片读取失败'))
      reader.readAsDataURL(file)
    })

const formatRecognitionText = (result: AiRecognitionResult) => {
  const petType = result.petTypeCn || result.petType || '宠物'
  const breed = result.breedCn || result.breed || '未知品种'
  return `${petType} - ${breed}`
}

const autoRecognize = async (file: File) => {
  aiRecognizing.value = true
  aiRecognitionError.value = ''
  aiRecognitionMessage.value = ''

  try {
    const result = await recognizePetImage(file)
    latestRecognition.value = result
    form.breed = formatRecognitionText(result)
    aiRecognitionMessage.value = `已自动识别为“${form.breed}”，置信度 ${(result.confidence * 100).toFixed(1)}%，你仍可手动修改。`
  } catch (error: any) {
    latestRecognition.value = null
    aiRecognitionError.value = error?.message || 'AI识别失败，请稍后重试'
  } finally {
    aiRecognizing.value = false
  }
}

const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  const list = Array.from(files)
  const firstFile = list[0]
  if (!firstFile) {
    target.value = ''
    return
  }
  try {
    const previews = await Promise.all(list.map(readFileAsDataUrl))
    uploadedImages.value.push(...previews)
    await autoRecognize(firstFile)
  } catch (error) {
    console.error('处理图片失败', error)
    alert('图片处理失败，请重试')
  } finally {
    target.value = ''
  }
}

const removeImage = (index: number) => {
  uploadedImages.value.splice(index, 1)
  if (uploadedImages.value.length === 0) {
    latestRecognition.value = null
    aiRecognitionMessage.value = ''
    aiRecognitionError.value = ''
  }
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

const isRemoteUrl = (value: string) => /^https?:\/\//.test(value)

const resolveImageUrls = async (): Promise<string[]> => {
  const existingUrls = uploadedImages.value.filter(isRemoteUrl)
  const newImages = uploadedImages.value.filter(img => !isRemoteUrl(img))
  if (newImages.length === 0) {
    return existingUrls
  }

  const files = newImages.map((img, index) => dataUrlToFile(img, `adoption-${Date.now()}-${index}.png`))
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

const isLocating = ref(false)

const getLocation = () => {
  isLocating.value = true

  if (!navigator.geolocation) {
    alert('当前浏览器不支持定位')
    isLocating.value = false
    return
  }

  navigator.geolocation.getCurrentPosition(
      () => {
        setTimeout(() => {
          form.city = form.city || '北京市'
          form.district = form.district || '朝阳区'
          isLocating.value = false
        }, 1000)
      },
      () => {
        alert('定位失败，请手动填写地址')
        isLocating.value = false
      }
  )
}

const isFormValid = computed(() => {
  return (
      !!form.gender &&
      !!form.breed.trim() &&
      !!form.city.trim() &&
      uploadedImages.value.length > 0
  )
})

const goBack = () => {
  router.back()
}

const saveDraft = () => {
  const draft = {
    ...form,
    images: uploadedImages.value,
    latestRecognition: latestRecognition.value,
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
    images: imageUrls
  }

  try {
    const res = isEditMode.value
        ? await request.put(`/api/adoption/${editingPostId.value}`, payload)
        : await request.post('/api/adoption/publish', payload)

    if (res?.code === 200) {
      alert(isEditMode.value ? '更新成功' : '发布成功')
      router.push('/personal')
      return
    }
    alert(res?.message || (isEditMode.value ? '更新失败，请稍后重试' : '发布失败，请稍后重试'))
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

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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

.placeholder {
  width: 36px;
}

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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
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
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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

.upload-hint,
.upload-tip,
.field-tip {
  font-size: 12px;
  color: #999;
}

.upload-tip {
  margin: 12px 0 0;
}

.field-tip {
  margin: 6px 0 0;
}

.ai-banner {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #edf7ff;
  color: #2374a7;
  font-size: 13px;
}

.ai-loading {
  background: #f7fbff;
  color: #4d8db7;
}

.ai-error {
  background: #fff4f4;
  color: #d35f5f;
}

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

/* 横向性别按钮组样式 */
.gender-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.gender-btn {
  flex: 1;
  min-width: 70px;
  height: 44px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  background: #fafafa;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gender-btn.active {
  background: linear-gradient(135deg, #00a8e8 0%, #0090c9 100%);
  border-color: #00a8e8;
  color: #fff;
}

.gender-btn:active {
  transform: scale(0.98);
}

.form-input,
.custom-select {
  height: 44px;
  padding: 0 14px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  color: #333;
  background: #fafafa;
  outline: none;
  transition: all 0.2s;
}

/* 地址输入框：一行显示不下用省略号 */
.address-input {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.form-input:focus,
.custom-select:hover {
  border-color: #00a8e8;
  background: #fff;
}

.form-input::placeholder {
  color: #bbb;
}

.select-wrapper {
  position: relative;
}

.custom-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.custom-select .placeholder {
  color: #bbb;
}

.arrow-icon {
  color: #999;
  transition: transform 0.2s;
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 50;
  overflow: hidden;
}

.dropdown-item {
  padding: 12px 14px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
}

.dropdown-item:hover,
.dropdown-item.active {
  background: #f0f9ff;
  color: #00a8e8;
}

.location-input-wrapper {
  display: flex;
  gap: 10px;
}

.location-input-wrapper .form-input {
  flex: 1;
  min-width: 0;
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
}

.location-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-textarea {
  width: 100%;
  min-height: 100px;
  padding: 12px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  color: #333;
  background: #fafafa;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.6;
}

.form-textarea:focus {
  border-color: #00a8e8;
  background: #fff;
}

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
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
}

.draft-btn,
.submit-btn {
  height: 46px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.draft-btn {
  flex: 1;
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #666;
}

.submit-btn {
  flex: 2;
  border: none;
  background: linear-gradient(135deg, #00a8e8 0%, #0090c9 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 168, 232, 0.3);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

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

  .gender-btn {
    min-width: 60px;
    height: 40px;
    font-size: 13px;
  }
}
</style>
