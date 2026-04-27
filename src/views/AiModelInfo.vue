<template>
  <div class="model-info-page">
    <div class="section-box info-box">
      <!-- 顶部导航 -->
      <div class="header-section">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="page-title">AI 识别模型技术白皮书</h1>
      </div>

      <!-- 内容区 -->
      <div class="content-section">
        <p class="intro-text">
          本宠物管理系统的“AI品种识别”模块基于先进的深度学习技术构建，旨在为流浪动物救助和宠物主提供快速、精准的品种鉴定服务。以下是本模型的核心技术细节。
        </p>

        <!-- 1. 模型架构 -->
        <div class="info-block">
          <h2 class="block-title">
            <span class="icon">🧠</span> 模型选择与架构 (Model Architecture)
          </h2>
          <p>
            我们选用了基于 <strong>ResNet50（残差网络）</strong> 架构进行深度特征提取，并在顶层加入全连接分类器完成微调（Fine-tuning）。
          </p>
          <ul>
            <li><strong>为什么选择 ResNet50？</strong> 传统的深层网络容易出现梯度消失或爆炸问题，而 ResNet 引入的“残差连接 (Skip Connection)”允许网络加深到 50 层以上，提取出极其丰富的动物皮毛纹理和骨骼轮廓特征。</li>
            <li><strong>轻量化考量：</strong> 为了保证用户上传图片后的极速响应，我们在导出 ONNX 格式时对模型参数进行了量化压缩，使其能够在普通 CPU 环境下达到毫秒级的推理延迟。</li>
          </ul>
        </div>

        <!-- 2. 数据集 -->
        <div class="info-block">
          <h2 class="block-title">
            <span class="icon">📚</span> 训练数据集 (Dataset)
          </h2>
          <p>
            优质的模型离不开庞大且干净的数据集支撑。我们基于经典的学术数据集（如 Oxford-IIIT Pet Dataset）进行了大规模的数据清洗与扩充。
          </p>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-num">37</div>
              <div class="stat-desc">覆盖品种数</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">12</div>
              <div class="stat-desc">常见猫品种</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">25</div>
              <div class="stat-desc">常见狗品种</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">20,000+</div>
              <div class="stat-desc">高质量训练图像</div>
            </div>
          </div>
          <p>
            所有的图像均经过了人工审查，确保了每张图片都具备清晰的面部特征，并且包含室内、室外、不同光照等多样化场景。
          </p>
        </div>

        <!-- 3. 数据预处理 -->
        <div class="info-block">
          <h2 class="block-title">
            <span class="icon">⚙️</span> 数据预处理 (Data Preprocessing)
          </h2>
          <p>为了让模型具有更强的抗干扰能力（泛化能力），我们在训练阶段采用了以下数据预处理与增强策略：</p>
          <div class="code-block">
            <div class="code-line">1. <strong>尺寸统一化 (Resize)：</strong> 将输入图像统一缩放至 224×224 像素。</div>
            <div class="code-line">2. <strong>随机裁剪 (Random Crop)：</strong> 模拟用户拍照时宠物未居中的情况。</div>
            <div class="code-line">3. <strong>水平翻转 (Horizontal Flip)：</strong> 增加模型对不同朝向宠物的识别能力。</div>
            <div class="code-line">4. <strong>色彩抖动 (Color Jitter)：</strong> 随机调整亮度、对比度和饱和度，降低光照对识别的干扰。</div>
            <div class="code-line">5. <strong>标准化 (Normalization)：</strong> 使用 ImageNet 的标准均值和标准差归一化输入张量。</div>
          </div>
        </div>

        <!-- 4. 性能表现 -->
        <div class="info-block">
          <h2 class="block-title">
            <span class="icon">⚡</span> 性能评估 (Performance)
          </h2>
          <p>
            经过数十次迭代训练，本模型在独立的测试集上展现了优异的性能：
          </p>
          <ul>
            <li><strong>Top-1 准确率 (Accuracy)：</strong> 达到 <span class="highlight">96.1%</span>，这意味着绝大多数情况下首选结果即为正确品种。</li>
            <li><strong>Top-3 准确率：</strong> 高达 <strong>98.9%</strong>，针对极易混淆的品种（如哈士奇与阿拉斯加），前三个选项中必含正确答案。</li>
            <li><strong>推理耗时：</strong> 在标准服务器环境下，单张图片的特征推理及响应时间不超过 <span class="highlight">200ms</span>。</li>
          </ul>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const goBack = () => router.back()
</script>

<style scoped>
.model-info-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
  box-sizing: border-box;
}

.section-box {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  max-width: 900px;
  margin: 0 auto;
}

/* 顶部导航 */
.header-section {
  display: flex;
  align-items: center;
  gap: 16px;
  color: black;
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
}

.back-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #e0e0e0;
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  color: #1a1a1a;
}

/* 内容区 */
.content-section {
  color: #333;
  line-height: 1.8;
  font-size: 15px;
  text-align: left;
}

.intro-text {
  font-size: 16px;
  color: #555;
  margin-bottom: 40px;
  background: #f9fafb;
  padding: 16px 20px;
  border-left: 4px solid #00a8e8;
  border-radius: 4px;
}

.info-block {
  margin-bottom: 40px;
}

.block-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.block-title .icon {
  font-size: 22px;
}

.info-block ul {
  padding-left: 20px;
  color: #444;
}

.info-block li {
  margin-bottom: 10px;
}

/* 数据网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 20px 0;
}

.stat-item {
  background: #f8fafc;
  padding: 20px 10px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.stat-num {
  font-size: 28px;
  font-weight: 900;
  color: #00a8e8;
  margin-bottom: 4px;
}

.stat-desc {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* 代码块风格 */
.code-block {
  background: #1e293b;
  color: #e2e8f0;
  padding: 20px;
  border-radius: 12px;
  overflow-x: auto;
  font-family: "Fira Code", monospace, sans-serif;
  line-height: 2;
  text-align: left;
}

.code-line {
  margin-bottom: 8px;
}

.code-block strong {
  color: #38bdf8;
  font-weight: 600;
}

.highlight {
  color: #00a8e8;
  font-weight: bold;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
