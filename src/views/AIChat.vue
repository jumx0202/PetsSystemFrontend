<template>
  <div class="ai-chat-page">
    <button class="back-home-btn" @click="goBack">返回</button>

    <aside class="session-sidebar">
      <button class="new-chat-btn" @click="createSession">+ 新对话</button>
      <div class="session-list">
        <div
            v-for="group in groupedSessions"
            :key="group.label"
            class="session-group"
        >
          <div class="group-title">{{ group.label }}</div>
          <button
              v-for="session in group.items"
              :key="session.id"
              class="session-item"
              :class="{ active: session.id === activeSessionId }"
              @click="activeSessionId = session.id"
          >
            {{ session.title }}
          </button>
        </div>
      </div>
    </aside>

    <section class="chat-main">
      <div class="chat-header">AI 问答</div>
      <div class="message-list" ref="messageListRef" @scroll="handleMessageListScroll">
        <div v-if="activeSession.messages.length === 0" class="empty-hint">
          输入你的问题，开始对话
        </div>
        <div
            v-for="msg in activeSession.messages"
            :key="msg.id"
            class="message-row"
            :class="msg.role"
        >
          <div class="message-bubble" :class="{ loading: msg.isLoading }">
            <template v-if="msg.isLoading">
              <span class="typing-wrap">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-text">正在生成回答...</span>
              </span>
            </template>
            <template v-else>
              <div v-if="msg.role === 'assistant'" class="markdown-body" v-html="renderMarkdown(msg.content)"></div>
              <div v-else class="markdown-body user-message-content">{{ msg.content }}</div>
            </template>
          </div>
        </div>
      </div>

      <!-- 输入框放在聊天区内部底部，宽度仅限聊天区，不覆盖侧边栏 -->
      <div class="input-area">
        <input
            v-model="draft"
            placeholder="请输入你的问题..."
            @keyup.enter="handleSendButtonClick"
        />
        <button @click="handleSendButtonClick" :disabled="!isSending && !draft.trim()">
          {{ isSending ? '停止' : '发送' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { marked } from 'marked'
import { Message } from '../utils/message'

type MessageRole = 'user' | 'assistant'

interface ChatMessage {
  id: number
  role: MessageRole
  content: string
  time: number
  isLoading?: boolean
}

interface ChatSession {
  id: number
  title: string
  createdAt: number
  messages: ChatMessage[]
}

const STORAGE_KEY = 'pet_ai_chat_sessions_v1'
const router = useRouter()

const sessions = ref<ChatSession[]>([])
const activeSessionId = ref<number>(0)
const draft = ref('')
const messageListRef = ref<HTMLElement | null>(null)
let idSeed = Date.now()

const nextId = () => {
  const now = Date.now()
  idSeed = now > idSeed ? now : idSeed + 1
  return idSeed
}

const createEmptySession = (): ChatSession => ({
  id: nextId(),
  title: '新对话',
  createdAt: Date.now(),
  messages: []
})

const loadSessions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const first = createEmptySession()
      sessions.value = [first]
      activeSessionId.value = first.id
      return
    }
    const parsed = JSON.parse(raw) as ChatSession[]
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const first = createEmptySession()
      sessions.value = [first]
      activeSessionId.value = first.id
      return
    }
    
    // 修复刷新后陷入"正在生成回答..."的问题
    sessions.value = parsed.map(session => {
      if (session.messages) {
        session.messages = session.messages.map(msg => {
          if (msg.isLoading) {
            msg.isLoading = false
            if (!msg.content || !msg.content.trim()) {
              msg.content = '*(对话已中断)*'
            }
          }
          return msg
        })
      }
      return session
    })
    
    activeSessionId.value = sessions.value[0]!.id
  } catch {
    const first = createEmptySession()
    sessions.value = [first]
    activeSessionId.value = first.id
  }
}

const persistSessions = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.value))
}

const getSessionTimestamp = (session: ChatSession): number => {
  const lastMessage = session.messages[session.messages.length - 1]
  return lastMessage?.time ?? session.createdAt
}

