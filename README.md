# Vue 工作流编辑器对比项目

这个项目实现了两个不同的工作流编辑器，用于对比 AntV X6 和 Vue Flow 的能力和效果。

## 功能特性

### 两个编辑器都实现了：

1. ✅ **基础画布** - 节点拖拽、连线创建
2. ✅ **撤销/重做** - 历史记录管理
3. ✅ **自动对齐** - AntV X6 内置，Vue Flow 需自己实现
4. ✅ **节点分组** - AntV X6 内置，Vue Flow 需自己实现
5. ✅ **右键菜单** - AntV X6 插件支持，Vue Flow 需自己实现
6. ✅ **快捷键系统** - 复制、粘贴、删除、全选、撤销、重做
7. ✅ **连线规则验证** - 防止循环、自连接
8. ✅ **缩略图** - 两个都有插件支持
9. ✅ **背景网格** - 两个都支持

## 快速开始

### 安装依赖

```bash
cd vue-editors
npm install
```

**注意**：本项目使用 **AntV X6 3.x** 版本，确保安装的是 3.x 版本。

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3001 查看对比页面。

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
vue-editors/
├── src/
│   ├── components/
│   │   ├── x6/
│   │   │   └── WorkflowEditor.vue      # AntV X6 编辑器
│   │   └── vueflow/
│   │       ├── WorkflowEditor.vue      # Vue Flow 编辑器
│   │       ├── nodes/                  # 节点组件
│   │       └── ContextMenu.vue          # 右键菜单
│   ├── composables/
│   │   ├── useHistory.ts               # 撤销/重做
│   │   ├── useLineRules.ts             # X6 连线规则
│   │   └── useLineRulesVueFlow.ts      # Vue Flow 连线规则
│   ├── stores/
│   │   └── editor.ts                   # Pinia store
│   ├── types/
│   │   └── workflow.ts                 # 类型定义
│   ├── data/
│   │   └── initial-data.ts             # 初始数据
│   ├── App.vue                         # 主应用组件
│   └── main.ts                         # 入口文件
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 对比说明

### AntV X6

**优势：**
- ✅ 所有功能开箱即用（自动对齐、节点分组、右键菜单等）
- ✅ 代码量少（约 200 行实现完整功能）
- ✅ 开发时间短（2-3周）
- ✅ 生产环境验证，稳定可靠

**实现方式：**
- 使用官方插件快速集成
- 配置简单，API 清晰

### Vue Flow

**优势：**
- ✅ Vue 原生支持，组件化程度高
- ✅ 响应式数据绑定
- ✅ 学习成本低

**劣势：**
- ❌ 需要自己实现很多功能（自动对齐、节点分组、右键菜单等）
- ❌ 代码量多（约 1000+ 行）
- ❌ 开发时间长（4-6周）

**实现方式：**
- 需要自己实现核心功能
- 使用 composables 和组件封装

## 使用说明

1. 打开页面后，可以通过顶部标签切换两个编辑器
2. 每个编辑器都有工具栏，可以测试基本功能
3. 尝试拖拽节点、创建连线、使用快捷键等
4. 对比两个编辑器的交互体验和功能完整性

## 快捷键

两个编辑器都支持以下快捷键：

- `Ctrl/Cmd + Z` - 撤销
- `Ctrl/Cmd + Shift + Z` - 重做
- `Ctrl/Cmd + C` - 复制
- `Ctrl/Cmd + V` - 粘贴
- `Ctrl/Cmd + A` - 全选
- `Delete/Backspace` - 删除选中节点
- `Ctrl/Cmd + G` - 节点分组（仅 AntV X6）

## 参考文档

- [AntV X6 官方文档](https://x6.antv.antgroup.com/)
- [Vue Flow 官方文档](https://vueflow.dev/)
- [对比分析文档](../ANTV_X6_VS_VUE_FLOW.md)
- [AntV X6 快速开始](../ANTV_X6_QUICKSTART.md)
- [Vue Flow 快速开始](../VUE_FLOW_QUICKSTART.md)

