<template>
  <div class="forum-container">
    <!-- 顶部导航 -->
    <header class="forum-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1>📝 社区论坛</h1>
      <div class="header-search">
        <div class="search-wrapper">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索帖子内容"
          />
          <span class="search-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </span>
        </div>
      </div>
    </header>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <main class="posts-feed">
        <div v-if="posts.length === 0" class="empty-state">
          <p>还没有帖子，快来发布第一条吧！</p>
        </div>

        <div 
          v-for="post in filteredPosts" 
          :key="post.id" 
          class="post-card"
          @click="openPostDetail(post)"
        >
          <div class="post-header">
            <div class="avatar">
              <img v-if="post.authorAvatar" :src="post.authorAvatar" alt="avatar" @error="() => (post.authorAvatar = getDefaultAvatar(post.author || 'user'))" />
              <span v-else>{{ post.author[0] }}</span>
            </div>
            <div class="author-info">
              <span class="author-name">{{ post.author }}</span>
              <span class="post-time">{{ formatTime(post.createTime) }}</span>
            </div>
          </div>

          <div class="post-content">
            <p class="post-text">{{ post.content }}</p>
            <div v-if="post.images.length > 0" class="image-grid" :class="`grid-${Math.min(post.images.length, 3)}`">
              <img 
                v-for="(img, index) in post.images.slice(0, 9)" 
                :key="index" 
                :src="img" 
                @click.stop="previewImage(img)"
                alt="post image"
              />
            </div>
          </div>

          <div class="post-actions">
            <button class="action-btn" @click.stop="openPostDetail(post)">
              <span class="icon">💬</span>
              <span>{{ post.comments.length || '评论' }}</span>
            </button>
            <button 
              class="action-btn" 
              :class="{ active: post.isCollected }"
              @click.stop="toggleCollect(post)"
            >
              <span class="icon">{{ post.isCollected ? '⭐' : '☆' }}</span>
              <span>{{ post.isCollected ? '已收藏' : '收藏' }}</span>
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- 发布按钮 -->
    <div class="fab-wrapper">
      <button class="fab-btn" @click="openPublishModal()" title="发布帖子">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>

    <!-- 发布帖子弹窗 -->
    <div v-if="showPublishModal" class="modal-overlay" @click.self="showPublishModal = false">
      <div class="modal publish-modal">
        <h3>{{ isEditMode ? '编辑帖子' : '发布新帖子' }}</h3>
        <textarea 
          v-model="newPost.content" 
          placeholder="分享你的想法..." 
          rows="5"
          maxlength="500"
        ></textarea>
        <div class="char-count">{{ newPost.content.length }}/500</div>
        
        <div class="image-upload-area">
          <div v-for="(img, index) in newPost.images" :key="index" class="preview-item">
            <img :src="img" />
            <button class="remove-img" @click="removeImage(index)">×</button>
          </div>
          <button v-if="newPost.images.length < 9" class="upload-btn" @click="triggerUpload">
            <span>+</span>
            <span>添加图片</span>
          </button>
          <input 
            ref="fileInput" 
            type="file" 
            accept="image/*" 
            multiple 
            style="display: none" 
            @change="handleImageUpload"
          />
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" @click="closePublishModal">取消</button>
          <button class="btn-primary" @click="publishPost" :disabled="!newPost.content.trim()">
            {{ isEditMode ? '保存' : '发布' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 帖子详情弹窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal detail-modal">
        <button class="close-btn" @click="showDetailModal = false">×</button>
        
        <div class="detail-header">
          <div class="avatar">
            <img v-if="currentPost.authorAvatar" :src="currentPost.authorAvatar" alt="avatar" @error="() => (currentPost.authorAvatar = getDefaultAvatar(currentPost.author || 'user'))" />
            <span v-else>{{ currentPost.author[0] }}</span>
          </div>
          <div class="author-info">
            <span class="author-name">{{ currentPost.author }}</span>
            <span class="post-time">{{ formatTime(currentPost.createTime) }}</span>
          </div>
        </div>

        <div class="detail-content">
          <p>{{ currentPost.content }}</p>
          <div v-if="currentPost.images.length > 0" class="detail-images">
            <img 
              v-for="(img, index) in currentPost.images" 
              :key="index" 
              :src="img" 
              @click="previewImage(img)"
            />
          </div>
        </div>

        <div class="detail-actions">
          <button 
            class="action-btn" 
            :class="{ active: currentPost.isCollected }"
            @click="toggleCollect(currentPost)"
          >
            <span>{{ currentPost.isCollected ? '⭐' : '☆' }}</span>
            <span>{{ currentPost.isCollected ? '已收藏' : '收藏' }}</span>
          </button>
        </div>

        <!-- 评论区 -->
        <div class="comments-section">
          <h4>评论 ({{ currentPost.comments.length }})</h4>
          
          <div class="comment-input-area">
            <div v-if="replyingToComment" class="replying-tip">
              正在回复 @{{ replyingToComment.author }}
            </div>
            <div class="comment-input-row">
              <input 
                v-model="newComment" 
                :placeholder="replyingToComment ? `回复 @${replyingToComment.author}` : '写下你的评论...'"
                @keyup.enter="submitComment"
              />
              <button @click="submitComment" :disabled="!newComment.trim()">发送</button>
              <button v-if="replyingToComment" class="cancel-reply-btn" @click="cancelReply">取消</button>
            </div>
          </div>

          <div class="comments-list">
            <div
              v-for="comment in currentPost.comments"
              :key="comment.id"
              class="comment-item"
              :class="{ reply: !!comment.parentId }"
            >
              <div class="comment-avatar">
                <img
                  v-if="comment.authorAvatar"
                  :src="comment.authorAvatar"
                  alt="comment avatar"
                  @error="() => (comment.authorAvatar = getDefaultAvatar(comment.author || 'user'))"
                />
                <span v-else>{{ comment.author[0] }}</span>
              </div>
              <div class="comment-body">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.author }}</span>
                  <span class="comment-time">{{ formatTime(comment.time) }}</span>
                </div>
                <p class="comment-text">
                  <span v-if="comment.replyTo" class="reply-to">回复 @{{ comment.replyTo }}：</span>
                  {{ comment.content }}
                </p>
                <div class="comment-actions">
                  <button class="reply-btn" @click="startReply(comment)">回复</button>
                  <button
                    v-if="canDeleteComment(comment)"
                    class="delete-reply-btn"
                    @click="deleteComment(comment)"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览 -->
    <div v-if="previewImageUrl" class="image-preview-overlay" @click.self="previewImageUrl = null">
      <img :src="previewImageUrl" class="preview-large" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { isFavorite, upsertFavorite, removeFavorite } from '../utils/favorites'
