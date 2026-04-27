# 智能宠物管理系统 · 前端

Vue 3 + TypeScript 单页应用，提供宠物领养、寻宠、论坛、个人中心等功能界面。

## 技术栈

- **Vue 3** · Composition API
- **Vite 7** 构建工具
- **TypeScript 5.9**
- **Vue Router 5** 路由管理
- **Pinia 3** 状态管理
- **Axios** HTTP 请求

## 本地运行

```bash
npm install
npm run dev
# 访问 http://localhost:5173
```

> 依赖后端服务运行在 `http://localhost:8080`，请先启动后端。

## 其他命令

```bash
npm run build       # 生产构建
npm run type-check  # TypeScript 类型检查
npm run preview     # 预览生产构建
```

## 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | Home | 首页 |
| `/adoption` | Adoption | 领养帖列表 |
| `/PostAdoption` | PostAdoption | 发布领养帖 |
| `/lost` | Lost | 寻宠帖列表 |
| `/PostLost` | PostLost | 发布寻宠帖 |
| `/forum` | Forum | 论坛 |
| `/personal` | Personal | 个人中心 |

登录 / 注册以弹窗形式集成在导航栏（`NavBar.vue`）。

## 项目结构

```
src/
├── views/          # 页面组件
│   ├── Home.vue          # 首页
│   ├── Adoption.vue      # 领养列表
│   ├── PostAdoption.vue  # 发布领养帖
│   ├── Lost.vue          # 寻宠列表
│   ├── PostLost.vue      # 发布寻宠帖
│   ├── Forum.vue         # 论坛
│   └── Personal.vue      # 个人中心
├── components/
│   └── NavBar.vue        # 顶部导航（含登录/注册弹窗）
├── router/
│   └── index.ts          # 路由配置 + 登录守卫
├── stores/
│   └── counter.ts        # Pinia 状态
├── api/
│   └── request.js        # Axios 封装
└── utils/                # 工具函数（收藏、论坛帖子等）
```

## 接口对接

前端通过 `src/api/request.js` 统一请求后端 `http://localhost:8080`。

需要认证的请求会自动在 Header 中附加 `Authorization: Bearer <token>`（token 存储在 `localStorage`）。

## 开发进度

### ✅ 已完成

- [x] 首页展示
- [x] 用户注册 / 登录（NavBar 弹窗）
- [x] JWT Token 本地存储与自动携带
- [x] 领养帖子列表 + 发布
- [x] 寻宠帖子列表 + 发布
- [x] 论坛页面
- [x] 个人中心页面
- [x] 路由登录守卫

### 📋 待完成

- [ ] 宠物档案管理页（绑定后端 `/api/pet/*`）
- [ ] AI 品种识别页（上传图片 → 展示识别结果）
- [ ] AI 行为分析页
- [ ] 收藏功能（连接后端接口）
- [ ] 消息通知页
- [ ] 健康管理页（体重曲线、疫苗记录）