const groupedSessions = computed(() => {
  const now = Date.now()
  const startOfToday = new Date().setHours(0, 0, 0, 0)
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000

  const groups: Array<{ label: string; items: ChatSession[] }> = [
    { label: '今天', items: [] },
    { label: '7天内', items: [] },
    { label: '30天内', items: [] },
    { label: '更早', items: [] }
  ]

  const ordered = [...sessions.value].sort(
      (a, b) => getSessionTimestamp(b) - getSessionTimestamp(a)
  )

  ordered.forEach((session) => {
    const ts = getSessionTimestamp(session)
    if (ts >= startOfToday) {
      groups[0]!.items.push(session)
      return
    }
    const diff = now - ts
    if (diff <= sevenDaysMs) {
      groups[1]!.items.push(session)
      return
    }
    if (diff <= thirtyDaysMs) {
      groups[2]!.items.push(session)
      return
    }
    groups[3]!.items.push(session)
  })

  return groups.filter(group => group.items.length > 0)
})

const activeSession = computed(() => {
  const found = sessions.value.find(s => s.id === activeSessionId.value)
  if (found) return found
  const fallback = sessions.value[0]
  if (fallback) return fallback
  const first = createEmptySession()
  sessions.value = [first]
  activeSessionId.value = first.id
  return first
})

const createSession = () => {
  const newSession = createEmptySession()
  sessions.value.unshift(newSession)
  activeSessionId.value = newSession.id
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/')
}

const isSending = ref(false)
const activeAbortController = ref<AbortController | null>(null)
const currentAssistantMessage = ref<ChatMessage | null>(null)
const generationToken = ref(0)
const shouldAutoScroll = ref(true)
const AUTO_SCROLL_THRESHOLD_PX = 80
const TYPING_INTERVAL_MS = 24