import { listForumPosts, prependForumPost, updateForumPost, type ForumPostStored } from '../utils/forumPosts'

const router = useRouter()
const route = useRoute()

interface Comment {
  id: number
  author: string
  authorAvatar?: string
  content: string
  time: number
  parentId?: number
  replyTo?: string
}

interface Post {
  id: number
  author: string
  authorAvatar?: string
  content: string
  images: string[]
  comments: Comment[]
  createTime: number
  isCollected: boolean
}

const FAVORITE_KIND = 'forum' as const

const getDefaultAvatar = (seed: string): string =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`

const getCurrentUsername = (): string => {
  try {
    const raw = localStorage.getItem('userInfo')
    if (!raw) return '我'
    const parsed = JSON.parse(raw)
    return parsed?.username || parsed?.name || '我'
  } catch {
    return '我'
  }
}

const getCurrentUserAvatar = (): string => {
  try {
    const raw = localStorage.getItem('userInfo')
    if (!raw) return ''
    const parsed = JSON.parse(raw)
    return parsed?.avatar || ''
  } catch {
    return ''
  }
}

const resolveAuthorAvatar = (author: string, avatar?: string): string => {
  if (avatar) return avatar
  const currentName = getCurrentUsername()
  if (author === currentName) {
    const currentAvatar = getCurrentUserAvatar()
    if (currentAvatar) return currentAvatar
  }
  return getDefaultAvatar(author || 'user')
}

const posts = ref<Post[]>([
  {
    id: 1,
    author: '小明',
    authorAvatar: getDefaultAvatar('小明'),
    content: '今天天气真好，出去散步看到了很美的风景！分享给大家～',
    images: [
      'https://picsum.photos/400/400?random=1',
      'https://picsum.photos/400/400?random=2'
    ],
    comments: [
      { id: 1, author: '小红', content: '确实很美！', time: Date.now() - 3600000 }
    ],
    createTime: Date.now() - 7200000,
    isCollected: false
  },
  {
    id: 2,
    author: '旅行达人',
    authorAvatar: getDefaultAvatar('旅行达人'),
    content: '分享一个超棒的旅行攻略，三天两夜玩转大理！第一天...',
    images: [
      'https://picsum.photos/400/400?random=3',
      'https://picsum.photos/400/400?random=4',
      'https://picsum.photos/400/400?random=5'
    ],
    comments: [],
    createTime: Date.now() - 86400000,
    isCollected: true
  }
])

const showPublishModal = ref(false)
const showDetailModal = ref(false)
const previewImageUrl = ref<string | null>(null)
const currentPost = ref<Post>({} as Post)
const newComment = ref('')
const replyingToComment = ref<Comment | null>(null)
const searchKeyword = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const isEditMode = ref(false)
const editingId = ref<number | null>(null)

const newPost = reactive({
  content: '',
  images: [] as string[]
})

const goBack = () => {
  router.back()
}

const filteredPosts = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return posts.value
  return posts.value.filter(post =>
    (post.content || '').toLowerCase().includes(keyword)
  )
})

const formatTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const toggleCollect = (post: Post) => {
  const next = !post.isCollected
  post.isCollected = next
  if (next) {
    upsertFavorite({
      kind: FAVORITE_KIND,
      id: post.id,
      image: post.images?.[0] || 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&h=400&fit=crop',
      title: post.content?.slice(0, 18) || '论坛帖子',
      subtitle: `${post.author} · ${formatTime(post.createTime)}`,
      detail: {
        author: post.author,
        authorAvatar: post.authorAvatar,
        content: post.content,
        images: post.images,
        createTime: post.createTime
      }
    })
  } else {
    removeFavorite(FAVORITE_KIND, post.id)
  }
}

const openPublishModal = (post?: Post) => {
  if (post) {
    isEditMode.value = true
    editingId.value = post.id
    newPost.content = post.content || ''
    newPost.images = [...(post.images || [])]
  } else {
    isEditMode.value = false
    editingId.value = null
    newPost.content = ''
    newPost.images = []
  }
  showPublishModal.value = true
}

const closePublishModal = () => {
  showPublishModal.value = false
  isEditMode.value = false
  editingId.value = null
  newPost.content = ''
  newPost.images = []
}

const openPostDetail = (post: Post) => {
  currentPost.value = post
  showDetailModal.value = true
  newComment.value = ''
  replyingToComment.value = null
}

const publishPost = () => {
  if (!newPost.content.trim()) return

  const author = getCurrentUsername()
  const authorAvatar = resolveAuthorAvatar(author, getCurrentUserAvatar())

  if (isEditMode.value && editingId.value) {
    const id = editingId.value
    const idx = posts.value.findIndex(p => p.id === id)
    if (idx >= 0) {
      const old = posts.value[idx]
      if (!old) {
        closePublishModal()
        return
      }
      const next: Post = {
        ...old,
        author,
        authorAvatar: resolveAuthorAvatar(author, authorAvatar),
        content: newPost.content,
        images: [...newPost.images]
      }
      posts.value[idx] = next
      updateForumPost({
        id: next.id,
        author: next.author,
        authorAvatar: next.authorAvatar,
        content: next.content,
        images: next.images,
        comments: next.comments,
        createTime: next.createTime
      })

      if (isFavorite(FAVORITE_KIND, next.id)) {
        upsertFavorite({
          kind: FAVORITE_KIND,
          id: next.id,
          image: next.images?.[0] || 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&h=400&fit=crop',
          title: next.content?.slice(0, 18) || '论坛帖子',
          subtitle: `${next.author} · ${formatTime(next.createTime)}`,
          detail: {
            author: next.author,
            authorAvatar: next.authorAvatar,
            content: next.content,
            images: next.images,
            createTime: next.createTime
          }
        })
      }
      if (currentPost.value?.id === next.id) currentPost.value = next
    }

    closePublishModal()
    router.replace({ path: route.path, query: {} })
    return
  }

  const post: Post = {
    id: Date.now(),
    author,
    authorAvatar: resolveAuthorAvatar(author, authorAvatar),
    content: newPost.content,
    images: [...newPost.images],
    comments: [],
    createTime: Date.now(),
    isCollected: false
  }

  posts.value.unshift(post)
  prependForumPost({
    id: post.id,
    author: post.author,
    authorAvatar: post.authorAvatar,
    content: post.content,
    images: post.images,
    comments: post.comments,
    createTime: post.createTime
  })
  closePublishModal()
}

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleImageUpload = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  
  Array.from(files).forEach(() => {
    if (newPost.images.length >= 9) return
    const randomId = Math.floor(Math.random() * 1000)
    newPost.images.push(`https://picsum.photos/400/400?random=${randomId}`)
  })
}

