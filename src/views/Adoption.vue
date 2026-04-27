<template>
  <div class="adopt">
    <!-- 主标题区域 -->
    <div class="main">
      <h1 class="main-title">
        每个宠物都值得一个充满爱的家。<br>
        今天就<span class="highlight">领养</span>一只宠物吧
      </h1>
      <p class="title-detail">
        浏览我们可领养的动物，了解更多领养流程。只要我们携起手来，就能<span class="bold">拯救、</span> 
        <span class="bold">康复并为有需要的宠物重新安家。</span>感谢您支持我们的使命，通过宠物领养为家庭带来欢乐。
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
            <div class="pet-image-wrapper">
              <img :src="pet.image" class="pet-image" />
            </div>
            
            <div class="pet-info">
              <div class="info-row user-favorite-row">
                <div class="poster-user">
                  <img
                    :src="pet.posterAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=poster'"
                    class="poster-avatar"
                    alt="发帖用户头像"
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

              <div class="info-row gender-breed-row">
                <div class="gender-row">
                  <span class="gender-icon" :class="getGenderClass(pet.gender)">
                    {{ getGenderIcon(pet.gender) }}
                  </span>
                  <span class="gender-text">{{ pet.gender }}</span>
                </div>
                <div class="breed-row">
                  <span class="breed-label">{{ pet.breed }}</span>
                </div>
              </div>
              
              <!-- 可点击翻转的 description -->
              <div 
                class="info-row description-row" 
                v-if="pet.description"
                @click="flipCard(pet.id)"
              >
                <span class="description-text">{{ pet.description }}</span>
              </div>
              
              <div class="info-row location-contact-row">
                <div class="location">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{{ pet.city }}{{ pet.district }}</span>
                </div>
                <button class="contact-btn" @click.stop="openContactModal(pet)" title="查看联系方式">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- 卡片背面 - 只有图片和完整description -->
          <div class="pet-card-back" @click="flipCard(pet.id)">
            <div class="pet-image-wrapper">
              <img :src="pet.image" class="pet-image" />
            </div>
            <div class="back-description-section">
              <p class="back-description-text">{{ pet.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 浮动发布按钮 ========== -->
    <div class="fab-wrapper" ref="fabRef">
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
          
          <div class="contact-item">
            <div class="contact-label">联系电话</div>
            <div class="contact-value copyable" @click="copyToClipboard(selectedPet?.contactPhone, '电话号码')">
              <span class="phone-text">{{ selectedPet?.contactPhone }}</span>
              <button class="copy-icon-btn" title="复制电话号码">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="contact-item" v-if="selectedPet?.contactWechat">
            <div class="contact-label">微信号</div>
            <div class="contact-value copyable wechat" @click="copyToClipboard(selectedPet?.contactWechat, '微信号')">
              <span>{{ selectedPet?.contactWechat }}</span>
              <button class="copy-icon-btn" title="复制微信号">
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

const FAVORITE_KIND: FavoriteKind = 'adoption'

// ============ 筛选相关 ============
const selectedCity = ref('')
const selectedGender = ref('')
const selectedType = ref('')
const cityInputRef = ref<HTMLInputElement | null>(null)
const selectBoxWidth = ref(140)
const showCityDropdown = ref(false)
const showGenderDropdown = ref(false)
const showTypeDropdown = ref(false)

const activeCity = ref('')
const activeGender = ref('')
const activeType = ref('')

const genders = ['公', '母', '不详']
const types = ['狗', '猫', '其他']

// ============ 卡片翻转相关 ============
const flippedCards = ref<Record<number, boolean>>({})

const flipCard = (petId: number) => {
  flippedCards.value[petId] = !flippedCards.value[petId]
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
  await fetchAdoptionPosts()
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

// ============ 宠物数据（含描述） ============
interface Pet {
  id: number
  image: string
  posterAvatar?: string
  favoriteCount?: number
  favorited?: boolean
  gender: string
  breed: string
  description?: string
  city: string      
  district: string
  contactName: string
  contactPhone: string
  contactWechat?: string
}

interface AdoptionPostDTO {
  id: number
  gender?: string
  breed?: string
  city?: string
  district?: string
  contactName?: string
  contactPhone?: string
  contactWechat?: string
  description?: string
  publisher?: { avatar?: string }
  images?: string[]
}

const pets = ref<Pet[]>([
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
    posterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang',
    favoriteCount: 128,
    favorited: false,
    gender: '公',
    breed: 'Terrier & Labrador Retriever',
    description: '活泼亲人，已打疫苗，性格温顺，适合有小孩家庭。这是一只非常可爱的狗狗，喜欢在草地上奔跑，对人非常友好，是家庭的理想选择。',
    city: '北京',
    district: '朝阳区',
    contactName: '张先生',
    contactPhone: '138-0000-0001',
    contactWechat: 'zhang_pet'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
    posterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li',
    favoriteCount: 86,
    favorited: false,
    gender: '母',
    breed: '金毛寻回犬',
    description: '一岁半，非常友好，已绝育，寻找爱心家庭。金毛犬性格温和，是家庭的理想伴侣，特别适合有小孩的家庭。',
    city: '上海',
    district: '浦东新区',
    contactName: '李女士',
    contactPhone: '139-0000-0002'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1583511655857-d19bc40da7e6?w=400&h=400&fit=crop',
    posterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang',
    favoriteCount: 64,
    favorited: false,
    gender: '公',
    breed: '阿拉斯加',
    description: '两岁，巨型雪橇犬，习惯良好，需要大空间。阿拉斯加犬精力充沛，需要经常运动，适合有院子的家庭。',
    city: '广州',
    district: '天河区',
    contactName: '王先生',
    contactPhone: '137-0000-0003',
    contactWechat: 'wang_alaska'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400&h=400&fit=crop',
    posterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chen',
    favoriteCount: 92,
    favorited: false,
    gender: '母',
    breed: '布偶猫',
    description: '温柔粘人，纯种布偶，已驱虫，送猫砂盆。布偶猫是理想的室内宠物，性格温顺，喜欢被人抱在怀里。',
    city: '深圳',
    district: '南山区',
    contactName: '陈女士',
    contactPhone: '136-0000-0004'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400&h=400&fit=crop',
    posterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liu',
    favoriteCount: 47,
    favorited: false,
    gender: '不详',
    breed: '柯基',
    description: '短腿萌犬，精力旺盛，已完成疫苗接种。柯基犬虽然腿短，但非常活泼可爱，是网红犬种。',
    city: '杭州',
    district: '西湖区',
    contactName: '刘先生',
    contactPhone: '135-0000-0005',
    contactWechat: 'liu_corgi'
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop',
    posterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhao',
    favoriteCount: 75,
    favorited: false,
    gender: '母',
    breed: '萨摩耶',
    description: '微笑天使，三岁，性格乖巧，寻找有经验主人。萨摩耶犬有着美丽的白色毛发，需要定期梳理。',
    city: '成都',
    district: '锦江区',
    contactName: '赵女士',
    contactPhone: '134-0000-0006'
  }
])

const mapAdoptionDTOToPet = (item: AdoptionPostDTO): Pet => ({
  id: Number(item.id),
  image: item.images?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop',
  posterAvatar: item.publisher?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=poster',
  favoriteCount: 0,
  favorited: false,
  gender: item.gender || '不详',
  breed: item.breed || '未知品种',
  description: item.description || '',
  city: item.city || '',
  district: item.district || '',
  contactName: item.contactName || '未填写',
  contactPhone: item.contactPhone || '未填写',
  contactWechat: item.contactWechat || ''
})

const fetchAdoptionPosts = async () => {
  try {
    const res = await request.get('/api/adoption/list', {
      params: { pageNum: 1, pageSize: 200 }
    })
    const records = res?.data?.list ?? res?.data?.records
    if (res?.code === 200 && Array.isArray(records)) {
      pets.value = records.map(mapAdoptionDTOToPet)
    }
  } catch (error) {
    console.warn('加载领养帖子失败，使用本地数据兜底', error)
  } finally {
    pets.value.forEach(p => {
      p.favorited = isFavorite(FAVORITE_KIND, p.id)
    })
  }
}

// ============ 动态城市列表 - 从宠物数据中提取 ============
const availableCities = computed(() => {
  const citySet = new Set<string>()
  pets.value.forEach(pet => {
    citySet.add(pet.city)
  })
  return Array.from(citySet).sort()
})

// ============ 弹窗相关 ============
const showContactModal = ref(false)
const selectedPet = ref<Pet | null>(null)

const openContactModal = (pet: Pet) => {
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

const toggleFavorite = (pet: Pet) => {
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
      title: pet.breed,
      subtitle: `${pet.city}${pet.district}`,
      detail: {
        posterAvatar: pet.posterAvatar,
        favoriteCount: pet.favoriteCount ?? 0,
        favorited: true,
        gender: pet.gender,
        breed: pet.breed,
        description: pet.description ?? '',
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

// 通用复制功能
const copyToClipboard = (text: string | undefined, label: string) => {
  if (!text) return
  navigator.clipboard.writeText(text)
  alert(`${label}已复制到剪贴板：${text}`)
}

// ============ 筛选逻辑 ============
const filteredPets = computed(() => {
  return pets.value.filter(pet => {
    const matchCity = !activeCity.value || pet.city === activeCity.value
    const matchGender = !activeGender.value || pet.gender === activeGender.value
    const matchType = !activeType.value || 
      (activeType.value === '狗' && !pet.breed.includes('猫')) ||
      (activeType.value === '猫' && pet.breed.includes('猫')) ||
      (activeType.value === '其他' && pet.breed.includes('其他'))
    return matchCity && matchGender && matchType
  })
})

// ============ 性别图标 ============
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
/* ========== 根容器背景设置为白色，占满整个视口 ========== */
.adopt {
  background-color: #ffffff;
  min-height: 100vh;
  width: 100%;
}

/* ========== 主标题区域 ========== */
.main {
  text-align: center;
  margin: 0 0 32px 0;
  padding: 20px 20px 0;
  background-color: #ffffff;
}

.main-title {
  font-size: 32px;
  font-weight: 800;
  color: #1a1a1a;
  line-height: 1.4;
  margin: 0 0 16px 0;
}

.main-title .highlight {
  color: #ffb347;
  font-weight: 800;
}

.title-detail {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  max-width: 700px;
  margin: 0 auto;
}

.title-detail .bold {
  color: #333;
  font-weight: 600;
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 0 20px 40px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #ffffff;
}

.filter-search-bar.sticky + .pet-cards-container {
  padding-top: 40px;
}

/* ========== 翻转卡片容器 ========== */
.pet-card-wrapper {
  perspective: 1000px;
  height: 440px;
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
  border-radius: 16px;
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
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

/* 背面description区域 - 占据剩余空间 */
.back-description-section {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #fafafa;
}

.back-description-text {
  font-size: 14px;
  color: #555;
  line-height: 1.8;
  text-align: left;
  margin: 0;
}

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

.pet-info {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
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

.gender-breed-row {
  justify-content: space-between;
  gap: 12px;
}

.gender-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
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
}

.breed-row {
  display: flex;
  justify-content: flex-end;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  min-width: 0;
}

.breed-label {
  background: #f8f9fa;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 170px;
}

/* 描述行样式 - 可点击翻转 */
.description-row {
  margin-top: 2px;
  cursor: pointer;
  position: relative;
  padding: 2px 0;
  transition: all 0.2s;
  border-radius: 6px;
}

.description-row:hover {
  background: #f0f7ff;
}

.description-text {
  font-size: 12px;
  color: #777;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.location-contact-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.location {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #888;
  font-size: 13px;
}

.location svg {
  color: #00a8e8;
}

.contact-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #00a8e8;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 168, 232, 0.3);
}

.contact-btn:hover {
  background: #0090c9;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 168, 232, 0.4);
}

/* ========== 弹窗样式 ========== */
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
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: #fff;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  padding: 24px;
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
  top: 16px;
  right: 16px;
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
  border: 4px solid #f0f0f0;
}

.modal-pet-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contact-label {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contact-value {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 10px;
}

.contact-value.copyable {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  position: relative;
  padding: 12px 48px 12px 16px;
}

.contact-value.copyable:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.phone-text {
  color: #00a8e8;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.5px;
}

.contact-value.copyable.wechat span {
  color: #495057;
  font-weight: 600;
  font-size: 17px;
}

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
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.copy-icon-btn:hover {
  background: #00a8e8;
  color: white;
  transform: translateY(-50%) scale(1.05);
}

.modal-footer {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.modal-btn {
  padding: 12px 32px;
  background: #00a8e8;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
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
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    padding: 0 16px 32px;
  }
  
  .pet-card-wrapper {
    height: 400px;
  }
  
  .pet-image-wrapper {
    height: 200px;
  }
  
  .filter-search-bar {
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px;
  }
  
  .filter-search-bar.sticky {
    padding: 8px 12px;
  }
  
  .filter-item label {
    font-size: 12px;
  }
  
  .main-title {
    font-size: 24px;
  }
  
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