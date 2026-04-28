<template>
  <div class="profile-page">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 顶部导航 -->
    <div class="section-box info-box">
      <div class="header-section">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="page-title">我的宠物</h1>
      </div>
    </div>

    <!-- 宠物列表 -->
    <div class="section-box list-box">
      <h2 class="list-title">宠物档案列表</h2>
      <p v-if="!loading && pets.length === 0" class="empty-text">
        您还没有添加任何宠物档案。
      </p>
      
      <ul v-else class="item-list">
        <li v-for="pet in pets" :key="pet.id" class="item-row pet-card">
          <div class="item-main">
            <img :src="getPetAvatar(pet)" alt="宠物头像" class="item-cover" @error="handleImageError($event, pet)" />
            <div class="item-meta">
              <div class="pet-header">
                <span class="item-name">{{ pet.petName }}</span>
                <span class="item-tag tag-type">{{ getPetTypeDesc(pet.petType) }}</span>
                <span class="item-tag" :class="getGenderClass(pet.gender)">{{ pet.gender }}</span>
              </div>
              <div class="item-sub">
                品种：{{ pet.breed || '未知' }} | 年龄：{{ pet.age !== null ? pet.age + '岁' : '未知' }} | 体重：{{ pet.weight ? pet.weight + 'kg' : '未知' }}
              </div>
              <div class="item-sub chip" v-if="pet.chipNumber">芯片：{{ pet.chipNumber }}</div>
            </div>
          </div>
          <div class="publish-actions">
            <button class="edit-btn" @click="openForm(pet)">编辑</button>
            <button class="delete-btn" @click="deletePet(pet)">删除</button>
          </div>
        </li>
      </ul>
      
      <button class="primary-btn full-width" @click="openForm(null)">
        + 添加宠物
      </button>
    </div>

    <!-- 新增/编辑弹窗 -->
    <div v-if="showFormModal" class="modal-overlay" @click="closeForm">
      <div class="modal-content" @click.stop>
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
                <select v-model.number="form.petType" required>
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
              <label>宠物头像 URL</label>
              <input type="text" v-model="form.avatar" placeholder="图片链接 (可选)" />
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '../utils/message'
// @ts-ignore
import request from '../api/request.js'

const router = useRouter()
const getDefaultPetAvatar = (type: number | null | undefined) => {
  const colors = type === 1
    ? { bg: '#fff7ed', accent: '#f97316', dark: '#9a3412' }
    : type === 0
      ? { bg: '#eff6ff', accent: '#2563eb', dark: '#1e3a8a' }
      : { bg: '#f0fdf4', accent: '#16a34a', dark: '#14532d' }
  const label = type === 1 ? 'CAT' : type === 0 ? 'DOG' : 'PET'
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="48" fill="${colors.bg}"/>
      <circle cx="31" cy="34" r="9" fill="${colors.accent}"/>
      <circle cx="48" cy="27" r="10" fill="${colors.accent}"/>
      <circle cx="65" cy="34" r="9" fill="${colors.accent}"/>
      <circle cx="37" cy="54" r="9" fill="${colors.accent}"/>
      <circle cx="59" cy="54" r="9" fill="${colors.accent}"/>
      <path d="M27 67c4-13 13-20 21-20s17 7 21 20c2 7-3 13-10 11-5-1-7-3-11-3s-7 2-11 3c-7 2-12-4-10-11z" fill="${colors.dark}"/>
      <text x="48" y="88" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="${colors.dark}">${label}</text>
    </svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const loading = ref(false)
const submitting = ref(false)
const pets = ref<any[]>([])

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
  avatar: ''
})

const goBack = () => router.back()

const getPetAvatar = (pet: any) => pet.avatar || getDefaultPetAvatar(pet.petType)

const handleImageError = (e: Event, pet: any) => {
  const target = e.target as HTMLImageElement
  target.src = getDefaultPetAvatar(pet.petType)
}

const getPetTypeDesc = (type: number) => {
  if (type === 0) return '狗'
  if (type === 1) return '猫'
  if (type === 2) return '其他'
  return '未知'
}