const renderMarkdown = (content: string) => {
  if (!content) return ''
  try {
    // 把连续超过2个以上的换行符替换为2个，防止过大的空白段落
    const cleaned = content.replace(/\n{3,}/g, '\n\n')
    return marked.parse(cleaned)
  } catch (e) {
    return content
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const isNearBottom = (el: HTMLElement): boolean =>
    el.scrollHeight - (el.scrollTop + el.clientHeight) <= AUTO_SCROLL_THRESHOLD_PX

const handleMessageListScroll = () => {
  const el = messageListRef.value
  if (!el) return
  shouldAutoScroll.value = isNearBottom(el)
}

const scrollToBottom = async (force = false) => {
  await nextTick()
  const el = messageListRef.value
  if (!el) return
  if (!force && !shouldAutoScroll.value) return
  el.scrollTop = el.scrollHeight
}

const stopCurrentGeneration = () => {
  generationToken.value += 1
  activeAbortController.value?.abort()
  activeAbortController.value = null
  isSending.value = false

  const msg = currentAssistantMessage.value
  if (!msg) return
  if (msg.isLoading) {
    msg.isLoading = false
    if (!msg.content.trim()) {
      msg.content = '已停止生成。'
    }
  }
}

const isRequestCanceled = (error: any): boolean =>
    error?.code === 'ERR_CANCELED' ||
    error?.name === 'CanceledError' ||
    error?.name === 'AbortError' ||
    error?.message === 'canceled'

const animateAssistantReply = async (message: ChatMessage, fullText: string, token: number) => {
  const safeText = fullText || '抱歉，AI 暂时没有返回有效内容，请稍后重试。'
  message.isLoading = false
  message.content = ''
  await scrollToBottom()
  for (const ch of safeText) {
    if (token !== generationToken.value) return
    message.content += ch
    await scrollToBottom()
    await sleep(TYPING_INTERVAL_MS)
  }
}

const handleSendButtonClick = () => {
  if (isSending.value) {
    stopCurrentGeneration()
    return
  }
  void sendMessage()
}

const sendMessage = async () => {
  if (isSending.value) return
  const text = draft.value.trim()
  if (!text) return
  const session = activeSession.value
  const now = Date.now()
  const userMsg: ChatMessage = {
    id: nextId(),
    role: 'user',
    content: text,
    time: now
  }
  session.messages.push(userMsg)
  void scrollToBottom()

  if (session.messages.length === 1) {
    session.title = text.slice(0, 14) || '新对话'
  }

  const assistantMsg: ChatMessage = {
    id: nextId(),
    role: 'assistant',
    content: '',
    time: now,
    isLoading: true
  }
  session.messages.push(assistantMsg)
  void scrollToBottom()

  draft.value = ''
  isSending.value = true
  currentAssistantMessage.value = assistantMsg
  const controller = new AbortController()
  activeAbortController.value = controller
  const token = generationToken.value + 1
  generationToken.value = token

  const history = session.messages.slice(-20).map(msg => ({
    role: msg.role,
    content: msg.content
  }))

  try {
    const tokenStr = localStorage.getItem('token') || ''
    const response = await fetch('http://localhost:8080/api/ai/stream-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenStr}`
      },
      body: JSON.stringify({
        messages: history,
        sessionId: session.id
      }),
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    assistantMsg.isLoading = false
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    
    // 平滑输出队列
    let animationQueue = ''
    let isAnimating = false
    const processQueue = async () => {
      while (animationQueue.length > 0 && token === generationToken.value) {
        // 动态调整速度：队列越长，吐字越快
        const charsToTake = animationQueue.length > 50 ? 3 : (animationQueue.length > 20 ? 2 : 1)
        const chunk = animationQueue.substring(0, charsToTake)
        animationQueue = animationQueue.substring(charsToTake)
        
        assistantMsg.content += chunk
        await scrollToBottom()
        
        if (charsToTake === 1) {
          await sleep(15) // 速度调整
        } else {
          await sleep(10)
        }
      }
      isAnimating = false
    }

    if (reader) {
      while (true) {
        if (token !== generationToken.value) break

        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''
        
        for (const part of parts) {
          if (part.startsWith('data:')) {
            const dataStr = part.substring(5).trim()
            if (dataStr === '[DONE]') {
               break
            }
            try {
              const dataObj = JSON.parse(dataStr)
              if (dataObj.delta) {
                 animationQueue += dataObj.delta
                 if (!isAnimating) {
                   isAnimating = true
                   void processQueue()
                 }
              } else if (dataObj.error) {
                 animationQueue += '\n\n[错误] ' + dataObj.error
                 if (!isAnimating) {
                   isAnimating = true
                   void processQueue()
                 }
              }
            } catch (e) {
              if (dataStr.startsWith('[ERROR]')) {
                 assistantMsg.content += '\n\n' + dataStr
              }
            }
          } else if (part.startsWith('event: error')) {
            const dataLine = part.split('\n').find(l => l.startsWith('data:'))
            if (dataLine) {
               let errData = dataLine.substring(5).trim()
               try {
                  const dataObj = JSON.parse(errData)
                  if(dataObj.error) errData = dataObj.error
               } catch(ex){}
               assistantMsg.content += '\n\n[系统提示] ' + errData
            }
          }
        }
      }
      
      // 等待队列动画播放完毕
      while (isAnimating && token === generationToken.value) {
        await sleep(50)
      }
    }
  } catch (error: any) {
    if (isRequestCanceled(error) || token !== generationToken.value) {
      return
    }
    console.error('AI 对话请求失败', error)
    assistantMsg.isLoading = false
    assistantMsg.content += '\n\n[系统提示] AI 服务请求失败，可能是网络问题或超时。'
    await scrollToBottom()
  } finally {
    if (activeAbortController.value === controller) {
      activeAbortController.value = null
    }
    if (currentAssistantMessage.value === assistantMsg) {
      currentAssistantMessage.value = null
    }
    if (token === generationToken.value) {
      isSending.value = false
    }
  }
}

loadSessions()
void scrollToBottom(true)

watch(
    sessions,
    () => {
      persistSessions()
    },
    { deep: true }
)

watch(activeSessionId, async () => {
  shouldAutoScroll.value = true
  await scrollToBottom(true)
})
</script>

<style scoped>
/* ========== 整体布局：侧边栏 + 聊天区（底部自带输入框） ========== */
.ai-chat-page {
  display: flex;
  height: 100vh;
  background: #f4f6fa;
}

/* 侧边栏：固定宽度，独立滚动 */
.session-sidebar {
  width: 220px;
  background: #ffffff;
  border-right: 1px solid #eaeaea;
  padding: 14px;
  overflow-y: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* 聊天主区域：占据剩余宽度，内部为 flex 列布局 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: #f4f6fa;
}

/* 聊天头部 */
.chat-header {
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  border-bottom: 1px solid #eaeaea;
  background: #fff;
  flex-shrink: 0;
}

/* 消息列表区域 — 自动滚动 */
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 输入框区域 — 固定在聊天区底部，不覆盖侧边栏 */
.input-area {
  display: flex;
  gap: 10px;
  padding: 12px 20px;
  background: #ffffff;
  border-top: 1px solid #eaeaea;
  flex-shrink: 0;
}

/* ========== 以下所有样式保持不变 ========== */
.back-home-btn {
  position: fixed;
  left: 20px;
  bottom: 20px;
  z-index: 1000;
  border: none;
  border-radius: 20px;
  padding: 10px 16px;
  background: #fff;
  color: #2563eb;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.2);
}
.back-home-btn:hover {
  background: #eff6ff;
}
.new-chat-btn {
  width: 100%;
  border: none;
  background: #3c8dff;
  color: #fff;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  margin-bottom: 14px;
}
.session-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.session-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.group-title {
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
  padding: 2px 2px 0;
}
.session-item {
  border: none;
  background: #f3f5f9;
  color: #333;
  border-radius: 8px;
  padding: 9px 10px;
  text-align: left;
  cursor: pointer;
}
.session-item.active {
  background: #e6f0ff;
  color: #2563eb;
}
.empty-hint {
  color: #9aa0a6;
  text-align: center;
  margin-top: 20px;
}
.message-row {
  display: flex;
}
.message-row.user {
  justify-content: flex-end;
}
.message-row.assistant {
  justify-content: flex-start;
}
.message-bubble {
  max-width: 70%;
  border-radius: 12px;
  padding: 10px 12px;
  line-height: 1.5;
  text-align: left;
}
.message-row.user .message-bubble {
  background: #3c8dff;
  color: #fff;
}
.message-row.assistant .message-bubble {
  background: #fff;
  color: #333;
}
.message-bubble.loading {
  min-width: 180px;
}
.typing-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3c8dff;
  opacity: 0.35;
  animation: blink 1s infinite ease-in-out;
}
.typing-dot:nth-child(2) {
  animation-delay: 0.15s;
}
.typing-dot:nth-child(3) {
  animation-delay: 0.3s;
}
.typing-text {
  color: #6b7280;
  font-size: 13px;
}
@keyframes blink {
  0%, 80%, 100% {
    opacity: 0.35;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-1px);
  }
}
.input-area input {
  flex: 1;
  border: 1px solid #dfe3ea;
  border-radius: 20px;
  padding: 10px 14px;
  outline: none;
}
.input-area button {
  border: none;
  background: #3c8dff;
  color: #fff;
  border-radius: 20px;
  padding: 0 16px;
  cursor: pointer;
}
.input-area button:disabled {
  background: #b3d4ff;
  cursor: not-allowed;
}

