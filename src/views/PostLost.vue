<template>
  <div class="publish-lost">
    <div class="header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="page-title">
        <span class="icon">🔎</span>
        {{ isEditMode ? '编辑寻宠启事' : '发布寻宠启事' }}
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
        <p class="upload-tip">支持 JPG / PNG。上传后系统会自动识别宠物种类和品种，辅助填写信息。</p>

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
            宠物名称
          </label>
          <input v-model="form.petName" type="text" class="form-input" placeholder="请输入宠物名称" />
        </div>

        <div class="form-row">
          <label class="form-label">
            <span class="required">*</span>
            性别
          </label>
          <div class="select-wrapper">
            <div class="custom-select" @click="showGenderDropdown = !showGenderDropdown">
              <span :class="{ placeholder: !form.gender }">
                {{ form.gender || '请选择性别' }}
              </span>
              <svg
                class="arrow-icon"
                :class="{ rotate: showGenderDropdown }"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            <div v-show="showGenderDropdown" class="dropdown-menu">
              <div
                v-for="gender in genders"
                :key="gender"
                class="dropdown-item"
                :class="{ active: form.gender === gender }"
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
            宠物种类 / 品种
          </label>
          <input
            v-model="form.breed"
            type="text"
            class="form-input"
            placeholder="例如：猫 - 布偶猫，狗 - 柯基犬"
          />
          <p class="field-tip">系统会自动根据上传图片回填，你也可以自行修改。</p>
        </div>
      </div>

      <div class="form-section">
        <div class="section-title">丢失信息</div>

        <div class="form-row datetime-row">
          <label class="form-label">
            <span class="required">*</span>
            丢失时间
          </label>
          <div class="datetime-input-wrapper">
            <input
              v-model="form.lostTime"
              type="text"
              class="form-input datetime-input"
              placeholder="请输入丢失时间，例如：2026年5月15日下午3点"
              @focus="showDatetimePicker = true"
            />
            <button class="datetime-btn" @click="toggleDatetimePicker" :class="{ active: showDatetimePicker }" title="选择时间">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </button>

            <div v-show="showDatetimePicker" class="datetime-picker-popup">
              <div class="picker-header">
                <button class="nav-btn" @click="changeMonth(-1)">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <span class="current-month">{{ currentYear }}年{{ currentMonth + 1 }}月</span>
                <button class="nav-btn" @click="changeMonth(1)">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              <div class="weekdays-header">
                <span v-for="day in weekDays" :key="day" class="weekday-label">{{ day }}</span>
              </div>

              <div class="days-grid">
                <div
                  v-for="(day, index) in calendarDays"
                  :key="index"
                  class="day-cell"
                  :class="{
                    'other-month': !day.isCurrentMonth,
                    selected: isSelectedDate(day),
                    today: isToday(day)
                  }"
                  @click="selectDate(day)"
                >
                  {{ day.date }}
                </div>
              </div>

              <div class="time-section">
                <div class="time-label">时间</div>
                <div class="time-inputs">
                  <select v-model="selectedHour" class="time-select">
                    <option v-for="h in 24" :key="h" :value="h - 1">{{ h - 1 }}时</option>
                  </select>
                  <span class="time-separator">:</span>
                  <select v-model="selectedMinute" class="time-select">
                    <option v-for="m in 60" :key="m" :value="m - 1">{{ m - 1 }}分</option>
                  </select>
                </div>
              </div>

              <div class="picker-footer">
                <button class="picker-btn btn-today" @click="setToday">今天</button>
                <button class="picker-btn btn-confirm" @click="confirmDatetime">确定</button>
                <button class="picker-btn btn-cancel" @click="showDatetimePicker = false">取消</button>
              </div>
            </div>
          </div>
          <p class="input-hint">可以手动输入，也可以点击右侧图标快速选择。</p>
        </div>

        <div class="form-row">
          <label class="form-label">
            <span class="required">*</span>
            丢失地点
          </label>
          <div class="location-input-wrapper">
            <input v-model="form.lostLocation" type="text" class="form-input address-input" placeholder="请输入丢失地点" />
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
            所在城市
          </label>
          <input v-model="form.city" type="text" class="form-input" placeholder="请输入城市名称" />
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
          placeholder="可以补充毛色、体型、是否佩戴项圈或芯片等信息"
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
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// @ts-ignore
import request from '../api/request.js'
import { recognizePetImage, type AiRecognitionResult } from '../utils/aiRecognition'

