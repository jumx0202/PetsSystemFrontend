<template>
  <div class="location-container">
    <!-- 左侧宠物列表 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>我的宠物</h2>
        <p class="subtitle">实时定位追踪</p>
      </div>
      
      <div class="pet-list" v-if="myPets.length > 0">
        <div 
          v-for="pet in myPets" 
          :key="pet.id" 
          class="pet-card"
          :class="{ active: selectedPetId === pet.id }"
          @click="selectPet(pet.id)"
        >
          <img :src="getPetAvatar(pet)" alt="宠物头像" class="pet-avatar" @error="handlePetAvatarError($event, pet)" />
          <div class="pet-info">
            <h3 class="pet-name">{{ pet.petName }}</h3>
            <div class="status-indicator" :class="{ online: isPetOnline(pet.id) }">
              <span class="dot"></span>
              <span class="text">{{ isPetOnline(pet.id) ? '在线' : '离线' }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>您还没有添加宠物档案</p>
        <button class="btn btn-primary" @click="$router.push('/pet-profile')">去添加宠物</button>
      </div>

      <!-- 历史轨迹控制 -->
      <div class="history-controls" v-if="selectedPetId">
        <h3>轨迹回放</h3>
        <select v-model="historyHours" @change="fetchHistory" class="history-select">
          <option :value="1">过去 1 小时</option>
          <option :value="6">过去 6 小时</option>
          <option :value="24">过去 24 小时</option>
          <option :value="72">过去 3 天</option>
        </select>
        <button class="btn btn-outline" @click="fetchHistory">刷新轨迹</button>
      </div>
    </div>

    <!-- 右侧地图区域 -->
    <div class="map-area">
      <div id="leaflet-map" class="map-container"></div>
      
      <!-- 实时状态浮层 -->
      <div class="status-overlay" v-if="selectedPetId && latestLocation">
        <div class="overlay-item">
          <span class="label">最后更新</span>
          <span class="value">{{ formatTime(latestLocation.recordedAt) }}</span>
        </div>
        <div class="overlay-item">
          <span class="label">当前速度</span>
          <span class="value">{{ latestLocation.speed ? latestLocation.speed.toFixed(1) : '0.0' }} km/h</span>
        </div>
      </div>
      
      <div class="empty-map" v-if="!selectedPetId">
        <div class="empty-content">
          <div class="icon">🗺️</div>
          <h2>请在左侧选择要追踪的宠物</h2>
          <p>选中后即可查看宠物的实时位置和历史轨迹</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs'
import { Message } from '../utils/message'
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'

// ============ 状态管理 ============
const myPets = ref<any[]>([])
const selectedPetId = ref<number | null>(null)
const latestLocation = ref<any>(null)
const historyHours = ref<number>(1)
const isOnlineMap = ref<Record<number, boolean>>({})

// ============ 地图与WebSocket ============
let map: L.Map | null = null
let marker: L.Marker | null = null
let polyline: L.Polyline | null = null
let stompClient: Client | null = null
let currentSubscription: any = null

const API_BASE_URL = 'http://localhost:8080/api'
const WS_URL = 'http://localhost:8080/ws'

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

const getPetAvatar = (pet: any) => pet.avatar || getDefaultPetAvatar(pet.petType)

const handlePetAvatarError = (e: Event, pet: any) => {
  const target = e.target as HTMLImageElement
  target.src = getDefaultPetAvatar(pet.petType)
}

// ============ 初始化 ============
onMounted(async () => {
  await fetchMyPets()
  initMap()
  initWebSocket()
})

onUnmounted(() => {
  if (stompClient) {
    stompClient.deactivate()
  }
  if (map) {
    map.remove()
  }
})

// ============ 数据加载 ============
const fetchMyPets = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return
    
    const response = await fetch(`${API_BASE_URL}/pet/list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const result = await response.json()
    if (result.code === 200) {
      myPets.value = result.data || []
    }
  } catch (error) {
    console.error('获取宠物列表失败', error)
  }
}

// 选择宠物
const selectPet = async (id: number) => {
  selectedPetId.value = id
  
  // 1. 获取最新位置
  await fetchLatestLocation(id)
  
  // 2. 获取历史轨迹
  await fetchHistory()
  
  // 3. 订阅 WebSocket
  subscribeToPet(id)
}

const fetchLatestLocation = async (id: number) => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/location/${id}/latest`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const result = await response.json()
    if (result.code === 200 && result.data) {
      latestLocation.value = result.data
      isOnlineMap.value[id] = isRecentlyUpdated(result.data.recordedAt)
      updateMapMarker(result.data.latitude, result.data.longitude, true)
    } else {
      latestLocation.value = null
      isOnlineMap.value[id] = false
      if (marker) {
        map?.removeLayer(marker)
        marker = null
      }
    }
  } catch (error) {
    console.error('获取最新位置失败', error)
  }
}

const fetchHistory = async () => {
  if (!selectedPetId.value) return
  
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/location/${selectedPetId.value}/history?hours=${historyHours.value}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const result = await response.json()
    if (result.code === 200 && result.data) {
      drawHistoryPolyline(result.data)
    }
  } catch (error) {
    console.error('获取历史轨迹失败', error)
  }
}

// ============ 地图操作 ============
const initMap = () => {
  // 初始化在昆明
  map = L.map('leaflet-map').setView([25.0389, 102.7183], 13)
  
  // 使用 OpenStreetMap 图层
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)
}