/* ========== Markdown 美化样式 ========== */
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  word-wrap: break-word;
}
.user-message-content {
  white-space: pre-wrap;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body :deep(h1) { font-size: 1.4em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
.markdown-body :deep(h2) { font-size: 1.2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
.markdown-body :deep(h3) { font-size: 1.1em; }
.markdown-body :deep(h4) { font-size: 1em; }

.markdown-body :deep(p) {
  margin-top: 0;
  margin-bottom: 0.5em;
}

/* 隐藏空的段落标签，防止额外撑开间距 */
.markdown-body :deep(p:empty) {
  display: none;
}

.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 1.2em;
  margin-top: 0.2em;
  margin-bottom: 0.5em;
}

.markdown-body :deep(li) {
  margin-bottom: 0.2em;
}

/* 消除列表项内 p 标签导致的双重间距 */
.markdown-body :deep(li > p) {
  margin-top: 0;
  margin-bottom: 0;
  display: inline;
}

.markdown-body :deep(code) {
  background-color: rgba(27,31,35,0.05);
  border-radius: 3px;
  padding: 0.2em 0.4em;
  font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 85%;
}

.markdown-body :deep(pre) {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  margin-bottom: 0.8em;
}

.markdown-body :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.markdown-body :deep(blockquote) {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin: 0 0 0.8em 0;
}

.markdown-body :deep(table) {
  display: block;
  width: 100%;
  overflow: auto;
  margin-bottom: 1em;
  border-spacing: 0;
  border-collapse: collapse;
}

.markdown-body :deep(table th),
.markdown-body :deep(table td) {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

.markdown-body :deep(table tr) {
  background-color: #fff;
  border-top: 1px solid #c6cbd1;
}

.markdown-body :deep(table tr:nth-child(2n)) {
  background-color: #f6f8fa;
}

/* 消息气泡阴影与圆角增强 */
.message-bubble {
  max-width: 70%;
  border-radius: 16px;
  padding: 12px 16px;
  line-height: 1.6;
  text-align: left;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.message-row.user .message-bubble {
  border-bottom-right-radius: 4px;
}
.message-row.assistant .message-bubble {
  border-bottom-left-radius: 4px;
}
</style>
