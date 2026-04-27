<template>
  <div>
    <!-- 主标题区域 -->
    <div class="main">
      <h1 class="main-title">
        紧急宠物<span class="highlight">寻回</span> <br>
        帮助它们回家 
      </h1>
      <p class="title-detail">
        每一次转发都是一份希望，每一份关注都是一丝温暖。
      </p>
    </div>

    <!-- 筛选栏 + 搜索按钮 - 可固定顶部 -->
    <div 
      class="filter-search-bar" 
      :class="{ 'sticky': isSticky }"
      ref="filterBarRef"
    >
      <div class="filter-item city-item">
        <label>城市</label>
        <div class="select-wrapper city-wrapper" :style="{ width: selectBoxWidth + 'px' }">
          <input
            ref="cityInputRef"
            v-model="selectedCity"
            placeholder="请输入城市名称"
            class="combo-input city-input"
            @focus="showCityDropdown = true"
            @blur="handleBlur"
          />
          <ul v-show="showCityDropdown" class="city-dropdown">
            <li 
              v-for="city in availableCities" 
              :key="city"
              @mousedown.prevent="selectCity(city)"
              class="dropdown-item"
            >
              {{ city }}
            </li>
          </ul>
          <span class="search-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </span>
        </div>
      </div>
      
      <div class="filter-item">
        <label>性别</label>
        <div class="select-wrapper custom-select-wrapper" :style="{ width: selectBoxWidth + 'px' }">
          <input
            v-model="selectedGender"
            placeholder="请选择性别"
            class="combo-input gender-input"
            readonly
            @focus="showGenderDropdown = true"
            @blur="handleGenderBlur"
          />
          <ul v-show="showGenderDropdown" class="custom-dropdown">
            <li 
              v-for="gender in genders" 
              :key="gender"
              @mousedown.prevent="selectGender(gender)"
              class="dropdown-item"
            >
              {{ gender }}
            </li>
          </ul>
          <span class="custom-arrow"></span>
        </div>
      </div>
      
      <div class="filter-item">
        <label>种类</label>
        <div class="select-wrapper custom-select-wrapper" :style="{ width: selectBoxWidth + 'px' }">
          <input
            v-model="selectedType"
            placeholder="请选择种类"
            class="combo-input type-input"
            readonly
            @focus="showTypeDropdown = true"
            @blur="handleTypeBlur"
          />
          <ul v-show="showTypeDropdown" class="custom-dropdown">
            <li 
              v-for="type in types" 
              :key="type"
              @mousedown.prevent="selectType(type)"
              class="dropdown-item"
            >
              {{ type }}
            </li>
          </ul>
          <span class="custom-arrow"></span>
        </div>
      </div>
      
      <div class="filter-item search-item">
        <button class="search-btn" @click="onSearch">搜索</button>
        <button class="reset-btn" @click="resetFilters">重置</button>
      </div>
    </div>

    <!-- 宠物卡片列表 -->
    <div class="pet-cards-container">
      <div 
        v-for="pet in filteredPets" 
        :key="pet.id" 
        class="pet-card-wrapper"
      >
        <div 
          class="pet-card-flipper"
          :class="{ 'flipped': flippedCards[pet.id] }"
        >
          <!-- 卡片正面 -->
          <div class="pet-card-front">
            <!-- 上方：宠物图片 -->
            <div class="pet-image-wrapper">
              <img :src="pet.image" class="pet-image" />
            </div>

            <!-- 图片下方：点击任意信息区翻转 -->
            <div class="pet-info" @click="flipCard(pet.id)">
              <!-- 第一行：发帖人头像 + 收藏 -->
              <div class="info-row user-favorite-row">
                <div class="poster-user">
                  <img
                    :src="pet.posterAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=lost-poster'"
                    class="poster-avatar"
                    alt="发帖人头像"
                  />
                </div>
                <div class="favorite-count">
                  <button
                    class="favorite-btn"
                    :class="{ favorited: !!pet.favorited }"
                    @click.stop="toggleFavorite(pet)"
                    title="收藏"
                  >
                    ★
                  </button>
                  <span>{{ pet.favoriteCount ?? 0 }}</span>
                </div>
              </div>

              <!-- 第二行：性别 + 品种 -->
              <div class="info-row split-row">
                <div class="left-cell">
                  <span class="gender-icon" :class="getGenderClass(pet.gender)">
                    {{ getGenderIcon(pet.gender) }}
                  </span>
                  <span class="gender-text">{{ pet.gender }}</span>
                </div>
                <div class="right-cell">
                  <span class="breed-label">{{ pet.breed }}</span>
                </div>
              </div>

              <!-- 第三行：走失时间 + 宠物姓名 -->
              <div class="info-row split-row">
                <div class="left-cell">
                  <span class="inline-label">走失时间</span>
                  <span class="inline-value">{{ pet.lostTime }}</span>
                </div>
                <div class="right-cell">
                  <span class="inline-label">宠物姓名</span>
                  <span class="inline-value">{{ pet.petName }}</span>
                </div>
              </div>

              <!-- 第四行：丢失地点 + 联系电话 -->
              <div class="info-row split-row">
                <div class="left-cell location-cell">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span class="inline-value">{{ pet.city }}{{ pet.district }}</span>
                </div>
                <div class="right-cell phone-cell">
                  <button class="phone-icon-btn" @click.stop="openContactModal(pet)" title="查看联系方式">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 卡片背面 - 仅显示完整 description -->
          <div class="pet-card-back" @click="flipCard(pet.id)">
            <div class="back-description-section">
              <p class="back-description-text">{{ pet.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 浮动发布按钮 ========== -->
    <div class="fab-wrapper" ref="fabRef">
      <!-- 展开菜单 -->
      <div v-if="showFabMenu" class="fab-menu">
        <button class="fab-item" @click="goToPublish('adoption')">
          <span class="fab-icon">🐕</span>
          <span class="fab-text">发布领养</span>
        </button>
        <button class="fab-item" @click="goToPublish('lost')">
          <span class="fab-icon">🔍</span>
          <span class="fab-text">寻宠启事</span>
        </button>
      </div>
      
      <!-- 主按钮 -->
      <button 
        class="fab-btn" 
        :class="{ 'active': showFabMenu }"
        @click="toggleFabMenu"
        title="发布"
      >
        <svg 
          viewBox="0 0 24 24" 
          width="24" 
          height="24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
          :class="{ 'rotate': showFabMenu }"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>

    <button class="ai-chat-ball" @click="goToAIChat" title="AI聊天">
      AI
    </button>

    <!-- 联系方式弹窗 -->
    <div v-if="showContactModal" class="modal-overlay" @click="closeContactModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeContactModal">×</button>
        <div class="modal-header">
          <div class="modal-pet-avatar">
            <img :src="selectedPet?.image"/>
          </div>
          <h3 class="modal-title">联系</h3>
        </div>
        <div class="modal-body">
          <div class="contact-item">
            <div class="contact-label">联系人</div>
            <div class="contact-value">{{ selectedPet?.contactName }}</div>
          </div>
          
          <!-- 联系电话 - 灰框蓝字，可复制，图标在右 -->
          <div class="contact-item">
            <div class="contact-label">联系电话</div>
            <div class="contact-value copyable" @click="copyToClipboard(selectedPet?.contactPhone, '电话号码')">
              <span class="phone-text">{{ selectedPet?.contactPhone }}</span>
              <button class="copy-icon-btn right" title="复制电话号码">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- 微信号 - 灰框黑字，可复制，图标在右（如果有） -->
          <div class="contact-item" v-if="selectedPet?.contactWechat">
            <div class="contact-label">微信号</div>
            <div class="contact-value copyable wechat" @click="copyToClipboard(selectedPet?.contactWechat, '微信号')">
              <span>{{ selectedPet?.contactWechat }}</span>
              <button class="copy-icon-btn right" title="复制微信号">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn" @click="closeContactModal">知道了</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
// @ts-ignore
import request from '../api/request.js'
import { upsertFavorite, removeFavorite, isFavorite, type FavoriteKind } from '../utils/favorites'

const router = useRouter()

const FAVORITE_KIND: FavoriteKind = 'lost'

// ============ 筛选相关 ============
const selectedCity = ref('')
const selectedGender = ref('')
const selectedType = ref('')
const cityInputRef = ref<HTMLInputElement | null>(null)
const selectBoxWidth = ref(140)
const showCityDropdown = ref(false)
const showGenderDropdown = ref(false)
const showTypeDropdown = ref(false)

// 当前生效的筛选条件（点击搜索后才更新）
const activeCity = ref('')
const activeGender = ref('')
const activeType = ref('')

const genders = ['公', '母', '不详']
const types = ['狗', '猫', '其他']

// ============ 寻宠数据 ============
interface LostPet {
  id: number
  image: string
  posterAvatar?: string
  favoriteCount?: number
  favorited?: boolean
  description: string
  petName: string
  lostTime: string
  breed: string
  gender: string
  age: string
  city: string
  district: string
  contactName: string
  contactPhone: string
  contactWechat?: string
}

interface LostPostDTO {
  id: number
  petName?: string
  gender?: string
  breed?: string
  lostTime?: string
  lostLocation?: string
  city?: string
  district?: string
  contactName?: string
  contactPhone?: string
  contactWechat?: string
  description?: string
  publisher?: { avatar?: string }
  images?: string[]
}

const lostPets = ref<LostPet[]>([])

const mapLostDTOToPet = (item: LostPostDTO): LostPet => ({
  id: Number(item.id),
  image: item.images?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop',
  posterAvatar: item.publisher?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=lost-poster',
  favoriteCount: 0,
  favorited: false,
  description: item.description || '',
  petName: item.petName || '未命名',
  lostTime: item.lostTime || '',
  breed: item.breed || '未知品种',
  gender: item.gender || '不详',
  age: '未知',
  city: item.city || '',
  district: item.district || item.lostLocation || '',
  contactName: item.contactName || '未填写',
  contactPhone: item.contactPhone || '未填写',
  contactWechat: item.contactWechat || ''
})

const fetchLostPosts = async () => {
  try {
    const res = await request.get('/api/lost/list', {
      params: { pageNum: 1, pageSize: 200 }
    })
    const records = res?.data?.list ?? res?.data?.records
    if (res?.code === 200 && Array.isArray(records)) {
      lostPets.value = records.map(mapLostDTOToPet)
    }
  } catch (error) {
    console.warn('加载寻宠帖子失败，使用本地数据兜底', error)
  } finally {
    lostPets.value.forEach(p => {
      p.favorited = isFavorite(FAVORITE_KIND, p.id)
    })
  }
}

// ============ 动态城市列表 - 从宠物数据中提取 ============
const availableCities = computed(() => {
  const citySet = new Set<string>()
  lostPets.value.forEach(pet => {
    citySet.add(pet.city)
  })
  return Array.from(citySet).sort()
})

// ============ 筛选逻辑 ============
const filteredPets = computed(() => {
  return lostPets.value.filter(pet => {
    const matchCity = !activeCity.value || pet.city === activeCity.value
    const matchGender = !activeGender.value || pet.gender === activeGender.value
    const matchType = !activeType.value || 
      (activeType.value === '狗' && !pet.breed.includes('Cat')) ||
      (activeType.value === '猫' && pet.breed.includes('Cat')) ||
      (activeType.value === '其他' && !pet.breed.includes('Cat') && !pet.breed.includes('Dog'))
    return matchCity && matchGender && matchType
  })
})

const getGenderIcon = (gender: string) => {
  if (gender === '公') return '♂'
  if (gender === '母') return '♀'
  return '?'
}

const getGenderClass = (gender: string) => {
  if (gender === '公') return 'male'
  if (gender === '母') return 'female'
  return 'unknown'
}

const toggleFavorite = (pet: LostPet) => {
  const currentCount = pet.favoriteCount ?? 0
  const nextFavorited = !pet.favorited
  pet.favorited = nextFavorited
  pet.favoriteCount = nextFavorited
    ? currentCount + 1
    : Math.max(0, currentCount - 1)
  if (nextFavorited) {
    upsertFavorite({
      kind: FAVORITE_KIND,
      id: pet.id,
      image: pet.image,
      title: `${pet.petName}（${pet.breed}）`,
      subtitle: `${pet.city} · ${pet.lostTime}`,
      detail: {
        posterAvatar: pet.posterAvatar,
        favoriteCount: pet.favoriteCount ?? 0,
        favorited: true,
        description: pet.description,
        petName: pet.petName,
        lostTime: pet.lostTime,
        breed: pet.breed,
        gender: pet.gender,
        age: pet.age,
        city: pet.city,
        district: pet.district,
        contactName: pet.contactName,
        contactPhone: pet.contactPhone,
        contactWechat: pet.contactWechat
      }
    })
  } else {
    removeFavorite(FAVORITE_KIND, pet.id)
  }
}

// ============ 粘性定位相关 ============
const isSticky = ref(false)
const filterBarRef = ref<HTMLElement | null>(null)
const filterBarOffset = ref(0)

const handleScroll = () => {
  if (filterBarRef.value) {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    isSticky.value = scrollTop > filterBarOffset.value
  }
}

onMounted(async () => {
  await fetchLostPosts()
  calculateSelectBoxWidth()
  if (filterBarRef.value) {
    filterBarOffset.value = filterBarRef.value.offsetTop
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})

// ============ 卡片翻转相关 ============
const flippedCards = ref<Record<number, boolean>>({})

const flipCard = (petId: number) => {
  flippedCards.value[petId] = !flippedCards.value[petId]
}

// ============ 弹窗相关 ============
const showContactModal = ref(false)
const selectedPet = ref<LostPet | null>(null)

const openContactModal = (pet: LostPet) => {
  const token = localStorage.getItem('token')
  const userInfo = localStorage.getItem('userInfo')
  if (!token || !userInfo) {
    alert('请先登录或注册后再查看联系方式')
    return
  }

  selectedPet.value = pet
  showContactModal.value = true
  document.body.style.overflow = 'hidden'
}

const closeContactModal = () => {
  showContactModal.value = false
  selectedPet.value = null
  document.body.style.overflow = ''
}

// 通用复制功能
const copyToClipboard = (text: string | undefined, label: string) => {
  if (!text) return
  navigator.clipboard.writeText(text)
  alert(`${label}已复制到剪贴板：${text}`)
}

// ============ 浮动发布按钮 ============
const showFabMenu = ref(false)
const fabRef = ref<HTMLElement | null>(null)

const toggleFabMenu = () => {
  showFabMenu.value = !showFabMenu.value
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.fab-wrapper')) {
    showFabMenu.value = false
  }
}

// =========== 跳转到发布领养帖子页面 ============
const goToPublish = (type: string) => {
  showFabMenu.value = false
  switch(type) {
    case 'adoption':
      router.push('/PostAdoption')
      break
    case 'lost':
      router.push('/PostLost')
      break
  }
}

const goToAIChat = () => {
  router.push('/aichat')
}

// ============ 原有方法 ============
function getTextWidth(text: string, font: string): number {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (context) {
    context.font = font
    return context.measureText(text).width
  }
  return 0
}

function calculateSelectBoxWidth() {
  const placeholders = ['请输入城市名称', '请选择性别', '请选择种类']
  const font = '14px sans-serif'
  
  let maxTextWidth = 0
  placeholders.forEach(text => {
    const textWidth = getTextWidth(text, font)
    maxTextWidth = Math.max(maxTextWidth, textWidth)
  })
  
  selectBoxWidth.value = Math.max(140, maxTextWidth + 16 + 32 + 20)
}

function selectCity(city: string) {
  selectedCity.value = city
  showCityDropdown.value = false
}

function selectGender(gender: string) {
  selectedGender.value = gender
  showGenderDropdown.value = false
}

function selectType(type: string) {
  selectedType.value = type
  showTypeDropdown.value = false
}

function handleBlur() {
  setTimeout(() => {
    showCityDropdown.value = false
  }, 200)
}

function handleGenderBlur() {
  setTimeout(() => {
    showGenderDropdown.value = false
  }, 200)
}

function handleTypeBlur() {
  setTimeout(() => {
    showTypeDropdown.value = false
  }, 200)
}

function onSearch() {
  activeCity.value = selectedCity.value
  activeGender.value = selectedGender.value
  activeType.value = selectedType.value
  console.log('搜索条件：', {
    城市: selectedCity.value,
    性别: selectedGender.value,
    种类: selectedType.value
  })
}

// 重置所有筛选条件
function resetFilters() {
  // 清空输入框绑定的值
  selectedCity.value = ''
  selectedGender.value = ''
  selectedType.value = ''
  // 清空实际生效的筛选值（使列表立即恢复全部）
  activeCity.value = ''
  activeGender.value = ''
  activeType.value = ''
}
</script>

<style scoped>
.main {
  text-align: center;
  margin: 10px 0 32px 0;
  padding: 0 20px;
}

.main-title {
  font-size: 32px;
  font-weight: 800;
  color: #1a1a1a;
  line-height: 1.4;
  margin: 0 0 16px 0;
}

.main-title .highlight {
  color: #ff6b6b;
  font-weight: 800;
}

.title-detail {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  max-width: 700px;
  margin: 0 auto;
}

/* ========== 筛选栏样式 - 支持粘性定位 ========== */
.filter-search-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 16px 4px;
  margin-bottom: 40px;
  transition: all 0.3s ease;
  z-index: 100;
  background-color: #ffffff;
}

.filter-search-bar.sticky {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  margin-bottom: 0;
  padding: 12px 4px;
  background-color: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  font-size: 14px;
  color: #000;
  font-weight: 500;
  white-space: nowrap;
}

.filter-item.search-item {
  gap: 0;
  margin-left: 8px;
}

.select-wrapper {
  position: relative;
  display: inline-block;
  height: 36px;
  transition: width 0.2s;
}

.select-wrapper .combo-input {
  padding: 0 32px 0 16px;
  border-radius: 6px;
  border: 1px solid #dcdcdc;
  font-size: 14px;
  color: #000;
  background: #fff;
  width: 100%;
  height: 36px;
  line-height: 34px;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.2s;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.select-wrapper .city-input {
  cursor: text;
}

.select-wrapper .gender-input,
.select-wrapper .type-input {
  cursor: pointer;
}

.select-wrapper .combo-input::placeholder {
  color: #999;
}

.select-wrapper .combo-input:hover {
  border-color: #007bff;
}

.select-wrapper .combo-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.city-dropdown,
.custom-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  margin-top: 4px;
  padding: 0;
  background: #fff;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  list-style: none;
  z-index: 100;
  box-sizing: border-box;
  overflow: hidden;
}

.dropdown-item {
  padding: 8px 16px;
  color: #000;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.city-dropdown::before {
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

.search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #999;
  pointer-events: none;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon svg {
  width: 100%;
  height: 100%;
}

.custom-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #666;
  pointer-events: none;
  z-index: 2;
}

.search-btn {
  padding: 0 24px;
  background: #00a8e8;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 80px;
  height: 36px;
  line-height: 36px;
  box-sizing: border-box;
}

.search-btn:hover {
  background: #0090c9;
}

.reset-btn {
  padding: 0 24px;
  background: #fff;
  color: #666;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 80px;
  height: 36px;
  line-height: 36px;
  box-sizing: border-box;
  margin-left: 8px;
}
.reset-btn:hover {
  background: #f5f5f5;
  border-color: #bbb;
}

/* 确保搜索栏在小屏幕上两个按钮不换行过于拥挤时可自行换行（已有flex-wrap） */
@media (max-width: 768px) {
  .search-item {
    flex-wrap: wrap;
    gap: 8px;
  }
  .reset-btn {
    margin-left: 0;
  }
}

/* ========== 宠物卡片列表 ========== */
.pet-cards-container {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  padding: 0 20px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 粘性定位时给卡片容器添加顶部间距，避免被遮挡 */
.filter-search-bar.sticky + .pet-cards-container {
  padding-top: 100px;
}

/* ========== 翻转卡片容器 ========== */
.pet-card-wrapper {
  perspective: 1000px;
  height: 430px;
}

.pet-card-flipper {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.pet-card-flipper.flipped {
  transform: rotateY(180deg);
}

/* 卡片正面 */
.pet-card-front {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* 卡片背面 - 只有图片和description */
.pet-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  transform: rotateY(180deg);
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

/* 背面description区域 */
.back-description-section {
  height: 100%;
  padding: 24px;
  overflow-y: auto;
  background: #fafafa;
}

.back-description-text {
  margin: 0;
  font-size: 14px;
  color: #555;
  line-height: 1.8;
  text-align: left;
}

/* 图片区域 */
.pet-image-wrapper {
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
  flex-shrink: 0;
}

.pet-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.pet-card-wrapper:hover .pet-image {
  transform: scale(1.05);
}

/* 信息列表区域 */
.pet-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.user-favorite-row {
  justify-content: space-between;
}

.poster-user {
  display: flex;
  align-items: center;
}

.poster-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #eef2f7;
}

.favorite-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #888;
  font-size: 13px;
  font-weight: 600;
}

.comment-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0 4px;
  color: #666;
  transition: transform 0.2s ease;
}

.comment-btn:hover {
  transform: scale(1.1);
}

.favorite-icon {
  color: #ffb347;
}

.favorite-btn {
  border: none;
  background: transparent;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  text-shadow: 0 0 1px #999, 0 0 2px rgba(0, 0, 0, 0.15);
  transition: color 0.2s ease, transform 0.2s ease;
}

.favorite-btn:hover {
  transform: scale(1.1);
}

.favorite-btn.favorited {
  color: #ffcc33;
  text-shadow: none;
}

.comments-modal {
  max-width: 520px;
}

.comments-body {
  max-height: 45vh;
  overflow: auto;
  padding: 0 2px;
  margin-top: 6px;
}

.comments-empty {
  padding: 18px 0;
  color: #888;
  text-align: center;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-item {
  display: flex;
  gap: 10px;
}

.comment-item.reply {
  margin-left: 34px;
}

.comment-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #f1f3f5;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  font-weight: 700;
}

.comment-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.comment-main {
  flex: 1;
  min-width: 0;
}

.comment-top {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.comment-author {
  font-weight: 700;
  color: #333;
  font-size: 13px;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-text {
  margin-top: 4px;
  color: #444;
  line-height: 1.5;
  word-break: break-word;
}

.reply-to {
  color: #1976d2;
  font-weight: 600;
}

.comment-reply-btn {
  margin-top: 6px;
  border: none;
  background: transparent;
  color: #1976d2;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
}

.comments-input {
  margin-top: 14px;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.replying-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.cancel-reply {
  border: none;
  background: transparent;
  color: #c62828;
  cursor: pointer;
  padding: 0;
}

.input-row {
  display: flex;
  gap: 10px;
}

.input-row input {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 10px 14px;
  outline: none;
}

.input-row input:focus {
  border-color: #00a8e8;
}

.input-row button {
  border: none;
  background: #00a8e8;
  color: white;
  border-radius: 20px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 600;
}

.input-row button:disabled {
  background: #b3e5fc;
  cursor: not-allowed;
}

.split-row {
  justify-content: space-between;
}

.left-cell,
.right-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.right-cell {
  justify-content: flex-end;
}

.gender-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.gender-icon.male {
  background: #e3f2fd;
  color: #2196f3;
}

.gender-icon.female {
  background: #fce4ec;
  color: #e91e63;
}

.gender-icon.unknown {
  background: #f5f5f5;
  color: #999;
}

.gender-text {
  color: #666;
  font-weight: 500;
  font-size: 14px;
}

.breed-label {
  background: #f8f9fa;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  color: #555;
  white-space: nowrap;
}

.inline-label {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
}

.inline-value {
  font-size: 13px;
  color: #333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location-cell svg {
  color: #00a8e8;
  flex-shrink: 0;
}

.phone-cell .inline-value {
  color: #00a8e8;
}

.phone-icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: #00a8e8;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 168, 232, 0.25);
  transition: all 0.2s ease;
}

.phone-icon-btn:hover {
  background: #0090c9;
  transform: scale(1.08);
}

/* ========== 弹窗样式 ========== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: #ffffff;
  border-radius: 20px;
  width: 90%;
  max-width: 360px;
  padding: 28px;
  position: relative;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: #e9ecef;
  border-radius: 50%;
  font-size: 18px;
  color: #495057;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-weight: 600;
}

.modal-close:hover {
  background: #dee2e6;
  color: #212529;
}

.modal-header {
  text-align: center;
  margin-bottom: 24px;
}

.modal-pet-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 12px;
  border: 4px solid #e9ecef;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.modal-pet-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #212529;
  margin: 0;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contact-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.contact-label {
  font-size: 12px;
  color: #000000;
  font-weight: 700;
  text-transform: uppercase;
}

/* 联系人名称样式 */
.contact-value {
  font-size: 17px;
  color: #212529;
  font-weight: 700;
  padding: 14px 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid #e9ecef;
  text-align: center;
}

/* 可复制框样式 - 灰框，内容居中，图标在右 */
.contact-value.copyable {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8f9fa;
  border-color: #e9ecef;
  position: relative;
  padding: 14px 48px 14px 16px;
}

.contact-value.copyable:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

/* 复制按钮在右侧 */
.copy-icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #dee2e6;
  color: #6c757d;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  position: absolute;
  right: 16px;
}

.copy-icon-btn:hover {
  background: #00a8e8;
  color: white;
  transform: scale(1.05);
}

/* 电话号码 - 蓝色字体，居中 */
.phone-text {
  color: #00a8e8;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.5px;
}

/* 微信号 - 灰黑色字体，居中 */
.contact-value.copyable.wechat span {
  color: #495057;
  font-weight: 600;
  font-size: 17px;
}

.modal-footer {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.modal-btn {
  padding: 14px 48px;
  background: #00a8e8;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn:hover {
  background: #0090c9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 168, 232, 0.3);
}

/* ========== 浮动发布按钮样式 ========== */
.fab-wrapper {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.fab-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffb347 0%, #ff8c42 100%);
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 140, 66, 0.4);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab-btn:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 6px 20px rgba(255, 140, 66, 0.5);
}

.fab-btn.active {
  transform: rotate(45deg);
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  box-shadow: 0 4px 15px rgba(238, 90, 90, 0.4);
}

.fab-btn svg {
  transition: transform 0.3s ease;
}

.fab-btn svg.rotate {
  transform: rotate(45deg);
}

/* 展开菜单 */
.fab-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: slideUpFab 0.3s ease;
}

@keyframes slideUpFab {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fab-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: white;
  border: none;
  border-radius: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.fab-item:hover {
  transform: translateX(-5px);
  background: #fff8f0;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

.fab-icon {
  font-size: 20px;
}

.fab-text {
  color: #333;
  font-weight: 500;
}

.ai-chat-ball {
  position: fixed;
  right: 32px;
  bottom: 108px;
  width: 52px;
  height: 52px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #00a8e8 0%, #4facfe 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 168, 232, 0.35);
  z-index: 998;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.ai-chat-ball:hover {
  transform: translateY(-2px) scale(1.06);
  box-shadow: 0 8px 22px rgba(0, 168, 232, 0.45);
}

/* 响应式 */
@media (max-width: 768px) {
  .pet-cards-container {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    padding: 0 16px 32px;
  }
  
  .pet-card-wrapper {
    height: auto;
  }
  
  .main-title {
    font-size: 24px;
  }
  
  /* 移动端FAB调整 */
  .fab-wrapper {
    bottom: 20px;
    right: 20px;
  }
  
  .fab-btn {
    width: 50px;
    height: 50px;
  }
  
  .fab-item {
    padding: 10px 16px;
    font-size: 13px;
  }

  .ai-chat-ball {
    right: 22px;
    bottom: 84px;
    width: 46px;
    height: 46px;
    font-size: 13px;
  }
}
</style>