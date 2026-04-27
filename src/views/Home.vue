<template>
  <div class="home-container">
    
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-bg"></div>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">
          让爱不再流浪<br/>
          <span class="text-highlight">智能守护</span>每一份陪伴
        </h1>
        <p class="hero-subtitle">
          集流浪救助、寻宠互助、AI 智能识别与社区交流于一体的综合性宠物守护平台。
        </p>
        <div class="hero-actions">
          <button class="btn btn-primary" @click="navigateTo('/ai-recognize')">
            体验 AI 识别
          </button>
          <button class="btn btn-secondary" @click="navigateTo('/adoption')">
            浏览领养信息
          </button>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="stat-card">
        <h2 class="stat-num">96<span class="stat-unit">%</span></h2>
        <p class="stat-label">AI 识别准确率</p>
      </div>
      <div class="stat-card">
        <h2 class="stat-num">1,000<span class="stat-unit">+</span></h2>
        <p class="stat-label">已帮助毛孩找到家</p>
      </div>
      <div class="stat-card">
        <h2 class="stat-num">37<span class="stat-unit">种</span></h2>
        <p class="stat-label">支持品种库</p>
      </div>
      <div class="stat-card">
        <h2 class="stat-num">24<span class="stat-unit">h</span></h2>
        <p class="stat-label">社区互助在线</p>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-header">
        <h2 class="section-title">核心功能</h2>
        <p class="section-desc">用科技与爱心，全方位守护您的宠物生活</p>
      </div>
      
      <div class="features-grid">
        <!-- Feature 1 -->
        <div class="feature-card" @click="navigateTo('/ai-recognize')">
          <div class="feature-icon bg-blue">
            <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/>
              <path d="m12 12 3 3"/>
              <path d="M12 12V8"/>
            </svg>
          </div>
          <h3 class="feature-name">AI 品种识别</h3>
          <p class="feature-text">上传照片，基于最新的深度学习模型，一键准确识别猫狗品种及习性介绍。</p>
          <div class="feature-arrow">→</div>
        </div>

        <!-- Feature 2 -->
        <div class="feature-card" @click="navigateTo('/adoption')">
          <div class="feature-icon bg-orange">
            <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h3 class="feature-name">领养与救助</h3>
          <p class="feature-text">浏览同城流浪动物信息，发布救助贴。以领养代替购买，给它们一个温暖的家。</p>
          <div class="feature-arrow">→</div>
        </div>

        <!-- Feature 3 -->
        <div class="feature-card" @click="navigateTo('/lost')">
          <div class="feature-icon bg-red">
            <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
          <h3 class="feature-name">紧急寻宠</h3>
          <p class="feature-text">宠物走失？一键发布寻宠启事，利用社区力量，提高找回爱宠的成功率。</p>
          <div class="feature-arrow">→</div>
        </div>

        <!-- Feature 4 -->
        <div class="feature-card" @click="navigateTo('/forum')">
          <div class="feature-icon bg-green">
            <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3 class="feature-name">社区交流</h3>
          <p class="feature-text">记录宠物日常，交流喂养经验，结识更多同城养宠达人，共建和谐社区。</p>
          <div class="feature-arrow">→</div>
        </div>
      </div>
    </section>

    <!-- Call to action Bottom -->
    <section class="cta-bottom">
      <div class="cta-content">
        <h2>准备好加入我们了吗？</h2>
        <p>不论你是想拥有一只毛孩子，还是想为走失的生命出一份力。</p>
        <button class="btn btn-dark" @click="navigateTo('/adoption')">
          立即加入
        </button>
      </div>
    </section>
    
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.home-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* =========================================
   Hero Section 
   ========================================= */
.hero-section {
  position: relative;
  width: 100%;
  height: 85vh;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  /* 使用了极高质感的unsplash毛孩子背景图 */
  background-image: url('https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=2000&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  z-index: 0;
}

.hero-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  /* 黑色线性渐变透明遮罩，保证文字清晰 */
  background: linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.4) 100%);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #ffffff;
  padding: 0 20px;
  max-width: 800px;
  animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
}

.text-highlight {
  color: #00a8e8;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  color: #cbd5e1;
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.btn {
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #00a8e8;
  color: #fff;
  box-shadow: 0 8px 20px rgba(0, 168, 232, 0.3);
}

.btn-primary:hover {
  background-color: #0090c7;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 168, 232, 0.4);
}

.btn-secondary {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* =========================================
   Stats Section
   ========================================= */
.stats-section {
  max-width: 1200px;
  margin: -60px auto 60px;
  padding: 0 20px;
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.stat-card {
  background: #ffffff;
  padding: 32px 20px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-num {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px;
}

.stat-unit {
  font-size: 1.25rem;
  color: #64748b;
  margin-left: 4px;
}

.stat-label {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

/* =========================================
   Features Section 
   ========================================= */
.features-section {
  max-width: 1200px;
  margin: 0 auto 100px;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 16px;
}

.section-desc {
  font-size: 1.1rem;
  color: #64748b;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}

.feature-card {
  background: #ffffff;
  padding: 40px;
  border-radius: 24px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.02);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
}

.feature-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: #fff;
}

.bg-blue { background: #00a8e8; }
.bg-orange { background: #f97316; }
.bg-red { background: #ef4444; }
.bg-green { background: #10b981; }

.feature-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 12px;
}

.feature-text {
  font-size: 1.05rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 0;
}

.feature-arrow {
  position: absolute;
  bottom: 40px;
  right: 40px;
  font-size: 1.5rem;
  color: #cbd5e1;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.feature-card:hover .feature-arrow {
  opacity: 1;
  transform: translateX(0);
  color: #00a8e8;
}

/* =========================================
   CTA Bottom 
   ========================================= */
.cta-bottom {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 80px 20px;
  text-align: center;
  color: #fff;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 16px;
}

.cta-content p {
  font-size: 1.1rem;
  color: #94a3b8;
  margin-bottom: 40px;
}

.btn-dark {
  background-color: #ffffff;
  color: #0f172a;
  padding: 16px 48px;
}

.btn-dark:hover {
  background-color: #f1f5f9;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(255,255,255,0.1);
}

/* =========================================
   Animations & Responsiveness
   ========================================= */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 992px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-actions {
    flex-direction: column;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 24px 16px;
  }
}
</style>