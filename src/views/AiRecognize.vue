<template>
  <div class="ai-recognize-page">

    <!-- 顶部 Hero -->
    <div class="main">
      <h1 class="main-title">
        AI 宠物 <span class="highlight">品种识别</span>
      </h1>
      <p class="title-detail">
        上传一张宠物照片，AI 将自动识别品种。支持 <strong>12 种猫</strong> 和 <strong>25 种狗</strong>，共 37 个品种，准确率 96.1%。
      </p>
      <div class="model-link-wrapper">
        <router-link to="/ai-model-info" class="model-link">
          深入了解 AI 模型架构及技术细节 →
        </router-link>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrap">

      <!-- 上传卡片 -->
      <div class="card upload-card">
        <div
          class="upload-area"
          :class="{ 'drag-over': isDragging, 'has-image': previewUrl }"
          @click="triggerUpload"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <img v-if="previewUrl" :src="previewUrl" class="preview-img" />
          <template v-else>
            <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="#c8d0e0" stroke-width="1.1">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p class="upload-hint-main">点击或拖拽上传图片</p>
            <p class="upload-hint-sub">支持 JPG / PNG</p>
          </template>
        </div>
        <input ref="fileInput" type="file" accept="image/jpeg,image/png" style="display:none" @change="handleFileChange" />

        <div class="upload-actions">
          <button v-if="previewUrl" class="change-btn" @click.stop="triggerUpload">更换图片</button>
          <button
            class="recognize-btn"
            :class="{ 'recognize-btn-disabled': !selectedFile || isLoading }"
            :disabled="!selectedFile || isLoading"
            @click="recognize"
          >
            <span v-if="isLoading" class="spinner-inline"></span>
            {{ isLoading ? '识别中...' : '开始识别' }}
          </button>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMsg" class="error-card">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ errorMsg }}
      </div>

      <!-- 识别结果 -->
      <div v-if="result" class="result-wrap">

        <!-- 主结果卡片 -->
        <div class="card result-main-card">
          <div class="result-header">
            <div class="pet-badge">{{ result.pet_type === 'cat' ? '🐱' : '🐶' }}</div>
            <div class="result-info">
              <div class="breed-cn">{{ result.breed_cn }}</div>
              <div class="breed-en">{{ result.breed }}</div>
              <span class="pet-type-tag">{{ result.pet_type_cn }}</span>
            </div>
            <div class="confidence-block">
              <div class="confidence-num">{{ (result.confidence * 100).toFixed(1) }}%</div>
              <div class="confidence-label">置信度</div>
            </div>
          </div>
        </div>

        <!-- Top-5 -->
        <div class="card">
          <div class="top5-title">Top-5 候选品种</div>
          <div class="top5-list">
            <div
              v-for="(item, index) in result.top5"
              :key="index"
              class="bar-row"
              :class="{ first: index === 0 }"
            >
              <div class="bar-label-row">
                <span class="bar-rank" :class="{ 'bar-rank-first': index === 0 }">{{ Number(index) + 1 }}</span>
                <span class="bar-name">{{ item.breed_cn }}</span>
                <span class="bar-en">{{ item.breed }}</span>
                <span class="bar-pct">{{ (item.confidence * 100).toFixed(1) }}%</span>
              </div>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :class="{ 'bar-fill-first': index === 0 }"
                  :style="{ width: (item.confidence * 100).toFixed(1) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <button class="retry-btn" @click="reset">再识别一张</button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// @ts-ignore
import request from '../api/request.js'

const fileInput    = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl   = ref<string>('')
const isDragging   = ref(false)
const isLoading    = ref(false)
const errorMsg     = ref('')
const result       = ref<any>(null)

const triggerUpload = () => fileInput.value?.click()

const loadFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    errorMsg.value = '请上传 JPG 或 PNG 格式的图片'
    return
  }
  selectedFile.value = file
  errorMsg.value = ''
  result.value = null
  const reader = new FileReader()
  reader.onload = e => { previewUrl.value = e.target?.result as string }
  reader.readAsDataURL(file)
}

const handleFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadFile(file)
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) loadFile(file)
}

const recognize = async () => {
  if (!selectedFile.value) return
  isLoading.value = true
  errorMsg.value  = ''
  result.value    = null

  const fd = new FormData()
  fd.append('file', selectedFile.value)

  try {
    const res = await request.post('/api/ai/recognize', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 65000
    })
    if (res?.code === 200) {
      result.value = res.data
    } else {
      errorMsg.value = res?.message || '识别失败，请重试'
    }
  } catch (err: any) {
    if (err?.response?.status === 503) {
      errorMsg.value = 'AI 推理服务未启动，请先运行 inference_server.py'
    } else {
      errorMsg.value = '网络错误，请检查后端服务是否正常运行'
    }
  } finally {
    isLoading.value = false
  }
}