// 自定义宠物图标
const createPetIcon = () => {
  return L.divIcon({
    className: 'custom-pet-marker',
    html: '<div style="background-color: #00a8e8; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 20px;">🐾</div>',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  })
}

const updateMapMarker = (lat: number, lng: number, recenter: boolean = false) => {
  if (!map) return
  
  if (!marker) {
    marker = L.marker([lat, lng], { icon: createPetIcon() }).addTo(map)
  } else {
    marker.setLatLng([lat, lng])
  }
  
  if (recenter) {
    map.setView([lat, lng], 16)
  }
}

const drawHistoryPolyline = (history: any[]) => {
  if (!map) return
  
  // 清除旧轨迹
  if (polyline) {
    map.removeLayer(polyline)
  }
  
  if (history.length === 0) return
  
  const latlngs = history.map(loc => [loc.latitude, loc.longitude] as [number, number])
  
  polyline = L.polyline(latlngs, {
    color: '#00a8e8',
    weight: 4,
    opacity: 0.7,
    dashArray: '10, 10' // 虚线效果
  }).addTo(map)
  
  // 调整地图视野以包含整个轨迹
  map.fitBounds(polyline.getBounds(), { padding: [50, 50] })
}

// ============ WebSocket STOMP ============
const initWebSocket = () => {
  stompClient = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000
  })

  stompClient.onConnect = (frame) => {
    console.log('WebSocket 连接成功')
    Message.success('已连接至实时定位服务器')
    // 如果已经选中了宠物，重新订阅
    if (selectedPetId.value) {
      subscribeToPet(selectedPetId.value)
    }
  }

  stompClient.onStompError = (frame) => {
    console.error('Broker reported error: ' + frame.headers['message'])
  }

  stompClient.activate()
}

const subscribeToPet = (petId: number) => {
  if (!stompClient || !stompClient.connected) return

  // 取消旧的订阅
  if (currentSubscription) {
    currentSubscription.unsubscribe()
  }

  const topic = `/topic/pet/${petId}/location`
  console.log(`订阅 Topic: ${topic}`)
  
  currentSubscription = stompClient.subscribe(topic, (message) => {
    const loc = JSON.parse(message.body)
    console.log('收到实时位置:', loc)
    
    // 标记为在线
    isOnlineMap.value[petId] = true
    
    // 只有当前选中的宠物才更新视图
    if (selectedPetId.value === petId) {
      latestLocation.value = loc
      updateMapMarker(loc.latitude, loc.longitude, false) // 收到实时点不强行将地图居中，以免干扰用户拖拽看地图
      
      // 实时追加轨迹点
      if (polyline) {
        polyline.addLatLng([loc.latitude, loc.longitude])
      }
    }
    
    // 30秒没收到数据判定为离线
    clearTimeout((window as any)[`timeout_${petId}`])
    ;(window as any)[`timeout_${petId}`] = setTimeout(() => {
      isOnlineMap.value[petId] = false
    }, 30000)
  })
}

// ============ 辅助方法 ============
const isPetOnline = (petId: number) => {
  return !!isOnlineMap.value[petId]
}

const isRecentlyUpdated = (isoString: string) => {
  if (!isoString) return false
  return Date.now() - new Date(isoString).getTime() <= 30000
}

const formatTime = (isoString: string) => {
  if (!isoString) return '-'
  const date = new Date(isoString)
  return date.toLocaleTimeString('zh-CN', { hour12: false })
}
</script>

<style scoped>
.location-container {
  display: flex;
  height: calc(100vh - 75px); /* 减去顶部导航栏高度 */
  background-color: #f8fafc;
}

/* ============ 左侧侧边栏 ============ */
.sidebar {
  width: 320px;
  background: white;
  box-shadow: 2px 0 10px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.sidebar-header {
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
}

.sidebar-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
  text-align: left;
}

.sidebar-header .subtitle {
  color: #64748b;
  margin: 0;
  font-size: 0.9rem;
  text-align: left;
}

.pet-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.pet-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pet-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.pet-card.active {
  border-color: #00a8e8;
  background: #f0f9ff;
}

.pet-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 16px;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.pet-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.pet-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 6px 0;
  width: 100%;
  text-align: left;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-indicator .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #cbd5e1; /* 离线颜色 */
}

.status-indicator.online .dot {
  background-color: #10b981; /* 在线绿色 */
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

.status-indicator .text {
  font-size: 0.85rem;
  color: #64748b;
}

/* ============ 历史轨迹控制 ============ */
.history-controls {
  padding: 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.history-controls h3 {
  font-size: 1rem;
  margin: 0 0 12px 0;
  color: #334155;
}

.history-select {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  margin-bottom: 12px;
  outline: none;
}

.btn {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #00a8e8;
  color: white;
}

.btn-outline {
  background: white;
  color: #00a8e8;
  border: 1px solid #00a8e8;
}

/* ============ 右侧地图 ============ */
.map-area {
  flex: 1;
  position: relative;
  height: 100%;
}

.map-container {
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* ============ 浮层状态 ============ */
.status-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  z-index: 1000;
  display: flex;
  gap: 24px;
}

.overlay-item {
  display: flex;
  flex-direction: column;
}

.overlay-item .label {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 4px;
}

.overlay-item .value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
}

/* ============ 空状态 ============ */
.empty-map {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-content {
  text-align: center;
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.05);
}

.empty-content .icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-content h2 {
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 8px;
}

.empty-content p {
  color: #64748b;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 16px;
}
</style>
