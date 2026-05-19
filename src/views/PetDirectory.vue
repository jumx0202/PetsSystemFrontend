<template>
  <div class="directory-page">

    <!-- Hero -->
    <div class="dir-hero">
      <h1 class="dir-hero-title">宠物档案</h1>
      <p class="dir-hero-sub">浏览系统中所有已建档宠物，登录后可管理您的宠物信息</p>
    </div>

    <!-- Main Tab -->
    <div class="main-tab-bar">
      <div class="main-tab-inner">
        <button :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">全部档案</button>
        <button :class="{ active: activeTab === 'mine' }" @click="activateMineTab">我的宠物</button>
      </div>
    </div>

    <!-- ===== ALL PETS TAB ===== -->
    <template v-if="activeTab === 'all'">
      <div class="dir-filter">
        <div class="filter-tabs">
          <button
            v-for="tab in typeTabs"
            :key="tab.value"
            :class="{ active: activeType === tab.value }"
            @click="activeType = tab.value"
          >{{ tab.label }}</button>
        </div>
        <div class="filter-search">
          <input v-model="searchKeyword" placeholder="搜索宠物名或品种..." @input="onSearch" />
        </div>
      </div>

      <div v-if="allLoading" class="dir-loading">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
      <div v-else-if="filteredPets.length === 0" class="dir-empty">
        <div class="empty-icon">🐾</div>
        <p>暂无符合条件的宠物档案</p>
      </div>
      <div v-else class="dir-grid">
        <div
          v-for="pet in filteredPets"
          :key="pet.id"
          class="dir-card"
          @click="openDetail(pet)"
        >
          <div class="dir-card-img-wrap">
            <img :src="getPetAvatar(pet)" :alt="pet.petName" @error="handleImgError($event, pet)" />
            <span class="dir-type-badge" :class="getTypeClass(pet.petType)">{{ getPetTypeDesc(pet.petType) }}</span>
          </div>
          <div class="dir-card-body">
            <div class="dir-card-name-row">
              <span class="dir-card-name">{{ pet.petName }}</span>
              <span class="dir-card-gender" :class="getGenderClass(pet.gender)">{{ pet.gender || '?' }}</span>
            </div>
            <div class="dir-card-breed">{{ pet.breed || '品种未知' }}</div>
            <div class="dir-card-owner" v-if="pet.ownerName">主人：{{ pet.ownerName }}</div>
            <div class="dir-face-badge" :class="{ ready: pet.faceFeatureReady }">
              {{ pet.faceFeatureReady ? 'AI已建档' : 'AI未建档' }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ===== MY PETS TAB ===== -->
    <template v-else>
      <!-- Not logged in -->
      <div v-if="!isLoggedIn" class="login-prompt">
        <div class="login-prompt-icon">🐾</div>
        <h3>查看我的宠物档案</h3>
        <p>登录后可添加、编辑和管理您的宠物信息</p>
      </div>

      <!-- Logged in -->
      <div v-else>
        <div class="my-pets-header">
          <span class="my-pets-count">共 {{ myPets.length }} 只宠物</span>
          <button class="add-pet-btn" @click="openForm(null)">+ 添加宠物</button>
        </div>

        <div v-if="myLoading" class="dir-loading">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>
        <div v-else-if="myPets.length === 0" class="dir-empty">
          <div class="empty-icon">🐾</div>
          <p>您还没有添加任何宠物档案</p>
        </div>
        <div v-else class="dir-grid">
          <div v-for="pet in myPets" :key="pet.id" class="dir-card mine-card">
            <div class="dir-card-img-wrap" style="cursor:pointer" @click="openDetail(pet)">
              <img :src="getPetAvatar(pet)" :alt="pet.petName" @error="handleImgError($event, pet)" />
              <span class="dir-type-badge" :class="getTypeClass(pet.petType)">{{ getPetTypeDesc(pet.petType) }}</span>
            </div>
            <div class="dir-card-body">
              <div class="dir-card-name-row">
                <span class="dir-card-name">{{ pet.petName }}</span>
                <span class="dir-card-gender" :class="getGenderClass(pet.gender)">{{ pet.gender || '?' }}</span>
              </div>
              <div class="dir-card-breed">{{ pet.breed || '品种未知' }}</div>
              <div class="dir-face-badge" :class="{ ready: pet.faceFeatureReady }">
                {{ pet.faceFeatureReady ? 'AI已建档' : 'AI未建档' }}
              </div>
              <div class="mine-actions">
                <button class="mine-btn face-btn" @click="rebuildFaceFeature(pet)" :disabled="rebuildingPetId === pet.id">
                  {{ rebuildingPetId === pet.id ? '建立中...' : '建立特征' }}
                </button>
                <button class="mine-btn edit-btn" @click="openForm(pet)">编辑</button>
                <button class="mine-btn delete-btn" @click="deletePet(pet)">删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ===== DETAIL MODAL (shared) ===== -->
    <div v-if="showDetail && selectedPet" class="modal-overlay" @click="closeDetail">
      <div class="modal-content detail-modal" @click.stop>
        <button class="modal-close" @click="closeDetail">×</button>
        <div class="detail-header">
          <img :src="getPetAvatar(selectedPet)" class="detail-avatar" @error="handleImgError($event, selectedPet)" />
          <div class="detail-info">
            <div class="detail-name-row">
              <h2>{{ selectedPet.petName }}</h2>
              <span class="dir-type-badge" :class="getTypeClass(selectedPet.petType)">{{ getPetTypeDesc(selectedPet.petType) }}</span>
              <span class="dir-card-gender" :class="getGenderClass(selectedPet.gender)">{{ selectedPet.gender || '?' }}</span>
            </div>
            <p class="detail-breed">{{ selectedPet.breed || '品种未知' }}</p>
            <div class="dir-face-badge" :class="{ ready: selectedPet.faceFeatureReady }">
              {{ selectedPet.faceFeatureReady ? 'AI个体识别特征已建立' : 'AI个体识别特征未建立' }}
            </div>
          </div>
        </div>
        <div class="detail-fields">
          <div class="detail-field" v-if="selectedPet.age">
            <span class="field-label">年龄</span><span class="field-value">{{ selectedPet.age }} 岁</span>
          </div>
          <div class="detail-field" v-if="selectedPet.weight">
            <span class="field-label">体重</span><span class="field-value">{{ selectedPet.weight }} kg</span>
          </div>
          <div class="detail-field" v-if="selectedPet.color">
            <span class="field-label">花色</span><span class="field-value">{{ selectedPet.color }}</span>
          </div>
          <div class="detail-field" v-if="selectedPet.chipNumber">
            <span class="field-label">芯片编号</span><span class="field-value">{{ selectedPet.chipNumber }}</span>
          </div>
          <div class="detail-field" v-if="selectedPet.distinctiveFeatures">
            <span class="field-label">特征描述</span><span class="field-value">{{ selectedPet.distinctiveFeatures }}</span>
          </div>
        </div>
        <div v-if="selectedPet.ownerName || selectedPet.ownerPhone" class="detail-owner">
          <div class="owner-title">主人联系方式</div>
          <div class="owner-row" v-if="selectedPet.ownerName">
            <span class="field-label">姓名</span><span class="field-value">{{ selectedPet.ownerName }}</span>
          </div>
          <div class="owner-row owner-phone" v-if="selectedPet.ownerPhone" @click="copyPhone(selectedPet.ownerPhone)">
            <span class="field-label">电话</span>
            <span class="field-value phone-text">{{ selectedPet.ownerPhone }}</span>
            <button class="copy-btn">复制</button>
          </div>
        </div>
        <div v-if="selectedPet.images && selectedPet.images.length > 0" class="detail-images">
          <div class="images-title">宠物照片</div>
          <div class="images-grid">
            <img
              v-for="(url, idx) in selectedPet.images"
              :key="idx"
              :src="normalizeUrl(url)"
              class="detail-img"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ===== FORM MODAL (add / edit my pet) ===== -->
    <div v-if="showFormModal" class="modal-overlay" @click="closeForm">
      <div class="modal-content form-modal" @click.stop>
        <button class="modal-close" @click="closeForm">×</button>
        <div class="modal-header">
          <h3 class="modal-title">{{ isEdit ? '编辑宠物档案' : '新增宠物档案' }}</h3>
        </div>
        <div class="modal-body form-body">
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label>宠物名字 <span class="required">*</span></label>
              <input type="text" v-model="form.petName" required placeholder="请输入宠物名字" />
            </div>
            <div class="form-row">
              <div class="form-group half">
                <label>类型 <span class="required">*</span></label>
                <select v-model.number="form.petType">
                  <option :value="0">狗 (DOG)</option>
                  <option :value="1">猫 (CAT)</option>
                  <option :value="2">其他 (OTHER)</option>
                </select>
              </div>
              <div class="form-group half">
                <label>性别</label>
                <select v-model="form.gender">
                  <option value="">不详</option>
                  <option value="公">公</option>
                  <option value="母">母</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>品种</label>
              <input type="text" v-model="form.breed" placeholder="例如：金毛、布偶" />
            </div>
            <div class="form-row">
              <div class="form-group half">
                <label>出生日期</label>
                <input type="date" v-model="form.birthDate" />
              </div>
              <div class="form-group half">
                <label>体重 (kg)</label>
                <input type="number" step="0.1" v-model="form.weight" placeholder="0.0" />
              </div>
            </div>
            <div class="form-group">
              <label>花色</label>
              <input type="text" v-model="form.color" placeholder="例如：黑白相间" />
            </div>
            <div class="form-group">
              <label>特征描述</label>
              <textarea v-model="form.distinctiveFeatures" rows="3" placeholder="描述宠物的外貌特征"></textarea>
            </div>
            <div class="form-group">
              <label>芯片编号</label>
              <input type="text" v-model="form.chipNumber" placeholder="如果有植入芯片，请填写" />
            </div>
            <div class="form-group">
              <label>宠物头像</label>
              <div class="avatar-row">
                <img :src="normalizeUrl(form.avatar) || getDefaultAvatar(form.petType)" class="avatar-preview" alt="头像预览" />
                <div class="avatar-actions">
                  <input type="text" v-model="form.avatar" placeholder="图片链接或上传图片" />
                  <input ref="avatarInput" type="file" accept="image/jpeg,image/png" style="display:none" @change="handleAvatarChange" />
                  <button type="button" class="upload-btn" :disabled="uploadingAvatar" @click="avatarInput?.click()">
                    {{ uploadingAvatar ? '上传中...' : '上传头像' }}
                  </button>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>宠物照片 <span class="field-tip-inline">（多张，用于 AI 个体识别）</span></label>
              <div class="multi-image-grid">
                <div v-for="(url, idx) in form.images" :key="idx" class="multi-image-item">
                  <img :src="normalizeUrl(url)" alt="宠物照片" />
                  <button type="button" class="remove-img-btn" @click="removeImage(idx)">×</button>
                </div>
                <div class="multi-image-add" @click="imagesInput?.click()">
                  <span class="add-icon">+</span>
                  <span>添加照片</span>
                  <input ref="imagesInput" type="file" accept="image/jpeg,image/png" multiple style="display:none" @change="handleMultiImageChange" />
                </div>
              </div>
              <p class="field-tip">上传多角度照片可提升 PetFace 2.0 识别准确率。</p>
            </div>
          </form>
        </div>
        <div class="modal-footer form-footer">
          <button class="modal-btn cancel" @click="closeForm">取消</button>
          <button class="modal-btn confirm" @click="submitForm" :disabled="submitting">
            {{ submitting ? '提交中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
// @ts-ignore
import request from '../api/request.js'
import { Message } from '../utils/message'

const API_BASE_URL = 'http://localhost:8080'

// ===== Helpers =====
const normalizeUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url
  if (url.startsWith('/upload/') || url.startsWith('/images/')) return `${API_BASE_URL}${url}`
  return url
}

interface PetItem {
  id: number
  petName: string
  petType: number
  petTypeDesc?: string
  breed: string
  gender: string
  age?: number
  weight?: number
  color?: string
  chipNumber?: string
  distinctiveFeatures?: string
  birthDate?: string
  avatar?: string
  images?: string[]
  faceFeatureReady?: boolean
  ownerName?: string
  ownerPhone?: string
}

// ===== Main tab =====
const activeTab = ref<'all' | 'mine'>('all')
const isLoggedIn = ref(false)

const activateMineTab = () => {
  const token = localStorage.getItem('token')
  isLoggedIn.value = !!token
  activeTab.value = 'mine'
  if (isLoggedIn.value) fetchMyPets()
}

// ===== ALL PETS =====
const typeTabs = [
  { label: '全部', value: -1 },
  { label: '狗', value: 0 },
  { label: '猫', value: 1 },
  { label: '其他', value: 2 }
]

const allLoading = ref(false)
const allPets = ref<PetItem[]>([])
const activeType = ref(-1)
const searchKeyword = ref('')
const searchValue = ref('')

const fetchAllPets = async () => {
  allLoading.value = true
  try {
    const res = await request.get('/api/pet/all', { params: { page: 1, size: 200 } })
    if (res.code === 200) {
      allPets.value = res.data || []
    } else {
      Message.error(res.message || '加载宠物列表失败')
    }
  } catch {
    Message.error('加载失败，请检查网络或后端服务是否启动')
  } finally {
    allLoading.value = false
  }
}

const filteredPets = computed(() =>
  allPets.value.filter(pet => {
    const matchType = activeType.value === -1 || pet.petType === activeType.value
    const kw = searchValue.value.trim().toLowerCase()
    const matchSearch = !kw ||
      pet.petName.toLowerCase().includes(kw) ||
      (pet.breed || '').toLowerCase().includes(kw)
    return matchType && matchSearch
  })
)

const onSearch = () => { searchValue.value = searchKeyword.value }

// ===== MY PETS =====
const myLoading = ref(false)
const myPets = ref<PetItem[]>([])
const rebuildingPetId = ref<number | null>(null)
const submitting = ref(false)
const uploadingAvatar = ref(false)
const uploadingImages = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)
const imagesInput = ref<HTMLInputElement | null>(null)
const showFormModal = ref(false)
const isEdit = ref(false)

const form = ref({
  id: null as number | null,
  petName: '',
  petType: 0,
  breed: '',
  gender: '',
  birthDate: '',
  weight: null as number | null,
  color: '',
  distinctiveFeatures: '',
  chipNumber: '',
  avatar: '',
  images: [] as string[]
})

const emptyForm = () => ({
  id: null as number | null,
  petName: '', petType: 0, breed: '', gender: '', birthDate: '',
  weight: null as number | null, color: '', distinctiveFeatures: '',
  chipNumber: '', avatar: '', images: [] as string[]
})

const fetchMyPets = async () => {
  myLoading.value = true
  try {
    const res = await request.get('/api/pet/list')
    if (res.code === 200) myPets.value = res.data || []
  } catch {
    Message.error('获取宠物列表失败')
  } finally {
    myLoading.value = false
  }
}

const openForm = (pet: PetItem | null) => {
  if (pet) {
    isEdit.value = true
    form.value = {
      id: pet.id,
      petName: pet.petName || '',
      petType: pet.petType ?? 0,
      breed: pet.breed || '',
      gender: pet.gender || '',
      birthDate: pet.birthDate || '',
      weight: pet.weight || null,
      color: pet.color || '',
      distinctiveFeatures: pet.distinctiveFeatures || '',
      chipNumber: pet.chipNumber || '',
      avatar: pet.avatar || '',
      images: Array.isArray(pet.images) ? [...pet.images] : []
    }
  } else {
    isEdit.value = false
    form.value = emptyForm()
  }
  showFormModal.value = true
}

const closeForm = () => { showFormModal.value = false }

const submitForm = async () => {
  if (!form.value.petName) { Message.warning('宠物名字不能为空'); return }
  submitting.value = true
  try {
    const payload = { ...form.value }
    const res = isEdit.value && payload.id
      ? await request.put(`/api/pet/${payload.id}`, payload)
      : await request.post('/api/pet/create', payload)
    if (res.code === 200) {
      Message.success(isEdit.value ? '修改成功' : '添加成功')
      closeForm()
      fetchMyPets()
      fetchAllPets()
    } else {
      Message.error(res.message || '操作失败')
    }
  } catch {
    Message.error('保存异常，请检查网络')
  } finally {
    submitting.value = false
  }
}

const deletePet = async (pet: PetItem) => {
  if (!confirm(`确定要删除宠物 [${pet.petName}] 吗？`)) return
  try {
    const res = await request.delete(`/api/pet/${pet.id}`)
    if (res.code === 200) {
      Message.success('删除成功')
      fetchMyPets()
      fetchAllPets()
    } else {
      Message.error(res.message || '删除失败')
    }
  } catch {
    Message.error('删除异常，请检查网络')
  }
}

const rebuildFaceFeature = async (pet: PetItem) => {
  if (!pet?.id) return
  if (!pet.avatar) { Message.warning('请先为宠物上传头像'); return }
  rebuildingPetId.value = pet.id
  try {
    const res = await request.post(`/api/pet/${pet.id}/face/rebuild`)
    if (res.code === 200) {
      Message.success('个体识别特征已建立')
      fetchMyPets()
    } else {
      Message.error(res.message || '建立特征失败')
    }
  } catch {
    Message.error('建立特征异常，请确认 AI 服务已启动')
  } finally {
    rebuildingPetId.value = null
  }
}

const handleAvatarChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploadingAvatar.value = true
  try {
    const fd = new FormData(); fd.append('file', file)
    const res = await request.post('/api/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 30000 })
    if (res.code === 200 && res.data) { form.value.avatar = res.data; Message.success('头像上传成功') }
    else Message.error(res.message || '头像上传失败')
  } catch { Message.error('头像上传异常') }
  finally { uploadingAvatar.value = false; if (avatarInput.value) avatarInput.value.value = '' }
}

const removeImage = (idx: number) => { form.value.images.splice(idx, 1) }

const handleMultiImageChange = async (event: Event) => {
  const files = Array.from((event.target as HTMLInputElement).files || [])
  if (!files.length) return
  uploadingImages.value = true
  try {
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      const fd = new FormData(); fd.append('file', file)
      const res = await request.post('/api/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 30000 })
      if (res.code === 200 && res.data) form.value.images.push(res.data)
    }
    Message.success('照片上传成功')
  } catch { Message.error('照片上传失败') }
  finally { uploadingImages.value = false; if (imagesInput.value) imagesInput.value.value = '' }
}

// ===== Shared: detail modal =====
const showDetail = ref(false)
const selectedPet = ref<PetItem | null>(null)

const openDetail = (pet: PetItem) => {
  selectedPet.value = pet
  showDetail.value = true
  document.body.style.overflow = 'hidden'
}

const closeDetail = () => {
  showDetail.value = false
  selectedPet.value = null
  document.body.style.overflow = ''
}

const copyPhone = (phone: string) => {
  navigator.clipboard.writeText(phone)
  Message.success('电话号码已复制')
}

// ===== Shared: display helpers =====
const getPetTypeDesc = (type: number) => type === 0 ? '狗' : type === 1 ? '猫' : '其他'
const getTypeClass = (type: number) => type === 0 ? 'type-dog' : type === 1 ? 'type-cat' : 'type-other'
const getGenderClass = (gender: string) => gender === '公' ? 'gender-male' : gender === '母' ? 'gender-female' : 'gender-unknown'

const getDefaultAvatar = (type: number) => {
  const colors = type === 1
    ? { bg: '#fff7ed', accent: '#f97316', dark: '#9a3412' }
    : type === 0
      ? { bg: '#eff6ff', accent: '#2563eb', dark: '#1e3a8a' }
      : { bg: '#f0fdf4', accent: '#16a34a', dark: '#14532d' }
  const label = type === 1 ? 'CAT' : type === 0 ? 'DOG' : 'PET'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="${colors.bg}"/><circle cx="31" cy="34" r="9" fill="${colors.accent}"/><circle cx="48" cy="27" r="10" fill="${colors.accent}"/><circle cx="65" cy="34" r="9" fill="${colors.accent}"/><circle cx="37" cy="54" r="9" fill="${colors.accent}"/><circle cx="59" cy="54" r="9" fill="${colors.accent}"/><path d="M27 67c4-13 13-20 21-20s17 7 21 20c2 7-3 13-10 11-5-1-7-3-11-3s-7 2-11 3c-7 2-12-4-10-11z" fill="${colors.dark}"/><text x="48" y="88" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="${colors.dark}">${label}</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const getPetAvatar = (pet: PetItem) => pet.avatar ? normalizeUrl(pet.avatar) : getDefaultAvatar(pet.petType)

const handleImgError = (e: Event, pet: PetItem) => {
  (e.target as HTMLImageElement).src = getDefaultAvatar(pet.petType)
}

onMounted(() => {
  isLoggedIn.value = !!localStorage.getItem('token')
  fetchAllPets()
})
</script>

<style scoped>
.directory-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 48px;
}

/* ===== Hero ===== */
.dir-hero {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
  padding: 48px 24px 36px;
  text-align: center;
  color: #fff;
}
.dir-hero-title {
  font-size: 2.4rem;
  font-weight: 800;
  margin: 0 0 12px;
  letter-spacing: -0.02em;
}
.dir-hero-sub {
  font-size: 1rem;
  color: #94a3b8;
  margin: 0;
}

/* ===== Main Tab Bar ===== */
.main-tab-bar {
  display: flex;
  justify-content: center;
  padding: 20px 24px 0;
}
.main-tab-inner {
  display: flex;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
}
.main-tab-inner button {
  padding: 9px 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.main-tab-inner button.active {
  background: #fff;
  color: #0f172a;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* ===== Filter bar ===== */
.dir-filter {
  max-width: 1200px;
  margin: 20px auto 0;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.filter-tabs { display: flex; gap: 8px; }
.filter-tabs button {
  height: 36px;
  padding: 0 18px;
  border: 1px solid #dde3ec;
  border-radius: 8px;
  background: #fff;
  color: #555;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.filter-tabs button.active { background: #00a8e8; border-color: #00a8e8; color: #fff; }
.filter-tabs button:hover:not(.active) { border-color: #00a8e8; color: #00a8e8; }
.filter-search input {
  height: 36px;
  padding: 0 14px;
  border: 1px solid #dde3ec;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  width: 220px;
  transition: border-color 0.2s;
}
.filter-search input:focus { border-color: #00a8e8; }

/* ===== Loading / Empty ===== */
.dir-loading { text-align: center; padding: 80px 0; color: #999; }
.spinner {
  width: 36px; height: 36px;
  border: 3px solid #f0f0f0;
  border-top-color: #00a8e8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.dir-empty { text-align: center; padding: 80px 0; color: #999; }
.empty-icon { font-size: 60px; margin-bottom: 16px; }

/* ===== Pet Grid ===== */
.dir-grid {
  max-width: 1200px;
  margin: 20px auto 0;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
.dir-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.dir-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
.mine-card { cursor: default; }
.dir-card-img-wrap {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: #f8fafc;
}
.dir-card-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.dir-card:hover .dir-card-img-wrap img { transform: scale(1.05); }
.dir-type-badge {
  position: absolute; top: 8px; left: 8px;
  padding: 3px 8px; border-radius: 6px;
  font-size: 11px; font-weight: 700; color: #fff;
}
.type-dog { background: #2563eb; }
.type-cat { background: #f97316; }
.type-other { background: #16a34a; }

.dir-card-body { padding: 12px 14px 14px; }
.dir-card-name-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.dir-card-name {
  font-size: 16px; font-weight: 700; color: #1a1a1a;
  flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.dir-card-gender { font-size: 12px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
.gender-male { background: #dbeafe; color: #1d4ed8; }
.gender-female { background: #fce7f3; color: #be185d; }
.gender-unknown { background: #f3f4f6; color: #6b7280; }
.dir-card-breed { font-size: 13px; color: #64748b; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dir-card-owner { font-size: 12px; color: #999; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dir-face-badge {
  display: inline-block; font-size: 11px; padding: 2px 7px; border-radius: 4px;
  background: #fef3c7; color: #92400e; font-weight: 600;
}
.dir-face-badge.ready { background: #dcfce7; color: #15803d; }

/* ===== My Pets Section ===== */
.login-prompt {
  text-align: center;
  padding: 80px 24px;
  color: #555;
}
.login-prompt-icon { font-size: 60px; margin-bottom: 16px; }
.login-prompt h3 { font-size: 20px; font-weight: 700; color: #1a1a1a; margin: 0 0 10px; }
.login-prompt p { font-size: 15px; color: #64748b; margin: 0; }

.my-pets-header {
  max-width: 1200px;
  margin: 20px auto 0;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.my-pets-count { font-size: 15px; color: #64748b; font-weight: 600; }
.add-pet-btn {
  height: 38px;
  padding: 0 20px;
  background: #00a8e8;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.add-pet-btn:hover { background: #0090c8; }

.mine-actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.mine-btn {
  flex: 1;
  min-width: 0;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.mine-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.face-btn { color: #0f766e; border-color: #99f6e4; }
.face-btn:hover:not(:disabled) { background: #f0fdfa; }
.edit-btn { color: #00a8e8; border-color: #bae6fd; }
.edit-btn:hover { background: #f0f9ff; }
.delete-btn { color: #ef4444; border-color: #fecaca; }
.delete-btn:hover { background: #fff5f5; }

/* ===== Detail Modal ===== */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal-content {
  background: #fff; border-radius: 20px;
  position: relative; max-height: 90vh; overflow-y: auto;
  animation: slideUp 0.3s ease;
}
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.detail-modal { width: 100%; max-width: 480px; padding: 28px; }
.modal-close {
  position: absolute; top: 14px; right: 14px;
  width: 32px; height: 32px; border: none;
  background: #f0f0f0; border-radius: 50%;
  font-size: 20px; color: #666; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.modal-close:hover { background: #e0e0e0; }
.detail-header { display: flex; gap: 16px; margin-bottom: 20px; }
.detail-avatar { width: 96px; height: 96px; border-radius: 12px; object-fit: cover; flex-shrink: 0; border: 2px solid #f0f0f0; }
.detail-info { min-width: 0; display: flex; flex-direction: column; gap: 6px; justify-content: center; }
.detail-name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.detail-name-row h2 { margin: 0; font-size: 22px; font-weight: 800; color: #1a1a1a; }
.detail-breed { margin: 0; color: #64748b; font-size: 14px; }
.detail-fields {
  display: flex; flex-direction: column; gap: 10px;
  padding: 16px; background: #f9fafb; border-radius: 12px; margin-bottom: 16px;
}
.detail-field { display: flex; align-items: flex-start; gap: 12px; }
.field-label { font-size: 13px; color: #94a3b8; font-weight: 600; width: 70px; flex-shrink: 0; }
.field-value { font-size: 14px; color: #334155; font-weight: 500; word-break: break-all; }
.detail-owner {
  border: 1px solid #dbeafe; border-radius: 12px;
  padding: 14px 16px; background: #f0f9ff; margin-bottom: 16px;
}
.owner-title { font-size: 13px; font-weight: 800; color: #0369a1; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
.owner-row { display: flex; align-items: center; gap: 12px; margin-top: 6px; }
.owner-phone { cursor: pointer; }
.phone-text { color: #0284c7 !important; font-weight: 700 !important; font-size: 16px !important; }
.copy-btn {
  border: 1px solid #0284c7; background: #fff; color: #0284c7;
  border-radius: 6px; padding: 4px 10px; font-size: 12px; font-weight: 700;
  cursor: pointer; margin-left: auto;
}
.copy-btn:hover { background: #0284c7; color: #fff; }
.detail-images { margin-top: 4px; }
.images-title { font-size: 13px; font-weight: 700; color: #64748b; margin-bottom: 10px; }
.images-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.detail-img { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; border: 1px solid #e2e8f0; }

/* ===== Form Modal ===== */
.form-modal { width: 100%; max-width: 440px; }
.modal-header { padding: 20px 20px 10px; border-bottom: 1px solid #f0f0f0; }
.modal-title { margin: 0; font-size: 18px; color: #333; font-weight: 700; }
.form-body { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group label { font-size: 14px; color: #666; }
.required { color: #ef4444; }
.field-tip-inline { font-size: 12px; color: #aaa; font-weight: 400; }
.form-row { display: flex; gap: 12px; }
.half { flex: 1; }
.form-group input,
.form-group select,
.form-group textarea {
  padding: 9px 12px; border: 1px solid #ddd; border-radius: 8px;
  font-size: 14px; outline: none; font-family: inherit;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus { border-color: #00a8e8; }
.avatar-row { display: flex; gap: 12px; align-items: center; }
.avatar-preview { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; background: #f8fafc; border: 1px solid #e2e8f0; flex-shrink: 0; }
.avatar-actions { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.upload-btn {
  border: 1px solid #00a8e8; background: #fff; color: #00a8e8;
  border-radius: 8px; padding: 7px 12px; cursor: pointer; font-weight: 600; font-size: 13px;
}
.upload-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.field-tip { margin: 4px 0 0; color: #888; font-size: 12px; }
.multi-image-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
.multi-image-item { position: relative; width: 68px; height: 68px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
.multi-image-item img { width: 100%; height: 100%; object-fit: cover; }
.remove-img-btn {
  position: absolute; top: 2px; right: 2px; width: 18px; height: 18px;
  border-radius: 50%; border: none; background: rgba(0,0,0,0.55);
  color: #fff; font-size: 13px; line-height: 1; cursor: pointer;
  display: flex; align-items: center; justify-content: center; padding: 0;
}
.multi-image-add {
  width: 68px; height: 68px; border-radius: 8px; border: 1.5px dashed #ccc;
  background: #f8fafc; display: flex; flex-direction: column;
  align-items: center; justify-content: center; cursor: pointer;
  color: #999; font-size: 12px; gap: 2px; transition: border-color 0.2s;
}
.multi-image-add:hover { border-color: #00a8e8; color: #00a8e8; }
.add-icon { font-size: 20px; font-weight: 300; line-height: 1; }
.form-footer { padding: 14px 20px; border-top: 1px solid #f0f0f0; display: flex; gap: 12px; justify-content: flex-end; }
.modal-btn { padding: 9px 22px; border-radius: 8px; font-size: 14px; cursor: pointer; border: none; font-weight: 600; }
.modal-btn.cancel { background: #f5f5f5; color: #666; }
.modal-btn.confirm { background: #00a8e8; color: #fff; }
.modal-btn:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 640px) {
  .dir-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; padding: 0 16px; }
  .dir-filter { flex-direction: column; align-items: flex-start; gap: 12px; }
  .filter-search input { width: 100%; }
  .main-tab-inner button { padding: 8px 20px; font-size: 14px; }
  .detail-modal, .form-modal { padding: 20px 16px; }
}
</style>
