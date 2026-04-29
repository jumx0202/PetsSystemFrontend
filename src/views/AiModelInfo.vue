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
            我们选用了基于 <strong>EfficientNet-B4</strong> 架构进行深度特征提取与迁移学习。EfficientNet 是计算机视觉领域极具代表性的轻量高精模型，通过复合缩放方法（Compound Scaling）在网络深度、宽度和分辨率之间取得了绝佳的平衡。
          </p>
          <ul>
            <li><strong>为什么选择 EfficientNet-B4？</strong> 相较于早期的 ResNet 系列，B4 节点在仅消耗约 19M 参数量的前提下，提供了极强的细粒度品种区分能力（如区分各种相近的猫狗）。</li>
            <li><strong>两阶段迁移学习 (Two-Stage Fine-tuning)：</strong> 训练分为两个阶段。首先冻结骨干网络，使用较大的学习率预热训练分类头（Epoch 1-5）；然后解冻全网络，使用极小的学习率微调骨干特征（Epoch 6-25），防止破坏在 ImageNet 上学到的预训练特征。</li>
          </ul>
        </div>

        <!-- 2. 数据集 -->
        <div class="info-block">
          <h2 class="block-title">
            <span class="icon">📚</span> 训练数据集 (Dataset)
          </h2>
          <p>
            基于牛津大学视觉几何组（VGG）发布的权威学术基准 —— <strong>Oxford-IIIT Pet Dataset</strong>。该数据集被众多顶会论文用作细粒度分类的标准 benchmark。
          </p>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-num">37</div>
              <div class="stat-desc">覆盖品种数</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">12</div>
              <div class="stat-desc">猫品种数</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">25</div>
              <div class="stat-desc">狗品种数</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">~7,349</div>
              <div class="stat-desc">高质量图像总量</div>
            </div>
          </div>
          <p>
            数据集按照官方标准严谨划分为训练集（约78%）、验证集（约10%）和测试集（约12%），确保模型评估的绝对客观性，不存在数据泄露。
          </p>
        </div>

        <!-- 3. 数据预处理 -->
        <div class="info-block">
          <h2 class="block-title">
            <span class="icon">⚙️</span> 数据预处理 (Data Preprocessing)
          </h2>
          <p>为了让模型具有更强的泛化能力并匹配 EfficientNet-B4 的 380×380 输入尺寸，训练阶段采用了复合数据增强策略：</p>
          <div class="code-block">
            <div class="code-line">1. <strong>尺寸处理：</strong> 先缩放至 400×400，再随机裁剪 (Random Crop) 至目标尺寸 380×380，增加位置多样性。</div>
            <div class="code-line">2. <strong>空间变换：</strong> 随机水平翻转 (Random Horizontal Flip) 与 ±15° 随机旋转 (Random Rotation)。</div>
            <div class="code-line">3. <strong>色彩抖动：</strong> 调整亮度(30%)、对比度(30%)、饱和度(20%) 和 色调(5%)，降低光照干扰。</div>
            <div class="code-line">4. <strong>灰度转换：</strong> 5% 概率转换为灰度图 (Random Grayscale)，防止模型过度依赖颜色判断。</div>
            <div class="code-line">5. <strong>标准化 (Normalization)：</strong> 使用 ImageNet 统计量 (均值 [0.485, 0.456, 0.406] 和标准差 [0.229, 0.224, 0.225]) 归一化输入张量。</div>
          </div>
        </div>

        <!-- 4. 性能表现 -->
        <div class="info-block">
          <h2 class="block-title">
            <span class="icon">⚡</span> 训练效果与部署 (Performance & Deployment)
          </h2>
          <p>
            经过在 Apple M 系列芯片上的 MPS 加速训练，最终选出的最优快照达到了以下性能指标：
          </p>
          <ul>
            <li><strong>最终测试集准确率 (Test Accuracy)：</strong> 达到 <span class="highlight">96.09%</span>。这在难度极高的 37 类细粒度分类任务中属于相当优秀的水准。</li>
            <li><strong>验证集与训练集对比：</strong> 最终轮验证集准确率 94.85%，训练集 99.85%，训练与验证差距维持在合理的 ~5%，说明数据增强起到了良好的正则化作用。</li>
            <li><strong>ONNX 工程化部署：</strong> 模型采用 PyTorch 2.x 最新的 Dynamo 导出器无损转化为 ONNX 格式。计算图结构仅占用 1MB，模型权重独立为 68MB 文件，搭配 FastAPI + ONNX Runtime 提供极速响应的工业级推理微服务。</li>
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

