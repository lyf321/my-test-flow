# TapNow 复刻完整技术选型方案

## 📋 目录

1. [技术选型总览](#技术选型总览)
2. [前端技术栈](#前端技术栈)
3. [后端技术栈](#后端技术栈)
4. [数据库选型](#数据库选型)
5. [AI 模型集成](#ai-模型集成)
6. [文件存储方案](#文件存储方案)
7. [实时协作方案](#实时协作方案)
8. [部署架构](#部署架构)
9. [开发路线图](#开发路线图)
10. [成本估算](#成本估算)

---

## 技术选型总览

### 🏆 推荐技术栈（全栈方案）

```
前端：Vue 3 + TypeScript + Vue Flow
后端：Node.js + TypeScript + Express/Fastify
数据库：PostgreSQL + Redis
文件存储：MinIO / AWS S3
AI 集成：Python 微服务 + FastAPI
实时协作：WebSocket (Socket.io)
任务队列：BullMQ / Celery
```

### 核心架构图

```
┌─────────────────────────────────────────────────────────┐
│                     前端层 (Vue 3)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 工作流编辑器  │  │  模板管理    │  │  社区浏览    │  │
│  │  (Vue Flow)  │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                        ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────┐
│                    API 网关层 (Nginx)                     │
└─────────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────────┐
│                   后端服务层 (Node.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 工作流服务   │  │  用户服务     │  │  社区服务     │  │
│  │  (Express)  │  │  (Express)   │  │  (Express)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────────┐
│                  AI 服务层 (Python)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 图像生成服务 │  │  视频生成服务 │  │  分镜解析服务 │  │
│  │  (FastAPI)   │  │  (FastAPI)   │  │  (FastAPI)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────────┐
│                   数据存储层                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ PostgreSQL   │  │    Redis     │  │   MinIO/S3   │  │
│  │  (主数据库)   │  │  (缓存/队列) │  │  (文件存储)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 前端技术栈

### 🏆 核心推荐：Vue 3 + TypeScript

**理由：**
- ✅ 您当前项目已使用 Vue 3
- ✅ Vue Flow 完美支持节点式工作流
- ✅ TypeScript 提供类型安全
- ✅ 生态成熟，开发效率高

### 技术选型详情

#### 1. 核心框架

```json
{
  "vue": "^3.5.0",
  "@vue-flow/core": "^1.48.0",
  "@vue-flow/background": "^1.3.2",
  "@vue-flow/controls": "^1.1.3",
  "@vue-flow/minimap": "^1.5.4",
  "typescript": "^5.9.0"
}
```

**为什么选择 Vue Flow 而不是 AntV X6？**
- ✅ 开发效率高 40-50%（见 [成本分析](./NODE_CONFIG_COST_ANALYSIS.md)）
- ✅ 原生 Vue 响应式，代码简洁
- ✅ 维护成本低
- ✅ 完全符合 Vue 开发习惯

#### 2. UI 组件库

**推荐方案 A：Element Plus**（推荐）
```bash
npm install element-plus @element-plus/icons-vue
```

**优势：**
- ✅ 组件丰富，覆盖所有需求
- ✅ 文档完善，中文支持好
- ✅ 与 Vue 3 完美集成
- ✅ 社区活跃

**推荐方案 B：Ant Design Vue**
```bash
npm install ant-design-vue
```

**优势：**
- ✅ 企业级组件库
- ✅ 设计规范统一
- ✅ 功能强大

**推荐方案 C：Naive UI**
```bash
npm install naive-ui
```

**优势：**
- ✅ 轻量级
- ✅ TypeScript 支持好
- ✅ 性能优秀

#### 3. 状态管理

**推荐：Pinia**（已使用）
```bash
npm install pinia
```

**理由：**
- ✅ Vue 3 官方推荐
- ✅ TypeScript 支持完善
- ✅ 比 Vuex 更简洁
- ✅ 您已在使用

#### 4. 路由管理

**推荐：Vue Router**
```bash
npm install vue-router@4
```

#### 5. HTTP 客户端

**推荐：Axios**
```bash
npm install axios
```

#### 6. 表单验证

**推荐：VeeValidate**
```bash
npm install vee-validate yup
```

#### 7. 实时通信

**推荐：Socket.io Client**
```bash
npm install socket.io-client
```

#### 8. 工具库

```bash
npm install lodash-es dayjs nanoid
```

### 前端项目结构

```
frontend/
├── src/
│   ├── components/
│   │   ├── workflow/
│   │   │   ├── WorkflowEditor.vue      # 主编辑器
│   │   │   ├── NodeConfigPanel.vue     # 节点配置面板
│   │   │   ├── TemplateManager.vue     # 模板管理
│   │   │   └── VersionManager.vue      # 版本管理
│   │   ├── community/
│   │   │   ├── WorkflowGallery.vue     # 作品画廊
│   │   │   └── WorkflowDetail.vue     # 作品详情
│   │   └── common/
│   ├── composables/
│   │   ├── useWorkflowTemplate.ts      # 模板管理
│   │   ├── useWorkflowVersion.ts       # 版本管理
│   │   ├── useWorkflowExecutor.ts      # 工作流执行
│   │   └── useRealtimeSync.ts          # 实时同步
│   ├── stores/
│   │   ├── workflow.ts                 # 工作流状态
│   │   ├── user.ts                     # 用户状态
│   │   └── community.ts               # 社区状态
│   ├── services/
│   │   ├── api.ts                      # API 封装
│   │   ├── websocket.ts                # WebSocket
│   │   └── storage.ts                  # 文件上传
│   ├── types/
│   │   ├── workflow.ts                 # 工作流类型
│   │   └── node.ts                     # 节点类型
│   └── utils/
├── package.json
└── vite.config.ts
```

---

## 后端技术栈

### 🏆 核心推荐：Node.js + TypeScript + Express

**理由：**
- ✅ 与前端技术栈统一（TypeScript）
- ✅ 开发效率高
- ✅ 生态丰富
- ✅ 适合实时应用（WebSocket）

### 技术选型详情

#### 1. 核心框架

**方案 A：Express**（推荐）
```bash
npm install express
npm install -D @types/express
```

**优势：**
- ✅ 成熟稳定
- ✅ 生态丰富
- ✅ 学习成本低
- ✅ 中间件丰富

**方案 B：Fastify**
```bash
npm install fastify
```

**优势：**
- ✅ 性能更好（2-3倍）
- ✅ 类型支持好
- ✅ 现代化设计

**方案 C：NestJS**
```bash
npm install @nestjs/core @nestjs/common
```

**优势：**
- ✅ 企业级框架
- ✅ 依赖注入
- ✅ 模块化设计
- ✅ 适合大型项目

#### 2. 数据库 ORM

**推荐：Prisma**（推荐）
```bash
npm install prisma @prisma/client
```

**优势：**
- ✅ TypeScript 支持完美
- ✅ 类型安全
- ✅ 迁移管理方便
- ✅ 开发体验好

**备选：TypeORM**
```bash
npm install typeorm
```

#### 3. 任务队列

**推荐：BullMQ**
```bash
npm install bullmq ioredis
```

**用途：**
- 工作流异步执行
- AI 模型调用队列
- 文件处理任务

**备选：Agenda**
```bash
npm install agenda
```

#### 4. WebSocket

**推荐：Socket.io**
```bash
npm install socket.io
```

**用途：**
- 实时协作编辑
- 工作流执行状态推送
- 通知推送

#### 5. 文件上传

**推荐：Multer**
```bash
npm install multer
npm install -D @types/multer
```

#### 6. 认证授权

**推荐：JWT**
```bash
npm install jsonwebtoken
npm install bcryptjs
```

#### 7. API 文档

**推荐：Swagger**
```bash
npm install swagger-jsdoc swagger-ui-express
```

### 后端项目结构

```
backend/
├── src/
│   ├── controllers/
│   │   ├── workflow.controller.ts      # 工作流控制器
│   │   ├── template.controller.ts     # 模板控制器
│   │   ├── user.controller.ts          # 用户控制器
│   │   └── community.controller.ts    # 社区控制器
│   ├── services/
│   │   ├── workflow.service.ts         # 工作流服务
│   │   ├── execution.service.ts        # 执行服务
│   │   ├── template.service.ts         # 模板服务
│   │   └── ai.service.ts              # AI 服务代理
│   ├── models/
│   │   ├── workflow.model.ts           # 工作流模型
│   │   ├── template.model.ts          # 模板模型
│   │   └── user.model.ts              # 用户模型
│   ├── middleware/
│   │   ├── auth.middleware.ts         # 认证中间件
│   │   └── error.middleware.ts        # 错误处理
│   ├── routes/
│   │   ├── workflow.routes.ts         # 工作流路由
│   │   └── user.routes.ts             # 用户路由
│   ├── utils/
│   │   ├── logger.ts                  # 日志工具
│   │   └── validator.ts              # 验证工具
│   └── config/
│       ├── database.ts                # 数据库配置
│       └── redis.ts                   # Redis 配置
├── prisma/
│   └── schema.prisma                  # 数据库模型
└── package.json
```

---

## 数据库选型

### 🏆 主数据库：PostgreSQL

**理由：**
- ✅ 功能强大，支持复杂查询
- ✅ JSON 支持好（存储工作流配置）
- ✅ 事务支持完善
- ✅ 扩展性强
- ✅ 开源免费

### 缓存数据库：Redis

**用途：**
- 会话存储
- 任务队列
- 实时数据缓存
- 限流控制

### 数据库设计

#### 核心表结构

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 工作流表
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  nodes JSONB NOT NULL,
  edges JSONB NOT NULL,
  global_variables JSONB,
  visibility VARCHAR(20) DEFAULT 'private',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 模板表
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  thumbnail_url TEXT,
  nodes JSONB NOT NULL,
  edges JSONB NOT NULL,
  parameters JSONB,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 版本表
CREATE TABLE workflow_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id),
  version VARCHAR(50) NOT NULL,
  snapshot JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 执行记录表
CREATE TABLE executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id),
  user_id UUID REFERENCES users(id),
  status VARCHAR(20) NOT NULL,
  result JSONB,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 社区作品表
CREATE TABLE shared_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  tags TEXT[],
  thumbnail_url TEXT,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  fork_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## AI 模型集成

### 🏆 推荐方案：Python 微服务 + FastAPI

**理由：**
- ✅ Python 是 AI 模型的标准语言
- ✅ 丰富的 AI 库生态
- ✅ FastAPI 性能好，类型支持好
- ✅ 易于集成各种 AI 模型

### 技术选型

#### 1. Web 框架

**推荐：FastAPI**
```bash
pip install fastapi uvicorn
```

**优势：**
- ✅ 性能优秀（基于 Starlette）
- ✅ 自动生成 API 文档
- ✅ 类型支持好
- ✅ 异步支持

#### 2. AI 模型库

```bash
# 图像生成
pip install diffusers transformers torch

# 视频处理
pip install opencv-python moviepy

# 图像处理
pip install pillow numpy

# 分镜解析
pip install opencv-python-python
```

#### 3. 模型管理

**推荐：Hugging Face**
```bash
pip install huggingface-hub
```

### AI 服务架构

```
ai-services/
├── image_generation/
│   ├── main.py                    # FastAPI 服务
│   ├── models/
│   │   ├── stable_diffusion.py   # SD 模型
│   │   └── midjourney.py         # MJ 模型
│   └── requirements.txt
├── video_generation/
│   ├── main.py
│   └── models/
│       └── video_gen.py
├── shot_analysis/
│   ├── main.py
│   └── models/
│       └── shot_parser.py
└── docker-compose.yml
```

### 与后端集成

**通过 HTTP API 调用：**
```typescript
// backend/src/services/ai.service.ts
export class AIService {
  async generateImage(prompt: string, config: ImageConfig) {
    const response = await axios.post('http://ai-service:8000/generate', {
      prompt,
      config
    })
    return response.data
  }
}
```

---

## 文件存储方案

### 🏆 推荐方案 A：MinIO（自托管）

**优势：**
- ✅ S3 兼容 API
- ✅ 开源免费
- ✅ 可自托管
- ✅ 性能好

**部署：**
```yaml
# docker-compose.yml
services:
  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: password
    volumes:
      - minio_data:/data
```

### 推荐方案 B：AWS S3（云服务）

**优势：**
- ✅ 稳定可靠
- ✅ 全球 CDN
- ✅ 自动备份
- ✅ 企业级支持

### 文件上传实现

```typescript
// backend/src/services/storage.service.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export class StorageService {
  async uploadFile(file: Buffer, key: string) {
    const client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY
      }
    })
    
    await client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: file
    }))
    
    return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`
  }
}
```

---

## 实时协作方案

### 🏆 推荐：Socket.io

**实现实时协作编辑：**

```typescript
// backend/src/services/realtime.service.ts
import { Server } from 'socket.io'

export class RealtimeService {
  private io: Server
  
  setup(server: any) {
    this.io = new Server(server, {
      cors: { origin: '*' }
    })
    
    this.io.on('connection', (socket) => {
      socket.on('join-workflow', (workflowId) => {
        socket.join(`workflow:${workflowId}`)
      })
      
      socket.on('node-update', (data) => {
        socket.to(`workflow:${data.workflowId}`).emit('node-updated', data)
      })
    })
  }
}
```

```typescript
// frontend/src/composables/useRealtimeSync.ts
import { io } from 'socket.io-client'

export function useRealtimeSync(workflowId: string) {
  const socket = io('http://localhost:3000')
  
  socket.emit('join-workflow', workflowId)
  
  socket.on('node-updated', (data) => {
    // 更新节点
    updateNode(data.nodeId, data.node)
  })
  
  const syncNodeUpdate = (nodeId: string, node: Node) => {
    socket.emit('node-update', {
      workflowId,
      nodeId,
      node
    })
  }
  
  return { syncNodeUpdate }
}
```

---

## 部署架构

### 🏆 推荐：Docker + Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  # 前端
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
  
  # 后端
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/tapnow
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
  
  # 数据库
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=tapnow
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  # Redis
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
  
  # MinIO
  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
  
  # AI 服务
  ai-service:
    build: ./ai-services
    ports:
      - "8000:8000"
    volumes:
      - ./models:/app/models

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### 生产环境部署

**推荐：Kubernetes**

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tapnow-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: backend
        image: tapnow/backend:latest
        ports:
        - containerPort: 3000
```

---

## 开发路线图

### 阶段一：MVP（2-3 个月）

**目标：** 核心工作流编辑和执行功能

1. **前端（4-6 周）**
   - ✅ 工作流编辑器（Vue Flow）
   - ✅ 节点配置面板
   - ✅ 基础节点类型（5-10 种）
   - ✅ 工作流保存/加载

2. **后端（4-6 周）**
   - ✅ 用户系统（注册/登录）
   - ✅ 工作流 CRUD API
   - ✅ 工作流执行引擎
   - ✅ 基础 AI 集成（1-2 个模型）

3. **数据库（1 周）**
   - ✅ 数据库设计
   - ✅ Prisma 模型定义
   - ✅ 迁移脚本

### 阶段二：增强功能（2-3 个月）

1. **模板系统**（3-4 周）
   - 模板创建/编辑
   - 模板市场
   - 参数化配置

2. **版本管理**（2-3 周）
   - 版本保存
   - 版本对比
   - 版本回滚

3. **社区功能**（3-4 周）
   - 作品发布
   - 作品浏览
   - 点赞/收藏

### 阶段三：高级功能（2-3 个月）

1. **实时协作**（3-4 周）
   - WebSocket 集成
   - 多人编辑
   - 冲突解决

2. **AI 模型扩展**（4-6 周）
   - 更多模型集成
   - 模型管理
   - 性能优化

3. **高级功能**（4-6 周）
   - 分镜解析
   - 批量处理
   - 工作流调度

---

## 成本估算

### 开发成本

| 阶段 | 时间 | 人力 | 成本（假设 2 人） |
|------|------|------|------------------|
| MVP | 2-3 月 | 2 人 | 20-30 万 |
| 增强功能 | 2-3 月 | 2 人 | 20-30 万 |
| 高级功能 | 2-3 月 | 2 人 | 20-30 万 |
| **总计** | **6-9 月** | **2 人** | **60-90 万** |

### 基础设施成本（月）

| 服务 | 规格 | 月成本 |
|------|------|--------|
| 服务器（自托管） | 4核8G × 3 | 500-1000 元 |
| 云服务器（阿里云） | 4核8G × 3 | 1500-2000 元 |
| 数据库（RDS） | 2核4G | 500-800 元 |
| 对象存储（OSS） | 100GB | 100-200 元 |
| CDN | 100GB 流量 | 200-300 元 |
| **总计（自托管）** | | **800-1300 元/月** |
| **总计（云服务）** | | **2300-3300 元/月** |

### AI 模型成本

| 模型 | 调用方式 | 成本 |
|------|---------|------|
| Stable Diffusion | 自部署 | 服务器成本 |
| Midjourney API | API 调用 | $0.04-0.08/图 |
| OpenAI DALL-E | API 调用 | $0.02-0.04/图 |

---

## 技术选型总结

### 🏆 最终推荐技术栈

```
前端：
  - Vue 3 + TypeScript + Vue Flow
  - Element Plus / Ant Design Vue
  - Pinia + Vue Router
  - Socket.io Client

后端：
  - Node.js + TypeScript + Express
  - Prisma + PostgreSQL
  - Redis + BullMQ
  - Socket.io

AI 服务：
  - Python + FastAPI
  - Hugging Face / Diffusers
  - 自部署模型

存储：
  - MinIO（自托管）或 AWS S3
  - PostgreSQL（主数据库）
  - Redis（缓存/队列）

部署：
  - Docker + Docker Compose
  - Kubernetes（生产环境）
```

### 为什么这个技术栈？

1. **技术统一**：前后端都用 TypeScript，降低学习成本
2. **开发效率**：Vue Flow 开发效率高 40-50%
3. **生态成熟**：所有技术都有成熟生态
4. **可扩展性**：微服务架构，易于扩展
5. **成本可控**：大部分开源，成本可控

---

## 快速开始

### 1. 初始化项目

```bash
# 前端
cd frontend
npm create vite@latest . -- --template vue-ts
npm install @vue-flow/core @vue-flow/background @vue-flow/controls
npm install element-plus pinia vue-router axios

# 后端
cd backend
npm init -y
npm install express prisma @prisma/client
npm install socket.io bullmq ioredis
npm install -D typescript @types/node @types/express

# AI 服务
cd ai-services
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn diffusers
```

### 2. 数据库初始化

```bash
cd backend
npx prisma init
npx prisma migrate dev
```

### 3. 启动开发

```bash
# 前端
cd frontend
npm run dev

# 后端
cd backend
npm run dev

# AI 服务
cd ai-services
uvicorn main:app --reload
```

---

*最后更新：2024年*