const removeImage = (index: number) => {
  newPost.images.splice(index, 1)
}

const submitComment = () => {
  const activePost = currentPost.value
  if (!newComment.value.trim() || !activePost) return
  const author = getCurrentUsername()
  const comment: Comment = {
    id: Date.now(),
    author,
    authorAvatar: resolveAuthorAvatar(author, getCurrentUserAvatar()),
    content: newComment.value.trim(),
    time: Date.now(),
    parentId: replyingToComment.value?.id,
    replyTo: replyingToComment.value?.author
  }
  activePost.comments.push(comment)
  const idx = posts.value.findIndex(p => p.id === activePost.id)
  if (idx >= 0 && Array.isArray(activePost.comments)) {
    const targetPost = posts.value[idx]
    if (!targetPost) return
    targetPost.comments = [...activePost.comments]
    syncPostToStorage(targetPost)
  }
  newComment.value = ''
  replyingToComment.value = null
}

const startReply = (comment: Comment) => {
  replyingToComment.value = comment
}

const cancelReply = () => {
  replyingToComment.value = null
  newComment.value = ''
}

const canDeleteComment = (comment: Comment): boolean => {
  return comment.author === getCurrentUsername()
}

const syncPostToStorage = (post: Post) => {
  const payload: ForumPostStored = {
    id: post.id,
    author: post.author,
    authorAvatar: post.authorAvatar,
    content: post.content,
    images: [...post.images],
    comments: post.comments.map(c => ({
      id: c.id,
      author: c.author,
      authorAvatar: c.authorAvatar,
      content: c.content,
      time: c.time,
      parentId: c.parentId,
      replyTo: c.replyTo
    })),
    createTime: post.createTime
  }
  updateForumPost(payload)
}

