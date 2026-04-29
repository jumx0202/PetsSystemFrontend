<template>
  <div class="profile-page">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div class="section-box info-box">
      <div class="header-section">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <img :src="user.avatar || '/default-avatar.png'" alt="头像" class="avatar" @error="handleAvatarError" />
        <div class="user-info">
          <h1 class="username">{{ user.username || '未登录用户' }}</h1>
          <p class="phone">{{ user.phone }}</p>
          <div class="stats">
            <span>关注 {{ user.followingCount }} 人</span>
            <span class="divider">|</span>
            <span>粉丝 {{ user.followersCount }} 人</span>
          </div>
          <p class="bio">{{ user.bio || '这个人很懒，什么都没有写~' }}</p>
        </div>
      </div>
    </div>

    <div class="section-box posts-box">
      <div class="stats-cards">
        <button class="stat-card" :class="{ active: activeTab === 'publish' }" @click="activeTab = 'publish'">
          <div class="number">{{ user.postCount }}</div>
          <div class="label">发布</div>
        </button>
        <button class="stat-card" :class="{ active: activeTab === 'favorite' }" @click="activeTab = 'favorite'">
          <div class="number">{{ favorites.length }}</div>
          <div class="label">收藏</div>
        </button>
        <div class="stat-card" @click="router.push('/pet-profile')">
          <div class="number">{{ user.petCount }}</div>
          <div class="label">我的宠物</div>
        </div>
      </div>
    </div>

    <div class="section-box list-box">
      <h2 class="list-title">{{ activeTab === 'publish' ? '我的发布' : '我的收藏' }}</h2>
      <p v-if="activeList.length === 0" class="empty-text">
        {{ activeTab === 'publish' ? '暂无发布帖子。' : '暂无收藏帖子。' }}
      </p>
      <ul v-else class="item-list">
        <li v-for="item in activeList" :key="`${activeTab}-${item.kind}-${item.id}`" class="item-row">
          <button class="item-main" @click="openPreview(item)">
            <img :src="item.image" alt="帖子图片" class="item-cover" @error="handleImageError" />
            <div class="item-meta">
              <span class="item-tag" :class="getKindTagClass(item.kind)">
                {{ getKindLabel(item.kind) }}
              </span>
              <div class="item-name">{{ item.title }}</div>
              <div class="item-sub">{{ item.subtitle }}</div>
            </div>
          </button>
          <button v-if="activeTab === 'favorite'" class="remove-btn" @click="removeOne(item)">取消收藏</button>
          <div v-else class="publish-actions">
            <button class="edit-btn" @click="editPost(item)">编辑</button>
            <button class="delete-btn" @click="deletePost(item)">删除</button>
          </div>
        </li>
      </ul>
    </div>

    <div class="section-box logout-box">
      <button class="logout-btn" @click="logout">退出登录</button>
    </div>

    <!-- 收藏预览弹窗 -->
    <div v-if="showPreview && selected" class="modal-overlay" @click="closePreview">
      <div class="modal-panel" @click.stop>
        <!-- 论坛帖子预览 -->
        <div v-if="selected.kind === 'forum'" class="forum-preview">
          <div class="forum-preview-header">
            <div class="forum-avatar">{{ (selected.detail as any)?.author?.[0] || '我' }}</div>
            <div class="forum-meta">
              <div class="forum-author">{{ (selected.detail as any)?.author || '我' }}</div>
              <div class="forum-time">{{ formatForumTime((selected.detail as any)?.createTime) }}</div>
            </div>
          </div>
          <div class="forum-preview-content">
            <p class="forum-text">{{ (selected.detail as any)?.content || selected.title }}</p>
            <div v-if="Array.isArray((selected.detail as any)?.images) && (selected.detail as any).images.length" class="forum-images">
              <img
                v-for="(img, idx) in (selected.detail as any).images"
                :key="idx"
                :src="img"
                @error="handleImageError"
                alt="forum image"
              />
            </div>
          </div>
        </div>

        <div v-else class="pet-card-wrapper" :class="selected.kind === 'adoption' ? 'adoption-card' : 'lost-card'">
          <div class="pet-card-flipper" :class="{ flipped: flipped }">
            <!-- 正面 -->
            <div class="pet-card-front">
              <div class="pet-image-wrapper">
                <img :src="selected.image" class="pet-image" @error="handleImageError" />
              </div>

              <!-- 领养卡片正面信息 -->
              <div v-if="selected.kind === 'adoption'" class="pet-info">
                <div class="info-row1 user-favorite-row">
                  <div class="poster-user">
                    <img :src="detail.posterAvatar || defaultAvatar" class="poster-avatar" @error="handleAvatarError" />
                  </div>
                  <div class="favorite-count">
                    <button class="favorite-btn favorited" type="button" @click.stop>★</button>
                    <span>{{ detail.favoriteCount ?? 0 }}</span>
                  </div>
                </div>
                <div class="info-row1 gender-breed-row">
                  <div class="gender-row">
                    <span class="gender-icon" :class="getGenderClass(detail.gender)">
                      {{ getGenderIcon(detail.gender) }}
                    </span>
                    <span class="gender-text">{{ detail.gender || '不详' }}</span>
                  </div>
                  <div class="breed-row">
                    <span class="breed-label">{{ detail.breed || selected.title }}</span>
                  </div>
                </div>
                <div v-if="detail.description" class="info-row1 description-row" @click="flipCard">
                  <span class="description-text">{{ detail.description }}</span>
                </div>
                <div class="info-row1 location-contact-row">
                  <div class="location">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{{ detail.city || '' }}{{ detail.district || '' }}</span>
                  </div>
                  <button class="contact-btn" type="button" @click.stop="showContactFromDetail">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 寻宠卡片正面信息 -->
              <div v-else class="pet-info" @click="flipCard">
                <div class="info-row2 user-favorite-row">
                  <div class="poster-user">
                    <img :src="detail.posterAvatar || defaultAvatar" class="poster-avatar" @error="handleAvatarError" />
                  </div>
                  <div class="favorite-count">
                    <button class="favorite-btn favorited" type="button" @click.stop>★</button>
                    <span>{{ detail.favoriteCount ?? 0 }}</span>
                  </div>
                </div>
                <div class="info-row2 split-row">
                  <div class="left-cell">
                    <span class="gender-icon" :class="getGenderClass(detail.gender)">
                      {{ getGenderIcon(detail.gender) }}
                    </span>
                    <span class="gender-text">{{ detail.gender || '不详' }}</span>
                  </div>
                  <div class="right-cell"><span class="breed-label">{{ detail.breed || selected.title }}</span></div>
                </div>
                <div class="info-row2 split-row">
                  <div class="left-cell"><span class="inline-label">走失时间</span><span class="inline-value">{{ detail.lostTime || '' }}</span></div>
                  <div class="right-cell"><span class="inline-label">宠物姓名</span><span class="inline-value">{{ detail.petName || '' }}</span></div>
                </div>
                <div class="info-row2 split-row">
                  <div class="left-cell location-cell">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span class="inline-value">{{ detail.city || '' }}{{ detail.district || '' }}</span>
                  </div>
                  <div class="right-cell">
                    <button class="phone-icon-btn" type="button" @click.stop="showContactFromDetail">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 背面 -->
            <div class="pet-card-back" @click="flipCard">
              <div v-if="selected.kind === 'adoption'" class="pet-image-wrapper">
                <img :src="selected.image" class="pet-image" @error="handleImageError" />
              </div>
              <div class="back-description-section">
                <p class="back-description-text">{{ backDescription }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 联系方式弹窗 -->
    <div v-if="showContactModal && contactDetail" class="modal-overlay" @click="closeContactModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeContactModal">×</button>
        <div class="modal-header">
          <div class="modal-pet-avatar">
            <img :src="selected?.image" @error="handleImageError" />
          </div>
          <h3 class="modal-title">联系</h3>
        </div>
        <div class="modal-body">
          <div class="contact-item">
            <div class="contact-label">联系人</div>
            <div class="contact-value">{{ contactDetail.contactName }}</div>
          </div>
          
          <div class="contact-item">
            <div class="contact-label">联系电话</div>
            <div class="contact-value copyable" @click="copyToClipboard(contactDetail.contactPhone, '电话号码')">
              <span class="phone-text">{{ contactDetail.contactPhone }}</span>
              <button class="copy-icon-btn" title="复制电话号码">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="contact-item" v-if="contactDetail.contactWechat">
            <div class="contact-label">微信号</div>
            <div class="contact-value copyable wechat" @click="copyToClipboard(contactDetail.contactWechat, '微信号')">
              <span>{{ contactDetail.contactWechat }}</span>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
// @ts-ignore
import request from '../api/request.js'
import { listFavorites, removeFavorite, type StoredFavorite } from '../utils/favorites'
import { listForumPosts, removeForumPost } from '../utils/forumPosts'

const router = useRouter()
const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=profile'

const loading = ref(true)
type PostKind = 'adoption' | 'lost' | 'forum'
interface DisplayPost extends StoredFavorite {
  kind: PostKind
  raw?: any
}
const user = ref({
  id: null as number | null,
  username: '',
  phone: '',
  avatar: '',
  bio: '',
  followingCount: 0,
  followersCount: 0,
  postCount: 0,
  favoriteCount: 0,
  petCount: 0
})
const favorites = ref<StoredFavorite[]>([])
const myPosts = ref<DisplayPost[]>([])
const activeTab = ref<'publish' | 'favorite'>('publish')
const showPreview = ref(false)
const selected = ref<StoredFavorite | null>(null)
const flipped = ref(false)
const showContactModal = ref(false)
const activeList = computed<StoredFavorite[]>(() => {
  return activeTab.value === 'publish' ? myPosts.value : favorites.value
})

// 统一从 detail 读取，提供默认值
const detail = computed(() => {
  return (selected.value?.detail ?? {}) as Record<string, any>
})

const backDescription = computed(() => {
  return detail.value.description || selected.value?.subtitle || '暂无描述'
})

// 联系方式详情
const contactDetail = computed(() => {
  if (!detail.value.contactName) return null
  return {
    contactName: detail.value.contactName,
    contactPhone: detail.value.contactPhone,
    contactWechat: detail.value.contactWechat
  }
})

const goBack = () => router.back()
const refreshFavorites = () => {
  favorites.value = listFavorites()
}

const getKindLabel = (kind: StoredFavorite['kind']) => {
  if (kind === 'adoption') return '领养'
  if (kind === 'lost') return '寻宠'
  return '论坛'
}
const getKindTagClass = (kind: StoredFavorite['kind']) => {
  if (kind === 'adoption') return 'tag-adoption'
  if (kind === 'lost') return 'tag-lost'
  return 'tag-forum'
}

const formatForumTime = (timestamp?: number) => {
  if (!timestamp) return ''
  const now = Date.now()
  const diff = now - timestamp
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const toDisplayPost = (kind: PostKind, item: any): DisplayPost => {
  const fallbackTitle = kind === 'adoption'
    ? (item?.breed || '领养帖子')
    : `${item?.petName || '寻宠'}（${item?.breed || '未知品种'}）`
  const fallbackSubtitle = kind === 'adoption'
    ? `${item?.city || ''}${item?.district || ''}`
    : `${item?.city || ''} · ${item?.lostTime || ''}`
  return {
    kind,
    id: Number(item?.id),
    image: item?.images?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop',
    title: fallbackTitle,
    subtitle: fallbackSubtitle,
    detail: {
      posterAvatar: item?.publisher?.avatar || defaultAvatar,
      favoriteCount: 0,
      favorited: false,
      gender: item?.gender || '不详',
      breed: item?.breed || '',
      description: item?.description || '',
      city: item?.city || '',
      district: item?.district || item?.lostLocation || '',
      contactName: item?.contactName || '',
      contactPhone: item?.contactPhone || '',
      contactWechat: item?.contactWechat || '',
      lostTime: item?.lostTime || '',
      petName: item?.petName || ''
    },
    raw: item
  }
}

const fetchMyPosts = async () => {
  try {
    const [adoptionRes, lostRes] = await Promise.all([
      request.get('/api/adoption/my-posts'),
      request.get('/api/lost/my-posts')
    ])
    const adoptionList = Array.isArray(adoptionRes?.data) ? adoptionRes.data : []
    const lostList = Array.isArray(lostRes?.data) ? lostRes.data : []
    myPosts.value = [
      ...adoptionList.map((item: any) => toDisplayPost('adoption', item)),
      ...lostList.map((item: any) => toDisplayPost('lost', item))
    ]
    user.value.postCount = myPosts.value.length
  } catch (error) {
    console.warn('加载我的发布失败', error)
    myPosts.value = []
  }
}

const mergeMyForumPosts = () => {
  const username = user.value.username || ''
  if (!username) return
  const forum = listForumPosts()
    .filter(p => p.author === username)
    .map((p): DisplayPost => ({
      kind: 'forum',
      id: p.id,
      image: p.images?.[0] || 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&h=400&fit=crop',
      title: p.content?.slice(0, 18) || '论坛帖子',
      subtitle: `论坛 · ${formatForumTime(p.createTime)}`,
      detail: {
        author: p.author,
        authorAvatar: p.authorAvatar,
        content: p.content,
        images: p.images,
        createTime: p.createTime
      },
      raw: p
    }))

  const filtered = myPosts.value.filter(p => p.kind !== 'forum')
  myPosts.value = [...forum, ...filtered]
  user.value.postCount = myPosts.value.length
}
const removeOne = (item: StoredFavorite) => {
  if (!confirm('确定取消收藏吗？')) return
  removeFavorite(item.kind, item.id)
  refreshFavorites()
  // 如果当前正在预览该卡片，关闭预览
  if (selected.value?.kind === item.kind && selected.value?.id === item.id) {
    closePreview()
  }
}

const editPost = (item: StoredFavorite) => {
  const target = item as DisplayPost
  if (target.kind === 'forum') {
    router.push({
      path: '/forum',
      query: { editId: String(target.id) }
    })
    return
  }
  if (target.kind === 'adoption') {
    router.push({
      path: '/PostAdoption',
      query: { mode: 'edit', id: String(target.id) }
    })
    return
  }
  router.push({
    path: '/PostLost',
    query: { mode: 'edit', id: String(target.id) }
  })
}

const deletePost = async (item: StoredFavorite) => {
  const target = item as DisplayPost
  if (target.kind === 'forum') {
    if (!confirm('确定删除该帖子吗？删除后将无法恢复。')) return
    removeForumPost(target.id)
    myPosts.value = myPosts.value.filter(post => !(post.kind === 'forum' && post.id === target.id))
    user.value.postCount = myPosts.value.length
    if (selected.value?.kind === 'forum' && selected.value?.id === target.id) closePreview()
    alert('删除成功')
    return
  }
  if (!confirm('确定删除该帖子吗？删除后将无法恢复。')) return
  try {
    const url = target.kind === 'adoption'
      ? `/api/adoption/${target.id}`
      : `/api/lost/${target.id}`
    const res = await request.delete(url)
    if (res?.code !== 200) {
      alert(res?.message || '删除失败，请稍后再试')
      return
    }
    myPosts.value = myPosts.value.filter(post => !(post.kind === target.kind && post.id === target.id))
    user.value.postCount = myPosts.value.length
    if (selected.value?.kind === target.kind && selected.value?.id === target.id) {
      closePreview()
    }
    alert('删除成功')
  } catch (error) {
    console.error('删除帖子失败', error)
    alert('删除失败，请检查网络或登录状态')
  }
}
const openPreview = (item: StoredFavorite) => {
  selected.value = item
  flipped.value = false
  showPreview.value = true
}
const closePreview = () => {
  showPreview.value = false
  selected.value = null
  flipped.value = false
}
const flipCard = () => {
  flipped.value = !flipped.value
}
const getGenderIcon = (gender?: string) => {
  if (gender === '公') return '♂'
  if (gender === '母') return '♀'
  return '?'
}
const getGenderClass = (gender?: string) => {
  if (gender === '公') return 'male'
  if (gender === '母') return 'female'
  return 'unknown'
}

// 从详情中显示联系方式弹窗
const showContactFromDetail = () => {
  if (!contactDetail.value) {
    alert('暂无联系方式')
    return
  }
  showContactModal.value = true
}

const closeContactModal = () => {
  showContactModal.value = false
}

const copyToClipboard = (text: string | undefined, label: string) => {
  if (!text) return
  navigator.clipboard.writeText(text)
  alert(`${label}已复制到剪贴板：${text}`)
}

const fetchUserInfo = async () => {
  try {
    loading.value = true
    const res = await request.get('/api/user/info')
    if (res.code === 200 && res.data) {
      user.value = { ...user.value, ...res.data }
    } else if (res.code === 401 || (res.message && res.message.includes('未登录'))) {
      handleUnauthorized()
    }
  } catch (err: any) {
    if (err.response?.status === 401) handleUnauthorized()
  } finally {
    loading.value = false
  }
}

const handleUnauthorized = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  alert('登录已过期，请重新登录')
  router.replace('/')
}

const handleAvatarError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = defaultAvatar
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop'
}

