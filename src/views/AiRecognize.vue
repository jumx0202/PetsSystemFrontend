<template>
  <div class="ai-recognize-page">
    <section class="hero">
      <h1>AI 宠物识别</h1>
      <p>识别宠物品种，或验证两张照片是否属于同一只宠物。</p>
      <router-link to="/ai-model-info" class="model-link">查看模型说明</router-link>
    </section>

    <div class="tabs">
      <button :class="{ active: activeTab === 'breed' }" @click="switchTab('breed')">品种识别</button>
      <button :class="{ active: activeTab === 'verify' }" @click="switchTab('verify')">同宠验证</button>
    </div>

    <section v-if="activeTab === 'breed'" class="panel">
      <div class="upload-grid one">
        <UploadBox
          title="宠物照片"
          :preview="breedPreview"
          @select="file => loadSingleFile(file, 'breed')"
        />
      </div>
      <button class="primary-btn" :disabled="!breedFile || loading" @click="recognize">
        {{ loading ? '识别中...' : '开始识别' }}
      </button>

      <div v-if="breedResult" class="result-card">
        <div>
          <span class="badge">{{ breedResult.petTypeCn }}</span>
          <h2>{{ breedResult.breedCn }}</h2>
          <p>{{ breedResult.breed }} · 置信度 {{ percent(breedResult.confidence) }}</p>
        </div>
        <div class="candidate-list">
          <div v-for="item in breedResult.top5" :key="item.breed" class="candidate-row">
            <div class="candidate-meta">
              <span>{{ item.breedCn }}</span>
              <strong>{{ percent(item.confidence) }}</strong>
            </div>
            <div class="confidence-track">
              <div class="confidence-fill" :style="{ width: percent(item.confidence) }"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="activeTab === 'verify'" class="panel">
      <div class="upload-grid">
        <UploadBox title="图片 A" :preview="verifyPreview1" @select="file => loadSingleFile(file, 'verify1')" />
        <UploadBox title="图片 B" :preview="verifyPreview2" @select="file => loadSingleFile(file, 'verify2')" />
      </div>
      <button class="primary-btn" :disabled="!verifyFile1 || !verifyFile2 || loading" @click="verify">
        {{ loading ? '验证中...' : '判断是否同一只宠物' }}
      </button>

      <div v-if="verifyResult" class="result-card">
        <div>
          <span class="badge" :class="verifyResult.samePet ? 'success' : 'warning'">
            {{ verifyResult.samePet ? '高置信匹配' : confidenceText(verifyResult.confidenceLevel) }}
          </span>
          <h2>{{ verifyResult.samePet ? '可能是同一只宠物' : '暂未达到同宠阈值' }}</h2>
          <p>相似度 {{ percent(verifyResult.similarity) }} · 阈值 {{ percent(verifyResult.threshold) }}</p>
        </div>
      </div>
    </section>

    <div v-if="errorMsg" class="error-card">{{ errorMsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h, ref } from 'vue'
import {
  recognizePetImage,
  verifySamePet,
  type AiRecognitionResult,
  type PetFaceVerifyResult
} from '../utils/aiRecognition'

type TabKey = 'breed' | 'verify'
type FileSlot = 'breed' | 'verify1' | 'verify2'

const UploadBox = defineComponent({
  props: {
    title: { type: String, required: true },
    preview: { type: String, default: '' }
  },
  emits: ['select'],
  setup(props, { emit }) {
    const inputRef = ref<HTMLInputElement | null>(null)
    const choose = () => inputRef.value?.click()
    const onChange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) emit('select', file)
    }
    return () => h('div', { class: ['upload-box', props.preview ? 'has-preview' : ''], onClick: choose }, [
      props.preview
        ? h('img', { src: props.preview, class: 'upload-preview', alt: props.title })
        : h('div', { class: 'upload-placeholder' }, [
          h('div', { class: 'upload-icon' }, '+'),
          h('strong', props.title),
          h('span', '点击上传 JPG / PNG')
        ]),
      h('input', {
        ref: inputRef,
        type: 'file',
        accept: 'image/jpeg,image/png',
        style: 'display:none',
        onChange
      })
    ])
  }
})

const activeTab = ref<TabKey>('breed')
const loading = ref(false)
const errorMsg = ref('')

const breedFile = ref<File | null>(null)
const breedPreview = ref('')
const breedResult = ref<AiRecognitionResult | null>(null)

const verifyFile1 = ref<File | null>(null)
const verifyFile2 = ref<File | null>(null)
const verifyPreview1 = ref('')
const verifyPreview2 = ref('')
const verifyResult = ref<PetFaceVerifyResult | null>(null)

