# 智能宠物管理系统 · 前端

Vue 3 + TypeScript 单页应用，面向毕业设计场景，提供宠物领养/救助、寻宠大厅、AI 寻宠、AI 品种识别、宠物档案、实时定位、论坛和个人中心等完整界面。

## 技术栈

- **Vue 3** · Composition API
- **Vite 7** 构建工具
- **TypeScript 5.9**
- **Vue Router** 路由管理
- **Pinia** 状态管理
- **Axios** HTTP 请求
- **Leaflet** 地图定位展示

## 本地运行

```bash
npm install
npm run dev
```

默认访问：

```text
http://localhost:5173
```

前端依赖：

- Spring Boot 后端：`http://localhost:8080`
- Python AI 服务：由后端间接调用，默认 `http://localhost:8000`

## 常用命令

```bash
npm run build       # 生产构建
npm run type-check  # TypeScript 类型检查
npm run preview     # 预览生产构建
```

## 页面路由

| 路径 | 页面 | 说明 |
| --- | --- | --- |
| `/` | 首页 | 系统入口与核心功能引导 |
| `/adoption` | 领养/救助 | 领养救助大厅、发布入口、收藏入口 |
| `/PostAdoption` | 发布领养帖 | 上传图片后可自动调用 AI 识别辅助填写 |
| `/lost` | 寻宠 | 包含“寻宠大厅”和“AI 寻宠”两个模式 |
| `/PostLost` | 发布寻宠启事 | 寻宠信息发布，图片上传后辅助识别宠物类型/品种 |
| `/ai-recognize` | AI识别 | 1.0/1.1 品种识别结果展示，含 Top5 进度条 |
| `/ai-model-info` | 模型说明 | 展示 1.0、1.1 与 PetFace 2.0 技术说明 |
| `/pet-directory` | 宠物档案 | 已建档宠物大厅，支持查看主人联系方式 |
| `/pet-profile` | 我的宠物 | 我的宠物档案管理，多图建档与个体特征重建入口 |
| `/pet-location` | 实时定位 | 宠物定位追踪与轨迹回放 |
| `/forum` | 论坛 | 社区交流 |
| `/personal` | 个人中心 | 我的发布、收藏、宠物、退出登录 |

登录 / 注册以弹窗形式集成在导航栏（`NavBar.vue`）。

## 当前核心闭环

### 1. AI 寻宠闭环

```text
宠物建档 -> 上传多张宠物照片 -> 后端提取 PetFace 特征 -> 用户上传寻宠照片
-> 系统检索相似宠物 -> 展示疑似档案与主人电话 -> 可继续发布寻宠启事
```

前端主要入口：

- `宠物档案`：查看系统已建档宠物
- `我的宠物`：新增/编辑宠物档案，触发个体特征建立
- `寻宠 -> AI寻宠`：上传图片检索相似宠物
- `发布寻宠启事`：未匹配时继续发布寻宠帖子

### 2. AI 品种识别闭环

```text
上传宠物图片 -> Python AI 服务识别类型/品种 -> 前端展示 Top5 概率
-> 发布领养/寻宠时自动辅助填写宠物类型和品种
```

AI识别页面支持：

- 1.0 原版模型说明：Oxford-IIIT Pet，37 类
- 1.1 增强版模型说明：扩展到 140 类，猫 20 类、狗 120 类
- PetFace 2.0 说明：个体识别、相似检索、同宠验证

## 项目结构

```text
src/
├── api/
│   └── request.js              # Axios 封装
├── components/
│   └── NavBar.vue              # 顶部导航、登录/注册弹窗
├── router/
│   └── index.ts                # 路由配置与登录守卫
├── utils/
│   ├── aiRecognition.ts        # AI 品种识别与 PetFace 检索请求
│   └── favorites.ts            # 收藏本地状态辅助
└── views/
    ├── Home.vue                # 首页
    ├── Adoption.vue            # 领养/救助大厅
    ├── PostAdoption.vue        # 发布领养帖
    ├── Lost.vue                # 寻宠大厅 + AI 寻宠
    ├── PostLost.vue            # 发布寻宠启事
    ├── AiRecognize.vue         # AI 品种识别
    ├── AiModelInfo.vue         # 模型技术说明
    ├── PetDirectory.vue        # 宠物档案大厅
    ├── PetProfile.vue          # 我的宠物档案
    ├── PetLocation.vue         # 实时定位
    ├── Forum.vue               # 论坛
    └── Personal.vue            # 个人中心
```

## 接口对接

前端通过 `src/api/request.js` 统一请求后端：

```text
http://localhost:8080
```

需要认证的请求会自动在 Header 中附加：

```text
Authorization: Bearer <token>
```

token 存储在 `localStorage`。

## 已完成能力

- [x] 用户注册 / 登录 / JWT 本地持久化
- [x] 首页、导航栏、个人中心
- [x] 领养/救助帖子列表、发布、收藏
- [x] 寻宠大厅与寻宠启事发布
- [x] AI 寻宠：上传图片检索已建档宠物
- [x] AI 品种识别：Top5 概率与进度条展示
- [x] AI 模型说明：1.0、1.1、PetFace 2.0 可切换说明
- [x] 宠物档案大厅
- [x] 我的宠物档案管理
- [x] 宠物多图建档与特征状态展示
- [x] 实时定位与轨迹回放页面
- [x] 论坛页面

## 部署提醒

前端代码可直接通过 GitHub 同步，但完整运行还依赖后端数据库、上传图片和 Python 模型资产。部署时请同时参考后端仓库文档：

```text
backEnd/docs/部署资产同步说明_20260519.md
```