const deleteComment = (target: Comment) => {
  const activePost = currentPost.value
  if (!activePost?.comments || !canDeleteComment(target)) return
  if (!window.confirm('确认删除这条回复吗？')) return
  activePost.comments = activePost.comments.filter(c => c.id !== target.id)
  const idx = posts.value.findIndex(p => p.id === activePost.id)
  if (idx >= 0) {
    const targetPost = posts.value[idx]
    if (!targetPost) return
    targetPost.comments = [...activePost.comments]
    syncPostToStorage(targetPost)
  }
}

const previewImage = (url: string) => {
  previewImageUrl.value = url
}

const hydrateCollectState = () => {
  posts.value.forEach(p => {
    p.isCollected = isFavorite(FAVORITE_KIND, p.id)
  })
}

onMounted(() => {
  const stored = listForumPosts()
  if (stored.length > 0) {
    const merged = new Map<number, Post>()
    posts.value.forEach(p => merged.set(p.id, p))
    stored.forEach(p => {
      merged.set(p.id, {
        id: p.id,
        author: p.author,
        authorAvatar: resolveAuthorAvatar(p.author, p.authorAvatar),
        content: p.content,
        images: p.images || [],
        comments: (p.comments || []).map(c => ({
          id: c.id,
          author: c.author,
          authorAvatar: resolveAuthorAvatar(c.author, c.authorAvatar),
          content: c.content,
          time: c.time,
          parentId: c.parentId,
          replyTo: c.replyTo
        })),
        createTime: p.createTime,
        isCollected: false
      })
    })
    posts.value = Array.from(merged.values()).sort((a, b) => b.createTime - a.createTime)
  }
  posts.value = posts.value.map(p => ({
    ...p,
    authorAvatar: resolveAuthorAvatar(p.author, p.authorAvatar)
  }))
  hydrateCollectState()

  const q = route.query?.editId
  const editId = typeof q === 'string' ? Number(q) : Array.isArray(q) ? Number(q[0]) : NaN
  if (!Number.isNaN(editId)) {
    const target = posts.value.find(p => p.id === editId)
    if (target !== undefined && target !== null) {
      openPublishModal(target)
    }
  }
})
</script>

