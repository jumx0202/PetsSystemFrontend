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
          本系统共拥有三个 AI 模型阶段：<strong>1.0 品种识别原版</strong>、<strong>1.1 品种识别增强版</strong>、<strong>2.0 PetFace 个体识别</strong>。可切换下方标签查看各版本技术详情。
        </p>

        <div class="version-switch">
          <button :class="{ active: activeVersion === 'v1' }" @click="activeVersion = 'v1'">
            1.0 原版模型
          </button>
          <button :class="{ active: activeVersion === 'v11' }" @click="activeVersion = 'v11'">
            1.1 增强版模型
          </button>
          <button :class="{ active: activeVersion === 'v2' }" @click="activeVersion = 'v2'">
            2.0 PetFace 个体识别
          </button>
        </div>

        <div v-if="activeVersion === 'v1'" class="version-content">
          <div class="version-summary">
            <span class="version-tag">1.0 原版</span>
            <h2>Oxford-IIIT Pet 基线模型</h2>
            <p>用于系统最初的宠物品种识别能力验证，覆盖 37 个猫狗品种，适合作为后续增强模型的对照基线。</p>
          </div>

          <!-- 1. 模型架构 -->
          <div class="info-block">
            <h2 class="block-title">
              <span class="icon">🧠</span> 模型选择与架构 (Model Architecture)
            </h2>
            <p>
              原版模型选用了 <strong>EfficientNet-B4</strong> 架构进行深度特征提取与迁移学习。EfficientNet 通过复合缩放方法（Compound Scaling）在网络深度、宽度和输入分辨率之间取得较好的平衡，适合细粒度宠物品种分类。
            </p>
            <ul>
              <li><strong>模型定位：</strong> 面向猫狗品种识别的基础版本，用于验证系统 AI 识别链路是否可行。</li>
              <li><strong>迁移学习：</strong> 使用 ImageNet 预训练权重作为初始化，使模型能够在较小数据集上获得稳定表现。</li>
              <li><strong>两阶段训练：</strong> 先冻结骨干网络训练分类头，再解冻全网络进行低学习率微调。</li>
            </ul>
          </div>

          <!-- 2. 数据集 -->
          <div class="info-block">
            <h2 class="block-title">
              <span class="icon">📚</span> 训练数据集 (Dataset)
            </h2>
            <p>
              原版模型基于牛津大学视觉几何组（VGG）发布的 <strong>Oxford-IIIT Pet Dataset</strong>。该数据集是宠物细粒度分类中常用的公开基准数据集。
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
                <div class="stat-desc">图像总量</div>
              </div>
            </div>
            <p>
              数据集按照训练集、验证集和测试集进行划分，用于评估模型在 37 类细粒度分类任务上的泛化能力。
            </p>
          </div>

          <!-- 3. 数据预处理 -->
          <div class="info-block">
            <h2 class="block-title">
              <span class="icon">⚙️</span> 数据预处理 (Data Preprocessing)
            </h2>
            <p>为了匹配 EfficientNet-B4 的 380×380 输入尺寸并提升泛化能力，训练阶段采用了复合数据增强策略：</p>
            <div class="code-block">
              <div class="code-line">1. <strong>尺寸处理：</strong> 先缩放至 400×400，再随机裁剪至 380×380。</div>
              <div class="code-line">2. <strong>空间变换：</strong> 随机水平翻转与 ±15° 随机旋转。</div>
              <div class="code-line">3. <strong>色彩抖动：</strong> 调整亮度、对比度、饱和度和色调，降低光照干扰。</div>
              <div class="code-line">4. <strong>灰度转换：</strong> 小概率转换为灰度图，防止模型过度依赖颜色。</div>
              <div class="code-line">5. <strong>标准化：</strong> 使用 ImageNet 均值与标准差进行归一化。</div>
            </div>
          </div>

          <!-- 4. 性能表现 -->
          <div class="info-block">
            <h2 class="block-title">
              <span class="icon">⚡</span> 训练效果与部署 (Performance & Deployment)
            </h2>
            <ul>
              <li><strong>最终测试集准确率：</strong> 约 <span class="highlight">96.09%</span>，在 37 类 Oxford-IIIT Pet 任务上表现稳定。</li>
              <li><strong>系统价值：</strong> 原版模型证明了系统可以完成“上传图片 → AI识别 → 返回品种结果”的完整推理流程。</li>
              <li><strong>版本意义：</strong> 作为 1.1 增强版的基线模型，便于论文中进行数据集扩充前后的对比分析。</li>
            </ul>
          </div>
        </div>

        <div v-else-if="activeVersion === 'v11'" class="version-content">
          <div class="version-summary upgraded">
            <span class="version-tag">1.1 增强版</span>
            <h2>扩展数据集多品种模型</h2>
            <p>在 1.0 原版技术路线基础上扩充犬种和猫种数据，类别规模提升到约 140 类，使任务难度和真实系统覆盖能力更强。</p>
          </div>

          <!-- 1. 模型架构 -->
          <div class="info-block">
          <h2 class="block-title">
            <span class="icon">🧠</span> 模型选择与架构 (Model Architecture)
          </h2>
          <p>
            1.1 增强版继续采用 <strong>EfficientNet-B4</strong> 架构。保持模型结构不变，可以让实验重点集中在数据集扩充与类别规模提升对识别效果的影响上。
          </p>
          <ul>
            <li><strong>主干保持一致：</strong> 与 1.0 原版同样使用 EfficientNet-B4，便于对比不同数据规模下的表现。</li>
            <li><strong>分类头扩展：</strong> 输出类别从 37 类扩展到约 140 类。</li>
            <li><strong>两阶段训练：</strong> 仍采用“冻结骨干预热分类头 → 解冻全网络微调”的训练流程。</li>
          </ul>
        </div>

        <!-- 2. 数据集 -->
        <div class="info-block">
          <h2 class="block-title">
            <span class="icon">📚</span> 训练数据集 (Dataset)
          </h2>
          <p>
            1.1 增强版保留 Oxford-IIIT Pet Dataset 作为基础，同时引入 Stanford Dogs Dataset 与 Kaggle CatBreedsRefined-7k 对犬种和猫种进行扩充。
          </p>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-num">37</div>
              <div class="stat-desc">原版基线类别</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">~140</div>
              <div class="stat-desc">增强版类别数</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">120+</div>
              <div class="stat-desc">扩展犬种规模</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">20+</div>
              <div class="stat-desc">扩展猫种规模</div>
            </div>
          </div>
          <p>
            通过合并多来源数据集，增强版模型不再局限于原始 37 类任务。犬种覆盖明显提升，猫种也通过额外数据集得到补充，使系统在真实使用时能识别更多宠物品种。
          </p>
          <div class="dataset-table">
            <div class="dataset-row header">
              <span>数据集</span>
              <span>用途</span>
              <span>说明</span>
            </div>
            <div class="dataset-row">
              <span>Oxford-IIIT Pet</span>
              <span>原版基线</span>
              <span>37 个猫狗品种，质量高、标注稳定</span>
            </div>
            <div class="dataset-row">
              <span>Stanford Dogs</span>
              <span>犬种扩充</span>
              <span>补充约 120 个犬种，显著提升犬类覆盖</span>
            </div>
            <div class="dataset-row">
              <span>Kaggle CatBreedsRefined-7k</span>
              <span>猫种扩充</span>
              <span>补充多个猫品种，缓解原版猫类类别偏少的问题</span>
            </div>
          </div>
        </div>

        <!-- 3. 数据预处理 -->
        <div class="info-block">
          <h2 class="block-title">
            <span class="icon">⚙️</span> 数据预处理 (Data Preprocessing)
          </h2>
          <p>增强版沿用原版的数据增强策略，并在更大规模的数据集上进行训练，以降低不同来源图片在清晰度、背景、光照上的差异影响：</p>
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
            1.1 增强版的重点不是单纯追求更高准确率，而是在类别数量显著增加的情况下保持较好的泛化能力。
          </p>
          <ul>
            <li><strong>类别规模：</strong> 从 37 类扩展到约 140 类，任务复杂度明显提升。</li>
            <li><strong>当前最佳验证准确率：</strong> 约 <span class="highlight">91.74%</span>。考虑到类别数大幅增加，该结果具备较好的工程可用性。</li>
            <li><strong>ONNX 工程化部署：</strong> 增强版模型已导出为 ONNX 格式。由于新版本导出器采用外部权重存储，部署时需要同时保留 <code>pet_classifier.onnx</code> 与 <code>pet_classifier.onnx.data</code>，并通过 FastAPI + ONNX Runtime 对外提供推理服务。</li>
          </ul>
        </div>

        <!-- 5. 升级意义 -->
        <div class="info-block">
          <h2 class="block-title">
            <span class="icon">🚀</span> 升级意义 (Why Upgrade)
          </h2>
          <p>
            相比原版模型，增强版模型的价值不只是“多识别几个品种”，而是让系统的 AI 任务从小规模课堂级分类问题扩展到更接近真实应用的多类别细粒度识别问题。
          </p>
          <ul>
            <li><strong>类别更多：</strong> 从 37 类扩展到约 140 类，显著提升任务复杂度。</li>
            <li><strong>猫狗更均衡：</strong> 引入额外猫种数据，改善原始数据集中猫品种偏少的问题。</li>
            <li><strong>论文更完整：</strong> 可以形成“原版基线模型 → 数据扩充 → 增强版模型”的实验对比链路。</li>
            <li><strong>系统更实用：</strong> 发布领养、发布寻宠和 AI 识别页面都可以使用更丰富的品种识别结果。</li>
          </ul>
        </div>
        </div>

        <div v-if="activeVersion === 'v2'" class="version-content">
          <div class="version-summary v2">
            <span class="version-tag v2-tag">2.0 PetFace 个体识别</span>
            <h2>MegaDescriptor 宠物个体身份识别模型</h2>
            <p>跨越"品种识别"的边界，从"这是什么品种"升级到"这是哪一只宠物"。基于大规模预训练动物面部描述符，实现宠物个体身份的精准比对与检索，是系统 AI 寻宠功能的核心技术引擎。</p>
          </div>

          <!-- 1. 背景与定位 -->
          <div class="info-block">
            <h2 class="block-title">
              <span class="icon">🎯</span> 技术定位与应用背景
            </h2>
            <p>
              品种识别（1.0/1.1 模型）解决的是"宠物属于哪个类别"的分类问题，精度上限取决于标注的品种数量。
              而 <strong>PetFace 2.0 解决的是"这张照片中的宠物是否与数据库中某只建档宠物是同一只个体"的身份验证问题</strong>，类似于人脸识别中的"1:N 搜索"任务。
            </p>
            <ul>
              <li><strong>核心能力一：同宠验证（1:1）</strong> — 判断两张图片中的宠物是否属于同一个体，可用于宠物身份核验。</li>
              <li><strong>核心能力二：相似检索（1:N）</strong> — 上传一张图片，在系统中所有已建档宠物中检索最相似的个体，直接用于 AI 寻宠功能。</li>
              <li><strong>核心能力三：特征建档</strong> — 用户上传宠物照片后，系统提取其面部嵌入向量并存储，供后续匹配使用。</li>
            </ul>
          </div>

          <!-- 2. 模型架构 -->
          <div class="info-block">
            <h2 class="block-title">
              <span class="icon">🧠</span> 模型架构 (Model Architecture)
            </h2>
            <p>
              PetFace 2.0 采用 <strong>MegaDescriptor-B-224</strong>，由 WildlifeDatasets 团队发布，专为野生/家养动物个体识别设计的大规模预训练描述符模型，托管于 HuggingFace（<code>BVRA/MegaDescriptor-B-224</code>）。
            </p>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-num">512</div>
                <div class="stat-desc">嵌入向量维度</div>
              </div>
              <div class="stat-item">
                <div class="stat-num">224</div>
                <div class="stat-desc">输入图像尺寸 (px)</div>
              </div>
              <div class="stat-item">
                <div class="stat-num">0.75</div>
                <div class="stat-desc">余弦相似度阈值</div>
              </div>
              <div class="stat-item">
                <div class="stat-num">ONNX</div>
                <div class="stat-desc">推理格式</div>
              </div>
            </div>
            <ul>
              <li><strong>主干网络：</strong> 基于 ViT / ConvNeXt 大模型骨干，在海量动物面部图像上进行对比学习预训练。</li>
              <li><strong>描述符范式：</strong> 不依赖分类头，而是将输入图像编码为固定长度的 512 维嵌入向量，通过余弦相似度度量个体间的相似性。</li>
              <li><strong>优势：</strong> 无需针对新宠物重新训练，添加新宠物档案时只需提取其嵌入并存储，即可参与检索。</li>
            </ul>
          </div>

          <!-- 3. 工作流程 -->
          <div class="info-block">
            <h2 class="block-title">
              <span class="icon">⚙️</span> 完整工作流程
            </h2>
            <div class="flow-steps">
              <div class="flow-step">
                <div class="step-num">1</div>
                <div class="step-content">
                  <strong>图像预处理</strong>
                  <span>将输入图像调整为 224×224，使用 ImageNet 统计量标准化（均值 [0.485, 0.456, 0.406]，标准差 [0.229, 0.224, 0.225]）。</span>
                </div>
              </div>
              <div class="flow-step">
                <div class="step-num">2</div>
                <div class="step-content">
                  <strong>特征提取</strong>
                  <span>通过 MegaDescriptor 编码器，将图像压缩为 512 维嵌入向量（embedding），捕获个体的面部纹理、颜色分布、形态特征等细粒度信息。</span>
                </div>
              </div>
              <div class="flow-step">
                <div class="step-num">3</div>
                <div class="step-content">
                  <strong>相似度计算</strong>
                  <span>使用 <strong>余弦相似度（Cosine Similarity）</strong>衡量两个嵌入向量的相似程度，取值范围 [−1, 1]，越接近 1 表示越相似。</span>
                </div>
              </div>
              <div class="flow-step">
                <div class="step-num">4</div>
                <div class="step-content">
                  <strong>阈值判断 / Top-K 排序</strong>
                  <span>同宠验证：similarity ≥ 0.75 判定为同一个体；相似检索：返回相似度最高的前 K 条已建档宠物记录。</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. 数据与建档 -->
          <div class="info-block">
            <h2 class="block-title">
              <span class="icon">📚</span> 建档数据与检索库
            </h2>
            <p>
              与品种识别不同，PetFace 2.0 不依赖固定训练集，其"知识库"由系统中所有已建档宠物的嵌入向量构成，并随用户注册宠物档案而实时增长。
            </p>
            <div class="dataset-table">
              <div class="dataset-row header">
                <span>数据来源</span>
                <span>说明</span>
                <span>存储位置</span>
              </div>
              <div class="dataset-row">
                <span>用户上传宠物头像</span>
                <span>注册宠物档案时上传的主图，系统自动提取嵌入向量</span>
                <span>数据库 PetFaceEmbedding 表</span>
              </div>
              <div class="dataset-row">
                <span>用户上传多张照片</span>
                <span>额外补充的不同角度照片，可提升建档特征的鲁棒性</span>
                <span>Image 表 + 重新触发嵌入提取</span>
              </div>
              <div class="dataset-row">
                <span>查询图片（临时）</span>
                <span>用户寻宠时上传的照片，仅用于即时检索，不存档</span>
                <span>内存（请求生命周期内）</span>
              </div>
            </div>
          </div>

          <!-- 5. 置信度分级 -->
          <div class="info-block">
            <h2 class="block-title">
              <span class="icon">📊</span> 置信度分级与解读
            </h2>
            <p>系统对每条匹配结果给出置信度标签，帮助用户快速判断结果可靠性：</p>
            <div class="confidence-table">
              <div class="conf-row header">
                <span>相似度范围</span>
                <span>置信度标签</span>
                <span>建议操作</span>
              </div>
              <div class="conf-row high">
                <span>≥ 0.75</span>
                <span class="conf-tag high-tag">高置信匹配</span>
                <span>大概率为同一只宠物，建议优先联系主人核实</span>
              </div>
              <div class="conf-row medium">
                <span>0.5 ~ 0.75</span>
                <span class="conf-tag med-tag">疑似匹配</span>
                <span>存在一定相似性，可结合体貌特征人工比对</span>
              </div>
              <div class="conf-row low">
                <span>&lt; 0.5</span>
                <span class="conf-tag low-tag">低相似</span>
                <span>参考价值有限，建议继续发布寻宠启事</span>
              </div>
            </div>
          </div>

          <!-- 6. 部署架构 -->
          <div class="info-block">
            <h2 class="block-title">
              <span class="icon">🚀</span> 部署架构与服务集成
            </h2>
            <p>PetFace 2.0 以独立微服务形式部署，通过 HTTP API 与 Java SpringBoot 后端通信：</p>
            <div class="code-block">
              <div class="code-line"><strong>AI推理服务：</strong> FastAPI + ONNX Runtime（Python 3.10+）</div>
              <div class="code-line"><strong>模型文件：</strong> petface_id_megadescriptor.onnx + .onnx.data（外部权重文件，需同目录）</div>
              <div class="code-line"><strong>服务端口：</strong> 默认 8081（独立于主后端 8080 端口）</div>
              <div class="code-line"><strong>接口列表：</strong></div>
              <div class="code-line">&nbsp;&nbsp;POST /api/petface/embed &nbsp; — 提取单张图片的嵌入向量</div>
              <div class="code-line">&nbsp;&nbsp;POST /api/petface/verify — 同宠验证（双图比对）</div>
              <div class="code-line"><strong>后端代理：</strong> Java PetFaceService 统一调用 AI 服务，并将嵌入向量存储到 MySQL</div>
              <div class="code-line"><strong>检索逻辑：</strong> Java 侧读取所有宠物嵌入，进行 Top-K 余弦相似度排序，无需 AI 服务参与</div>
            </div>
          </div>

          <!-- 7. 升级意义 -->
          <div class="info-block">
            <h2 class="block-title">
              <span class="icon">💡</span> 技术价值与升级意义
            </h2>
            <ul>
              <li><strong>从分类到身份：</strong> 品种识别是分类任务（多对一），个体识别是身份验证任务（一对一），后者在宠物失踪找回场景中具有更直接的实用价值。</li>
              <li><strong>开放集友好：</strong> MegaDescriptor 基于度量学习，不需要为每只新宠物添加训练数据，系统用户注册即建档、建档即可被检索，天然支持开放集场景。</li>
              <li><strong>多模态特征融合：</strong> 支持上传多张不同角度照片，系统取嵌入平均或以最佳图为准，提升建档鲁棒性。</li>
              <li><strong>全链路闭环：</strong> 注册宠物 → AI 建档 → 宠物丢失 → 上传照片 → AI 检索 → 返回疑似档案 → 联系主人，完整的寻宠闭环均在系统内完成。</li>
              <li><strong>可解释性：</strong> 每次匹配结果均附带相似度百分比与置信度标签，用户可自行判断可靠性。</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const goBack = () => router.back()