const getGenderClass = (gender: string) => {
  if (gender === '公') return 'tag-male'
  if (gender === '母') return 'tag-female'
  return 'tag-unknown'
}

const fetchPets = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/pet/list')
    if (res.code === 200) {
      pets.value = res.data || []
    } else {
      console.warn('获取宠物列表失败', res.message)
    }
  } catch (err) {
    console.error('获取宠物列表异常', err)
  } finally {
    loading.value = false
  }
}

const openForm = (pet: any | null) => {
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
      avatar: pet.avatar || ''
    }
  } else {
    isEdit.value = false
    form.value = {
      id: null,
      petName: '',
      petType: 0,
      breed: '',
      gender: '',
      birthDate: '',
      weight: null,
      color: '',
      distinctiveFeatures: '',
      chipNumber: '',
      avatar: ''
    }
  }
  showFormModal.value = true
}

const closeForm = () => {
  showFormModal.value = false
}

const submitForm = async () => {
  if (!form.value.petName) {
    Message.warning('宠物名字不能为空')
    return
  }
  
  submitting.value = true
  try {
    const payload = { ...form.value }
    let res
    if (isEdit.value && payload.id) {
      res = await request.put(`/api/pet/${payload.id}`, payload)
    } else {
      res = await request.post('/api/pet/create', payload)
    }
    
    if (res.code === 200) {
      Message.success(isEdit.value ? '修改成功' : '添加成功')
      closeForm()
      await fetchPets()
    } else {
      Message.error(res.message || '操作失败')
    }
  } catch (err) {
    console.error('保存宠物异常', err)
    Message.error('保存异常，请检查网络')
  } finally {
    submitting.value = false
  }
}

const deletePet = async (pet: any) => {
  if (!confirm(`确定要删除宠物 [${pet.petName}] 吗？`)) return
  
  try {
    const res = await request.delete(`/api/pet/${pet.id}`)
    if (res.code === 200) {
      Message.success('删除成功')
      await fetchPets()
    } else {
      Message.error(res.message || '删除失败')
    }
  } catch (err) {
    console.error('删除宠物异常', err)
    Message.error('删除异常，请检查网络')
  }
}

onMounted(() => {
  fetchPets()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
}

.section-box {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.header-section {
  display: flex;
  align-items: center;
  gap: 10px;
  color: black;
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
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.list-box {
  flex: 1;
}

.list-title {
  margin: 0 0 16px;
  font-size: 18px;
  color: #333;
}

.empty-text {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.item-list {
  list-style: none;
  margin: 0 0 20px 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #f9fafb;
}

.item-main {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-cover {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.item-meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pet-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.item-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.tag-type {
  background: #ede7f6;
  color: #5e35b1;
}

.tag-male {
  background: #e3f2fd;
  color: #1976d2;
}

.tag-female {
  background: #fce4ec;
  color: #c2185b;
}

.tag-unknown {
  background: #f5f5f5;
  color: #757575;
}

.item-sub {
  font-size: 13px;
  color: #666;
}

.chip {
  font-size: 12px;
  color: #999;
}

.publish-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-btn, .delete-btn {
  border: none;
  background: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid #ddd;
}

.edit-btn {
  color: #00a8e8;
  border-color: #00a8e8;
}

.delete-btn {
  color: #f44336;
  border-color: #ffcdd2;
}

.primary-btn {
  background: #00a8e8;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.full-width {
  width: 100%;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #fff;
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
  position: relative;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-close {
  position: absolute;
  right: 16px;
  top: 16px;
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  z-index: 10;
}

.modal-header {
  padding: 20px 20px 10px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.form-body {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.half {
  flex: 1;
}

.form-group label {
  font-size: 14px;
  color: #666;
}

.required {
  color: red;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #00a8e8;
}

.form-footer {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  font-weight: 500;
}

.modal-btn.cancel {
  background: #f5f5f5;
  color: #666;
}

.modal-btn.confirm {
  background: #00a8e8;
  color: #fff;
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.spinner {
  width: 30px; height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #00a8e8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