type CalendarDay = {
  date: number
  isCurrentMonth: boolean
  fullDate: Date
}

const router = useRouter()
const route = useRoute()
const editingPostId = ref<number | null>(null)
const isEditMode = computed(() => editingPostId.value !== null)

const form = reactive({
  petName: '',
  gender: '',
  breed: '',
  lostTime: '',
  lostLocation: '',
  city: '',
  contactName: '',
  contactPhone: '',
  contactWechat: '',
  description: ''
})

const genders = ['公', '母', '不详']
const showGenderDropdown = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const uploadedImages = ref<string[]>([])
const aiRecognizing = ref(false)
const aiRecognitionMessage = ref('')
const aiRecognitionError = ref('')
const latestRecognition = ref<AiRecognitionResult | null>(null)

const showDatetimePicker = ref(false)
const currentDate = ref(new Date())
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())
const selectedDate = ref<Date | null>(null)
const selectedHour = ref(new Date().getHours())
const selectedMinute = ref(new Date().getMinutes())
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const selectGender = (gender: string) => {
  form.gender = gender
  showGenderDropdown.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.select-wrapper')) {
    showGenderDropdown.value = false
  }
  if (!target.closest('.datetime-input-wrapper')) {
    showDatetimePicker.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

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
    aiRecognitionMessage.value = `已自动识别为“${form.breed}”，置信度 ${(result.confidence * 100).toFixed(1)}%，你仍可手动调整。`
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

  const files = newImages.map((img, index) => dataUrlToFile(img, `lost-${Date.now()}-${index}.png`))
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
    const res = await request.get(`/api/lost/${postId}`)
    const post = res?.data
    if (res?.code !== 200 || !post) {
      alert(res?.message || '加载帖子失败')
      router.replace('/personal')
      return
    }
    form.petName = post.petName || ''
    form.gender = post.gender || ''
    form.breed = post.breed || ''
    form.lostTime = post.lostTime || ''
    form.lostLocation = post.lostLocation || post.district || ''
    form.city = post.city || ''
    form.contactName = post.contactName || ''
    form.contactPhone = post.contactPhone || ''
    form.contactWechat = post.contactWechat || ''
    form.description = post.description || ''
    uploadedImages.value = Array.isArray(post.images) ? post.images : []
  } catch (error) {
    console.error('加载寻宠帖子失败', error)
    alert('加载帖子失败，请稍后重试')
    router.replace('/personal')
  }
}

const calendarDays = computed<CalendarDay[]>(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const days: CalendarDay[] = []
  const prevMonthLastDay = new Date(year, month, 0).getDate()

  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    days.push({
      date: prevMonthLastDay - i,
      isCurrentMonth: false,
      fullDate: new Date(year, month - 1, prevMonthLastDay - i)
    })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: i,
      isCurrentMonth: true,
      fullDate: new Date(year, month, i)
    })
  }

  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: i,
      isCurrentMonth: false,
      fullDate: new Date(year, month + 1, i)
    })
  }

  return days
})

const changeMonth = (delta: number) => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + delta, 1)
}

const toggleDatetimePicker = () => {
  showDatetimePicker.value = !showDatetimePicker.value
}

const selectDate = (day: CalendarDay) => {
  selectedDate.value = day.fullDate
  if (!day.isCurrentMonth) {
    currentDate.value = new Date(day.fullDate.getFullYear(), day.fullDate.getMonth(), 1)
  }
}

const isSelectedDate = (day: CalendarDay) => {
  if (!selectedDate.value) return false
  return day.fullDate.toDateString() === selectedDate.value.toDateString()
}

const isToday = (day: CalendarDay) => {
  return day.fullDate.toDateString() === new Date().toDateString()
}

const setToday = () => {
  const today = new Date()
  selectedDate.value = today
  selectedHour.value = today.getHours()
  selectedMinute.value = today.getMinutes()
  currentDate.value = new Date(today.getFullYear(), today.getMonth(), 1)
}

