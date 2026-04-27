<template>
  <div class="publish-lost">
    <!-- 顶部导航栏 -->
    <div class="header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="page-title">
        <span class="icon">🔍</span>
        {{ isEditMode ? '编辑寻宠启事' : '寻宠启事' }}
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
        <p class="upload-tip">支持 JPG/PNG 格式</p>
      </div>

      <!-- 基本信息 -->
      <div class="form-section">
        <div class="form-row">
          <label class="form-label">
            <span class="required">*</span>
            宠物名称
          </label>
          <input 
            v-model="form.petName"
            type="text" 
            class="form-input"
            placeholder="请输入宠物名字"
          />
        </div>

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

      <!-- 丢失信息 -->
      <div class="form-section">
        <div class="section-title">丢失信息</div>
        
        <!-- 丢失时间 - 支持手写和选择 -->
        <div class="form-row datetime-row">
          <label class="form-label">
            <span class="required">*</span>
            丢失时间
          </label>
          <div class="datetime-input-wrapper" ref="datetimeWrapperRef">
            <input 
              v-model="form.lostTime"
              type="text" 
              class="form-input datetime-input"
              placeholder="请输入丢失时间，如：2026年4月15日 下午3点"
              @focus="showDatetimePicker = true"
            />
            <button 
              class="datetime-btn" 
              @click="toggleDatetimePicker" 
              :class="{ 'active': showDatetimePicker }"
              title="选择时间"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </button>
            
            <!-- 自定义日期时间选择器弹窗 - 显示在输入框下方 -->
            <div v-show="showDatetimePicker" class="datetime-picker-popup">
              <div class="picker-header">
                <button class="nav-btn" @click="changeMonth(-1)">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <span class="current-month">{{ currentYear }}年{{ currentMonth + 1 }}月</span>
                <button class="nav-btn" @click="changeMonth(1)">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
              
              <!-- 星期标题 -->
              <div class="weekdays-header">
                <span v-for="day in weekDays" :key="day" class="weekday-label">{{ day }}</span>
              </div>
              
              <!-- 日期网格 - CSS Grid 布局 -->
              <div class="days-grid">
                <div 
                  v-for="(day, index) in calendarDays" 
                  :key="index"
                  class="day-cell"
                  :class="{ 
                    'other-month': !day.isCurrentMonth, 
                    'selected': isSelectedDate(day),
                    'today': isToday(day)
                  }"
                  @click="selectDate(day)"
                >
                  {{ day.date }}
                </div>
              </div>
              
              <!-- 时间选择 -->
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
              
              <!-- 底部按钮 -->
              <div class="picker-footer">
                <button class="picker-btn btn-today" @click="setToday">今天</button>
                <button class="picker-btn btn-confirm" @click="confirmDatetime">确定</button>
                <button class="picker-btn btn-cancel" @click="showDatetimePicker = false">取消</button>
              </div>
            </div>
          </div>
          <p class="input-hint">可手动输入，或点击右侧图标选择时间</p>
        </div>

        <div class="form-row">
          <label class="form-label">
            <span class="required">*</span>
            丢失地点
          </label>
          <div class="location-input-wrapper">
            <input 
              v-model="form.lostLocation"
              type="text" 
              class="form-input"
              placeholder="请输入丢失地点"
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
            所在城市
          </label>
          <input 
            v-model="form.city"
            type="text" 
            class="form-input"
            placeholder="请输入城市名称"
          />
        </div>
      </div>

      <!-- 联系方式 -->
      <div class="form-section">
        <div class="section-title">联系方式</div>
        
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
          placeholder="描述宠物的特征、丢失时的状况、是否有佩戴饰品等..."
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
  // 关闭时间选择器
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

// ============ 自定义日期时间选择器 ============
const showDatetimePicker = ref(false)
const datetimeWrapperRef = ref<HTMLElement | null>(null)

// 当前显示的月份
const currentDate = ref(new Date())
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

// 选中的日期和时间
const selectedDate = ref<Date | null>(null)
const selectedHour = ref(new Date().getHours())
const selectedMinute = ref(new Date().getMinutes())

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 计算日历天数
const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  
  // 当月第一天
  const firstDayOfMonth = new Date(year, month, 1)
  // 当月最后一天
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  // 当月第一天是星期几（0=周日）
  const firstDayWeekday = firstDayOfMonth.getDay()
  // 当月总天数
  const daysInMonth = lastDayOfMonth.getDate()
  
  const days = []
  
  // 上个月的日期（填充前面的空格）
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    days.push({
      date: prevMonthLastDay - i,
      isCurrentMonth: false,
      fullDate: new Date(year, month - 1, prevMonthLastDay - i)
    })
  }
  
  // 当月日期
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: i,
      isCurrentMonth: true,
      fullDate: new Date(year, month, i)
    })
  }
  
  // 下个月的日期（填充后面的空格，使总数为42个，即6行）
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

// 切换月份
const changeMonth = (delta: number) => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + delta, 1)
}

// 切换时间选择器显示
const toggleDatetimePicker = () => {
  showDatetimePicker.value = !showDatetimePicker.value
}