const logout = () => {
  if (!confirm('确定要退出登录吗？')) return
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  router.replace('/')
}

onMounted(() => {
  let token = localStorage.getItem('token')
  if (!token) {
    const rawUserInfo = localStorage.getItem('userInfo')
    if (rawUserInfo) {
      try {
        const parsedUser = JSON.parse(rawUserInfo)
        token = parsedUser?.token || ''
        if (token) localStorage.setItem('token', token)
      } catch {}
    }
  }
  if (!token) {
    alert('请先登录')
    router.replace('/')
    return
  }
  refreshFavorites()
  ;(async () => {
    await fetchUserInfo()
    await fetchMyPosts()
    mergeMyForumPosts()
  })()
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
  margin-right: 10px; 
}

.header-section { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  padding: 6px 2px; 
  color: black; 
  text-align: left;
}

.avatar { 
  width: 80px; 
  height: 80px; 
  border-radius: 50%; 
  border: 3px solid white; 
  object-fit: cover; 
  flex-shrink: 0; 
}

.user-info { 
  display: flex; 
  flex-direction: column; 
  align-items: flex-start;
  gap: 8px; 
  flex: 1; 
  min-width: 0; 
  text-align: left;
}

.username { 
  font-size: 24px; 
  font-weight: bold; 
  margin: 0; 
  word-break: break-all; 
  width: 100%;
  text-align: left;
}

.phone { 
  font-size: 14px; 
  opacity: 0.9; 
  margin: 0; 
  width: 100%;
  text-align: left;
}

.stats { 
  font-size: 14px; 
  opacity: 0.9; 
  width: 100%;
  text-align: left;
}

.divider { 
  margin: 0 10px;
}

.bio { 
  font-size: 14px; 
  opacity: 0.8; 
  margin: 0; 
  word-break: break-all; 
  width: 100%;
  text-align: left;
}

.stats-cards { 
  display: flex; 
  gap: 15px; 
  width: 100%; 
}

.stat-card { 
  flex: 1; 
  width: 100%;
  background: white; 
  padding: 20px; 
  border-radius: 12px; 
  text-align: center; 
  box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
  cursor: pointer; 
  border: 1px solid transparent;
  appearance: none;
  outline: none;
}

.stat-card.active {
  border-color: #00a8e8;
  box-shadow: 0 2px 10px rgba(0, 168, 232, 0.2);
}

.number { 
  font-size: 24px; 
  font-weight: bold; 
  color: #00c853; 
}

.label { 
  font-size: 14px; 
  color: #666; 
  margin-top: 5px; 
}

.list-box { 
  width: 100%; 
}

.list-title { 
  margin: 0 0 12px; 
  font-size: 18px; 
  color: #333; 
}

.empty-text { 
  margin: 0; 
  color: #666; 
  line-height: 1.6; 
}

.item-list { 
  list-style: none; 
  margin: 0; 
  padding: 0; 
  display: flex; 
  flex-direction: column; 
  gap: 10px; 
}

.item-row { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  padding: 10px;
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
  border: none; 
  background: transparent; 
  cursor: pointer; 
  text-align: left; 
}

.item-cover { 
  width: 56px; 
  height: 56px; 
  border-radius: 10px; 
  object-fit: cover; 
  flex-shrink: 0; 
}

.item-meta { 
  min-width: 0; 
  display: flex; 
  flex-direction: column; 
  gap: 4px; 
  text-align: left; 
}

.item-tag { 
  align-self: flex-start; 
  font-size: 11px; 
  font-weight: 600; 
  padding: 2px 8px; 
  border-radius: 6px; 
}

.tag-adoption { 
  background: #e8f5e9; 
  color: #2e7d32; 
}

.tag-lost { 
  background: #fff3e0; 
  color: #ef6c00; 
}

.tag-forum {
  background: #ede7f6;
  color: #5e35b1;
}

.forum-preview {
  width: 360px;
  max-width: calc(100vw - 24px);
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.forum-preview-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.forum-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #7e57c2;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.forum-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.forum-author {
  font-weight: 700;
  color: #333;
  font-size: 14px;
}

.forum-time {
  font-size: 12px;
  color: #999;
}

.forum-preview-content {
  text-align: left;
}

.forum-text {
  margin: 0 0 10px 0;
  color: #333;
  line-height: 1.6;
  white-space: pre-wrap;
}

.forum-images {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.forum-images img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 10px;
}

.item-name { 
  font-size: 15px; 
  font-weight: 600; 
  overflow: hidden; 
  text-overflow: ellipsis;
   white-space: nowrap; 
}

.item-sub { 
  font-size: 12px; 
  color: #888; 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
}

.remove-btn { 
  border: none; 
  border-radius: 8px; 
  padding: 8px 12px; 
  font-size: 13px; 
  color: #555; 
  background: #eee; 
  cursor: pointer; 
  transition: all 0.2s; 
}

.remove-btn:hover { 
  background: #ffebee; 
  color: #c62828; 
}

.publish-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-btn,
.delete-btn {
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn {
  color: #1e88e5;
  background: #e3f2fd;
}

.edit-btn:hover {
  background: #bbdefb;
}

.delete-btn {
  color: #c62828;
  background: #ffebee;
}

.delete-btn:hover {
  background: #ffcdd2;
}

.logout-btn { 
  width: 100%; 
  padding: 15px; 
  background: #ffebee; 
  color: #c62828; 
  border: none; 
  border-radius: 12px; 
  cursor: pointer; 
  font-size: 16px; 
  transition: all 0.2s; 
}

.logout-btn:hover { 
  background: #ffcdd2; 
}

.loading-overlay { 
  position: fixed; 
  inset: 0; 
  background: rgba(255,255,255,0.9); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  z-index: 1000; 
  flex-direction: column; 
}

.spinner { 
  width: 40px; 
  height: 40px; 
  border: 4px solid #e0e0e0;
  border-top-color: #00c853; 
  border-radius: 50%; 
  animation: spin 1s linear infinite; 
}

@keyframes spin { 
  to { 
    transform: rotate(360deg); 
  } 
}

.modal-overlay { 
  position: fixed; 
  inset: 0; 
  background: rgba(0,0,0,0.5); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  z-index: 1001; 
}

.modal-panel { 
  width: 360px; 
  max-width: calc(100vw - 24px); 
  background: transparent; 
  padding: 0; 
  position: relative; 
}

.pet-card-wrapper { 
  perspective: 1000px; 
}

.pet-card-wrapper.adoption-card { 
  height: 440px; 
}

.pet-card-wrapper.lost-card { 
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

.pet-card-front, .pet-card-back { 
  position: absolute; 
  width: 100%; 
  height: 100%; 
  backface-visibility: hidden; 
  background: #fff; 
  overflow: hidden; 
  box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
}

.adoption-card .pet-card-front, .adoption-card .pet-card-back { 
  border-radius: 16px; 
}

.lost-card .pet-card-front, .lost-card .pet-card-back { 
  border-radius: 20px; 
}

.pet-card-back { 
  transform: rotateY(180deg); 
  cursor: pointer; 
}

.adoption-card .pet-image-wrapper { 
  width: 100%; 
  height: 240px; 
  overflow: hidden; 
}

.lost-card .pet-image-wrapper {
   width: 100%; 
   height: 240px;
   overflow: hidden; 
}

.pet-image { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
}

.adoption-card .pet-info { 
  padding: 10px; 
  display: flex; 
  flex-direction: column; 
  gap: 10px; 
}

.lost-card .pet-info { 
  padding: 12px; 
  display: flex;
  flex-direction: column; 
  gap: 10px; 
  cursor: pointer; 
}

.info-row1 {
  display: flex;;
  align-items: center;
  gap: 8px;
}

.info-row2 { 
  display: flex; 
  align-items: center; 
  /* justify-content: space-between;  */
  gap: 8px; 
  padding-bottom: 10px; 
}

.info-row1:last-child { 
  border-bottom: none; 
  padding-bottom: 0; 
}

.info-row2:last-child { 
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

.favorite-btn { 
  border: none; 
  background: transparent; 
  color: #ffcc33; 
  cursor: default; 
  font-size: 16px; 
  line-height: 1; 
  padding: 0; 
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

.split-row { 
  justify-content: space-between; 
}

.left-cell, .right-cell { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  min-width: 0; 
}

.right-cell { 
  justify-content: flex-end; 
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

.description-row { 
  cursor: pointer; 
  margin-top: 2px;
  position: relative;
  padding: 2px 0;
  transition: all 0.2s;
  border-radius: 6px;
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
  flex-shrink: 0; 
}

.location-cell svg { 
  color: #00a8e8; 
  flex-shrink: 0; 
}

.contact-btn { 
  width: 36px; 
  height: 36px; 
  border-radius: 50%; 
  border: none; 
  background: #00a8e8; 
  color: #fff; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  cursor: pointer; 
  transition: all 0.2s; 
}

.contact-btn:hover { 
  transform: scale(1.1); 
  background: #0090c9; 
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
  transition: all 0.2s; 
}

.phone-icon-btn:hover { 
  transform: scale(1.1); 
  background: #0090c9; 
}

.back-description-section { 
  height: 100%; 
  padding: 20px; 
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

/* 联系方式弹窗样式 */
.modal-content { 
  background: #fff;
  border-radius: 20px; 
  width: 90%; 
  max-width: 400px;
  padding: 24px; 
  position: relative; 
  box-shadow: 0 20px 60px rgba(0,0,0,0.3); 
  animation: slideUp 0.3s ease; 
}

@keyframes slideUp { 
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  } to { 
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
  box-shadow: 0 4px 12px rgba(0,168,232,0.3); 
}
</style>