<style scoped>
/* 基础样式 */
.back-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgb(246, 242, 242);
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

.forum-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f9f9f9;
  min-height: 100vh;
}

.forum-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 8px;
  gap: 12px;
}
.forum-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
}
.header-search {
  min-width: 220px;
}
.search-wrapper {
  position: relative;
  width: 100%;
}
.search-wrapper input {
  width: 80%;
  height: 36px;
  border: 1px solid #e0e0e0;
  border-radius: 18px;
  padding: 0 14px;
  padding-right: 36px;
  outline: none;
  font-size: 14px;
  background: #fff;
}
.search-wrapper input:focus {
  border-color: #ff2442;
}
.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.fab-wrapper {
  position: fixed;
  right: 30px;
  bottom: 30px;
  z-index: 999;
}
.fab-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff2442 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(255, 36, 66, 0.35);
  transition: all 0.3s;
}
.posts-feed {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.post-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f1eeee;
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  overflow: hidden;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.author-info {
  display: flex;
  flex-direction: column;
}
.author-name {
  font-weight: 600;
  color: #333;
  font-size: 15px;
}
.post-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
.post-text {
  color: #333;
  line-height: 1.6;
  margin: 0 0 12px 0;
  font-size: 15px;
  white-space: pre-wrap;
  text-align: left;
}
.image-grid {
  display: grid;
  gap: 4px;
  border-radius: 8px;
  overflow: hidden;
}
.image-grid.grid-1 {
  grid-template-columns: 1fr;
  max-width: 400px;
}
.image-grid.grid-2 {
  grid-template-columns: repeat(2, 1fr);
}
.image-grid.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}
.image-grid img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  cursor: zoom-in;
}
.post-actions {
  display: flex;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}
.action-btn.active {
  color: #ff2442;
}
.empty-state {
  text-align: center;
  padding: 60px;
  color: #999;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.modal {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.publish-modal textarea {
  width: 95%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  font-size: 15px;
  resize: vertical;
}
.char-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-bottom: 16px;
}
.image-upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}
.preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
}
.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.remove-img {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}
.upload-btn {
  width: 100px;
  height: 100px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #999;
  gap: 4px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.btn-secondary {
  padding: 10px 24px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
}
.btn-primary {
  padding: 10px 24px;
  border: none;
  background: #ff2442;
  color: white;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
}
.detail-modal {
  position: relative;
  text-align: left;
}
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}
.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-right: 40px;
}
.detail-content p {
  line-height: 1.8;
  color: #333;
  font-size: 15px;
  white-space: pre-wrap;
  text-align: left;
}
.detail-images {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 12px;
}
.detail-images img {
  width: 100%;
  border-radius: 8px;
  cursor: zoom-in;
}
.detail-actions {
  display: flex;
  gap: 24px;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
}
.comments-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
  text-align: left;
}
.comment-input-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}
.replying-tip {
  font-size: 12px;
  color: #666;
  text-align: left;
}
.comment-input-row {
  display: flex;
  gap: 12px;
  align-items: center;
}
.comment-input-row input {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 10px 16px;
  outline: none;
  font-size: 14px;
}
.comment-input-row button {
  padding: 10px 20px;
  background: #ff2442;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
}
.cancel-reply-btn {
  background: #f0f0f0 !important;
  color: #666 !important;
}
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.comment-item {
  display: flex;
  gap: 12px;
}
.comment-item.reply {
  margin-left: 32px;
  position: relative;
  padding-left: 16px;
  border-left: 2px solid #e0e0e0;
  background-color: #fafafa;
  border-radius: 8px;
  padding: 8px 12px 8px 16px;
}
.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f5f5;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;
}
.comment-body {
  flex: 1;
}
.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.comment-author {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}
.comment-time {
  font-size: 12px;
  color: #999;
}
.comment-text {
  margin: 0;
  color: #555;
  line-height: 1.5;
  font-size: 14px;
  text-align: left;
}
.reply-to {
  color: #1976d2;
  font-weight: 600;
}
/* 关键修改：回复和删除按钮位于同一水平线 */
.comment-actions {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.reply-btn,
.delete-reply-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
  line-height: 1.5;
}
.reply-btn {
  color: #1976d2;
}
.delete-reply-btn {
  color: #c62828;
}
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.preview-large {
  max-width: 90%;
  max-height: 90%;
  border-radius: 8px;
}
</style>