const switchTab = (tab: TabKey) => {
  activeTab.value = tab
  errorMsg.value = ''
}

const loadSingleFile = (file: File, slot: FileSlot) => {
  if (!file.type.startsWith('image/')) {
    errorMsg.value = '请上传 JPG 或 PNG 格式的图片'
    return
  }
  const reader = new FileReader()
  reader.onload = e => {
    const preview = (e.target?.result as string) || ''
    if (slot === 'breed') {
      breedFile.value = file
      breedPreview.value = preview
      breedResult.value = null
    } else if (slot === 'verify1') {
      verifyFile1.value = file
      verifyPreview1.value = preview
      verifyResult.value = null
    } else if (slot === 'verify2') {
      verifyFile2.value = file
      verifyPreview2.value = preview
      verifyResult.value = null
    }
  }
  reader.readAsDataURL(file)
  errorMsg.value = ''
}

const recognize = async () => {
  if (!breedFile.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    breedResult.value = await recognizePetImage(breedFile.value)
  } catch (error: any) {
    errorMsg.value = error?.message || '识别失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const verify = async () => {
  if (!verifyFile1.value || !verifyFile2.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    verifyResult.value = await verifySamePet(verifyFile1.value, verifyFile2.value)
  } catch (error: any) {
    errorMsg.value = error?.message || '同宠验证失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const percent = (value: number) => `${((value || 0) * 100).toFixed(1)}%`

const confidenceText = (level: string) => {
  if (level === 'high') return '高置信'
  if (level === 'medium') return '疑似匹配'
  return '低相似'
}

</script>

<style scoped>
.ai-recognize-page {
  min-height: 100vh;
  background: #f6f8fb;
  padding: 28px 20px 64px;
  color: #1f2937;
}

.hero {
  max-width: 860px;
  margin: 0 auto 18px;
  text-align: left;
}

.hero h1 {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 800;
}

.hero p {
  margin: 0 0 10px;
  color: #64748b;
}

.model-link {
  color: #0284c7;
  text-decoration: none;
  font-weight: 600;
}

.tabs {
  max-width: 860px;
  margin: 0 auto 16px;
  display: flex;
  gap: 8px;
}

.tabs button {
  border: 1px solid #dbe3ef;
  background: #fff;
  color: #334155;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}

.tabs button.active {
  background: #0ea5e9;
  border-color: #0ea5e9;
  color: #fff;
}

.panel {
  max-width: 860px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.upload-grid.one {
  grid-template-columns: 1fr;
}

.upload-box {
  min-height: 260px;
  border: 1.5px dashed #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

.upload-box:hover {
  border-color: #0ea5e9;
}

.upload-preview {
  width: 100%;
  height: 260px;
  object-fit: contain;
  background: #fff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #64748b;
}

.upload-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e0f2fe;
  color: #0284c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
}

.primary-btn {
  width: 100%;
  margin-top: 16px;
  border: none;
  background: #0ea5e9;
  color: #fff;
  padding: 14px 18px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
}

.primary-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.result-card,
.match-card,
.error-card,
.empty-result {
  margin-top: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  background: #fff;
}

.result-card h2 {
  margin: 8px 0 4px;
}

.result-card p {
  margin: 0;
  color: #64748b;
}

.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 10px;
  background: #e0f2fe;
  color: #0369a1;
  font-weight: 800;
  font-size: 13px;
}

.badge.success {
  background: #dcfce7;
  color: #15803d;
}

.badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.candidate-list {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.candidate-row {
  color: #334155;
}

.candidate-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  margin-bottom: 6px;
}

.candidate-meta span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.candidate-meta strong {
  flex: 0 0 auto;
}

.confidence-track {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #edf2f7;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0ea5e9, #22c55e);
  min-width: 3px;
  transition: width 0.3s ease;
}

.match-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.match-card {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 0;
}

.match-card img {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}

.match-main {
  flex: 1;
  min-width: 0;
}

.match-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.match-title span {
  color: #0284c7;
  font-size: 13px;
  font-weight: 700;
}

.match-main p,
.match-score span {
  margin: 4px 0 0;
  color: #64748b;
}

.match-score {
  text-align: right;
}

.match-score strong {
  display: block;
  color: #0f172a;
  font-size: 20px;
}

.error-card {
  max-width: 860px;
  margin: 16px auto 0;
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

@media (max-width: 720px) {
  .upload-grid {
    grid-template-columns: 1fr;
  }

  .tabs {
    overflow-x: auto;
  }
}
</style>