// 选择日期
const selectDate = (day: { date: number, isCurrentMonth: boolean, fullDate: Date }) => {
  selectedDate.value = day.fullDate
  // 如果选择的不是当前月，切换到那个月
  if (!day.isCurrentMonth) {
    currentDate.value = new Date(day.fullDate.getFullYear(), day.fullDate.getMonth(), 1)
  }
}

// 判断是否选中
const isSelectedDate = (day: { date: number, isCurrentMonth: boolean, fullDate: Date }) => {
  if (!selectedDate.value) return false
  return day.fullDate.toDateString() === selectedDate.value.toDateString()
}

// 判断是否是今天
const isToday = (day: { date: number, isCurrentMonth: boolean, fullDate: Date }) => {
  const today = new Date()
  return day.fullDate.toDateString() === today.toDateString()
}

// 设置今天
const setToday = () => {
  const today = new Date()
  selectedDate.value = today
  selectedHour.value = today.getHours()
  selectedMinute.value = today.getMinutes()
  currentDate.value = new Date(today.getFullYear(), today.getMonth(), 1)
}

// 确认选择
const confirmDatetime = () => {
  if (selectedDate.value) {
    const date = new Date(selectedDate.value)
    date.setHours(selectedHour.value)
    date.setMinutes(selectedMinute.value)
    form.lostTime = formatDatetime(date)
  }
  showDatetimePicker.value = false
}

// 格式化日期时间为中文格式
const formatDatetime = (date: Date): string => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  
  // 格式化时间段
  let timePeriod = ''
  if (hours >= 0 && hours < 6) timePeriod = '凌晨'
  else if (hours >= 6 && hours < 12) timePeriod = '上午'
  else if (hours >= 12 && hours < 14) timePeriod = '中午'
  else if (hours >= 14 && hours < 18) timePeriod = '下午'
  else timePeriod = '晚上'
  
  const timeStr = minutes === 0 ? `${timePeriod}${hours}点` : `${timePeriod}${hours}点${minutes}分`
  
  return `${year}年${month}月${day}日 ${timeStr}`
}

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
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImages.value.push(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  })
  
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
    dataUrlToFile(img, `lost-${Date.now()}-${index}.png`)
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
        form.lostLocation = '当前定位位置'
        form.city = '北京市'
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
  return form.petName.trim() &&
         form.gender && 
         form.breed.trim() && 
         form.lostTime.trim() &&
         form.lostLocation.trim() &&
         form.city.trim() &&
         uploadedImages.value.length > 0
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
    images: imageUrls,
  }

  try {
    const res = isEditMode.value
      ? await request.put(`/api/lost/${editingPostId.value}`, payload)
      : await request.post('/api/lost/publish', payload)
    if (res?.code === 200) {
      alert(isEditMode.value ? '更新成功！' : '发布成功！')
      router.push('/personal')
      return
    }
    alert(res?.message || (isEditMode.value ? '更新失败，请稍后再试' : '发布失败，请稍后再试'))
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

.datetime-row {
  position: relative;
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

/* ========== 丢失时间输入框 ========== */
.datetime-input-wrapper {
  display: flex;
  gap: 10px;
  position: relative;
}

.datetime-input-wrapper .form-input {
  flex: 1;
}

.datetime-input {
  font-size: 14px;
}

.datetime-btn {
  width: 44px;
  height: 44px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background: #fff;
  color: #00a8e8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.datetime-btn:hover {
  background: #f0f9ff;
  border-color: #00a8e8;
}

.datetime-btn.active {
  background: #00a8e8;
  color: #fff;
  border-color: #00a8e8;
}

.input-hint {
  font-size: 12px;
  color: #999;
  margin: 4px 0 0;
}

/* ========== 自定义日期时间选择器弹窗 ========== */
.datetime-picker-popup {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 320px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  z-index: 1000;
  padding: 16px;
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

/* 弹窗箭头 */
.datetime-picker-popup::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 20px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid #fff;
}

/* 选择器头部 */
.picker-header {
  display: flex;
  align-items: center;
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
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #666;
}

.nav-btn:hover {
  background: #e8e8e8;
  color: #333;
}

.current-month {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* 星期标题 */
.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday-label {
  text-align: center;
  font-size: 12px;
  color: #999;
  font-weight: 500;
  padding: 4px;
}

/* 日期网格 - CSS Grid 布局 */
.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 16px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  min-height: 36px;
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

/* 时间选择 */
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-select {
  flex: 1;
  height: 36px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0 8px;
  font-size: 14px;
  color: #333;
  background: #fff;
  outline: none;
  cursor: pointer;
}

.time-select:focus {
  border-color: #00a8e8;
}

.time-separator {
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

/* 底部按钮 */
.picker-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.picker-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-today {
  background: #f5f5f5;
  color: #666;
}

.btn-today:hover {
  background: #e8e8e8;
}

.btn-confirm {
  background: #00a8e8;
  color: #fff;
}

.btn-confirm:hover {
  background: #0090c9;
}

.btn-cancel {
  background: transparent;
  color: #999;
}

.btn-cancel:hover {
  color: #666;
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
  
  .datetime-picker-popup {
    width: 100%;
    left: 0;
    right: 0;
  }
}
</style>