const reset = () => {
  selectedFile.value = null
  previewUrl.value   = ''
  result.value       = null
  errorMsg.value     = ''
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<style scoped>
.ai-recognize-page {
  min-height: 80vh;
  background: #fff;
}

/* ========== Hero ========== */
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
  color: #00a8e8;
  font-weight: 800;
}

.title-detail {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

.model-link-wrapper {
  margin-top: 12px;
}

.model-link {
  font-size: 14px;
  color: #00a8e8;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  padding: 4px 8px;
  border-radius: 4px;
}

.model-link:hover {
  background: #f0f9ff;
  color: #0090c9;
}

/* ========== 内容区 ========== */
.content-wrap {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 20px 60px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* ========== 上传区 ========== */
.upload-card { }

.upload-area {
  border: 2px dashed #d8dde8;
  border-radius: 14px;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafbff;
  overflow: hidden;
  gap: 12px;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #00a8e8;
  background: #f0f9ff;
}

.upload-area.has-image {
  border-style: solid;
  border-color: #e0e0e0;
  background: #fff;
  min-height: 260px;
  padding: 0;
}

.preview-img {
  width: 100%;
  max-height: 360px;
  object-fit: contain;
}

.upload-hint-main {
  font-size: 15px;
  color: #555;
  font-weight: 500;
  margin: 0;
}

.upload-hint-sub {
  font-size: 13px;
  color: #aaa;
  margin: 0;
}

.upload-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.change-btn {
  flex: 1;
  height: 44px;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  background: #fff;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.change-btn:hover {
  border-color: #00a8e8;
  color: #00a8e8;
}

.recognize-btn {
  flex: 2;
  height: 44px;
  border: none;
  border-radius: 8px;
  background: #00a8e8;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 168, 232, 0.3);
}

.recognize-btn:hover:not(:disabled) {
  background: #0090c9;
  box-shadow: 0 6px 16px rgba(0, 168, 232, 0.4);
}

.recognize-btn:disabled,
.recognize-btn-disabled {
  background: #c8d0dc;
  cursor: not-allowed;
  box-shadow: none;
}

.spinner-inline {
  width: 17px;
  height: 17px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ========== 错误提示 ========== */
.error-card {
  background: #fff5f5;
  border: 1px solid #ffd0d0;
  border-radius: 12px;
  padding: 14px 18px;
  color: #e05555;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ========== 结果区 ========== */
.result-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-main-card { }

.result-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pet-badge {
  font-size: 56px;
  line-height: 1;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.breed-cn {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
}

.breed-en {
  font-size: 13px;
  color: #999;
  margin-top: 3px;
}

.pet-type-tag {
  display: inline-block;
  margin-top: 8px;
  padding: 3px 12px;
  background: #e6f7ff;
  color: #00a8e8;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.confidence-block {
  text-align: right;
  flex-shrink: 0;
}

.confidence-num {
  font-size: 32px;
  font-weight: 800;
  color: #00a8e8;
  line-height: 1;
}

.confidence-label {
  font-size: 12px;
  color: #aaa;
  margin-top: 4px;
}

/* ========== Top-5 ========== */
.top5-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 18px;
}

.top5-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bar-label-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;
}

.bar-rank {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #f0f0f0;
  color: #888;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bar-rank-first {
  background: #00a8e8;
  color: #fff;
}

.bar-name {
  font-weight: 600;
  color: #333;
}

.bar-en {
  color: #bbb;
  font-size: 12px;
}

.bar-pct {
  margin-left: auto;
  font-weight: 700;
  color: #555;
  font-size: 13px;
}

.bar-track {
  height: 8px;
  background: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  background: #b0d8f0;
  transition: width 0.6s ease;
}

.bar-fill-first {
  background: #00a8e8;
}

/* ========== 再试按钮 ========== */
.retry-btn {
  width: 100%;
  height: 46px;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  background: #fff;
  color: #666;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  border-color: #00a8e8;
  color: #00a8e8;
}

@media (max-width: 768px) {
  .main-title { font-size: 24px; }
  .content-wrap { padding: 0 16px 40px; }
  .card { padding: 20px; }
  .pet-badge { font-size: 44px; }
  .confidence-num { font-size: 26px; }
}
</style>