const formatDatetime = (date: Date): string => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()

  let timePeriod = ''
  if (hours < 6) timePeriod = '凌晨'
  else if (hours < 12) timePeriod = '上午'
  else if (hours < 14) timePeriod = '中午'
  else if (hours < 18) timePeriod = '下午'
  else timePeriod = '晚上'

  const timeText = minutes === 0 ? `${timePeriod}${hours}点` : `${timePeriod}${hours}点${minutes}分`
  return `${year}年${month}月${day}日${timeText}`
}

const confirmDatetime = () => {
  if (selectedDate.value) {
    const date = new Date(selectedDate.value)
    date.setHours(selectedHour.value)
    date.setMinutes(selectedMinute.value)
    form.lostTime = formatDatetime(date)
  }
  showDatetimePicker.value = false
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
        form.lostLocation = form.lostLocation || '当前位置附近'
        form.city = form.city || '北京市'
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
    !!form.petName.trim() &&
    !!form.gender &&
    !!form.breed.trim() &&
    !!form.lostTime.trim() &&
    !!form.lostLocation.trim() &&
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
  localStorage.setItem('lostDraft', JSON.stringify(draft))
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
    petName: form.petName,
    gender: form.gender,
    breed: form.breed,
    lostTime: form.lostTime,
    lostLocation: form.lostLocation,
    city: form.city,
    district: form.lostLocation,
    contactName: form.contactName,
    contactPhone: form.contactPhone,
    contactWechat: form.contactWechat,
    description: form.description,
    images: imageUrls
  }

  try {
    const res = isEditMode.value
      ? await request.put(`/api/lost/${editingPostId.value}`, payload)
      : await request.post('/api/lost/publish', payload)

    if (res?.code === 200) {
      alert(isEditMode.value ? '更新成功' : '发布成功')
      router.push('/personal')
      return
    }
    alert(res?.message || (isEditMode.value ? '更新失败，请稍后重试' : '发布失败，请稍后重试'))
  } catch (error) {
    console.error('保存寻宠帖子失败', error)
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
.publish-lost {
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
  cursor: pointer;
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
.field-tip,
.input-hint {
  font-size: 12px;
  color: #999;
}

.upload-tip,
.input-hint {
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
}

.required {
  color: #ff6b6b;
}

.form-input,
.custom-select,
.time-select {
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

.form-input:focus,
.time-select:focus,
.custom-select:hover {
  border-color: #00a8e8;
  background: #fff;
}

.address-input {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.datetime-input-wrapper,
.location-input-wrapper {
  display: flex;
  gap: 10px;
  position: relative;
}

.datetime-input-wrapper .form-input,
.location-input-wrapper .form-input {
  flex: 1;
  min-width: 0;
}

.datetime-btn,
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
  justify-content: center;
  gap: 6px;
}

.datetime-btn.active {
  background: #00a8e8;
  color: #fff;
  border-color: #00a8e8;
}

.location-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.datetime-picker-popup {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 320px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  padding: 16px;
}

.picker-header,
.picker-footer,
.time-inputs {
  display: flex;
  align-items: center;
}

.picker-header {
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
}

.current-month {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.weekdays-header,
.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.weekdays-header {
  margin-bottom: 8px;
}

.weekday-label {
  text-align: center;
  font-size: 12px;
  color: #999;
  padding: 4px;
}

.days-grid {
  margin-bottom: 16px;
}

.day-cell {
  aspect-ratio: 1;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  border-radius: 8px;
}

.day-cell:hover {
  background: #f0f9ff;
}

.day-cell.other-month {
  color: #ccc;
}

.day-cell.selected {
  background: #00a8e8;
  color: #fff;
  font-weight: 600;
}

.day-cell.today {
  border: 2px solid #00a8e8;
}

.time-section {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 12px;
}

.time-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.time-inputs {
  gap: 8px;
}

.time-select {
  flex: 1;
}

.time-separator {
  font-weight: 600;
}

.picker-footer {
  gap: 8px;
  justify-content: flex-end;
}

.picker-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.btn-today {
  background: #f5f5f5;
  color: #666;
}

.btn-confirm {
  background: #00a8e8;
  color: #fff;
}

.btn-cancel {
  background: transparent;
  color: #999;
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

  .datetime-picker-popup {
    width: 100%;
    left: 0;
    right: 0;
  }
}
</style>