const activeVersion = ref<'v1' | 'v11' | 'v2'>('v1')
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

.version-switch {
  display: flex;
  gap: 10px;
  margin: -18px 0 28px;
  padding: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.version-switch button {
  flex: 1;
  height: 42px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #475569;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
}

.version-switch button.active {
  background: #00a8e8;
  color: #fff;
  box-shadow: 0 4px 14px rgba(0, 168, 232, 0.22);
}

.version-content {
  animation: fadeIn 0.18s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.version-summary {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
  padding: 20px;
  margin-bottom: 34px;
}

.version-summary.upgraded {
  border-color: #bae6fd;
  background: #f0f9ff;
}

.version-tag {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #334155;
  font-size: 12px;
  font-weight: 800;
}

.version-summary.upgraded .version-tag {
  background: #dbeafe;
  color: #0369a1;
}

.version-summary h2 {
  margin: 12px 0 8px;
  color: #1a1a1a;
  font-size: 22px;
}

.version-summary p {
  margin: 0;
  color: #555;
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

.dataset-table {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 18px;
}

.dataset-row {
  display: grid;
  grid-template-columns: 1.35fr 0.9fr 2fr;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid #edf2f7;
  align-items: center;
}

.dataset-row:last-child {
  border-bottom: none;
}

.dataset-row.header {
  background: #f8fafc;
  color: #334155;
  font-weight: 800;
}

.dataset-row span {
  min-width: 0;
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

/* === 2.0 特有样式 === */
.version-summary.v2 {
  border-color: #d1fae5;
  background: #f0fdf4;
}

.version-tag.v2-tag {
  background: #dcfce7;
  color: #15803d;
}

.flow-steps {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 14px;
}

.flow-step {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.step-num {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #00a8e8;
  color: #fff;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 4px;
}

.step-content strong {
  color: #1a1a1a;
  font-size: 15px;
}

.step-content span {
  color: #555;
  font-size: 14px;
  line-height: 1.6;
}

.confidence-table {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 14px;
}

.conf-row {
  display: grid;
  grid-template-columns: 1.2fr 1.2fr 2fr;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid #edf2f7;
  align-items: center;
}

.conf-row:last-child {
  border-bottom: none;
}

.conf-row.header {
  background: #f8fafc;
  color: #334155;
  font-weight: 800;
}

.conf-tag {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.high-tag { background: #dcfce7; color: #15803d; }
.med-tag  { background: #dbeafe; color: #1d4ed8; }
.low-tag  { background: #fef3c7; color: #92400e; }

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dataset-row,
  .conf-row {
    grid-template-columns: 1fr;
  }

  .version-switch {
    flex-direction: column;
  }
}
</style>
