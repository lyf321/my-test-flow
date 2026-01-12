# Vue Flow 快速开始指南

## 1. 项目初始化

### 基础项目结构

```
src/
├── components/
│   ├── vueflow/
│   │   ├── WorkflowEditor.vue      # 主编辑器组件
│   │   ├── ContextMenu.vue          # 右键菜单组件
│   │   ├── Sidebar.vue              # 右侧边栏（节点详情面板）
│   │   ├── NodeSelector.vue         # 节点选择器（加号弹窗）
│   │   └── nodes/
│   │       ├── StartNode.vue        # 开始节点
│   │       ├── EndNode.vue          # 结束节点
│   │       ├── ConditionNode.vue    # 条件节点
│   │       └── ...                  # 其他节点类型
├── composables/
│   ├── useHistory.ts                # 撤销/重做功能
│   ├── useLineRulesVueFlow.ts      # 连线规则验证
│   ├── useNodeSelector.ts          # 节点选择器逻辑
│   └── useSidebar.ts               # 右侧边栏管理
├── stores/
│   └── editor.ts                   # Pinia store
├── types/
│   ├── node.ts                     # 节点类型定义
│   ├── edge.ts                     # 连线类型定义
│   └── workflow.ts                 # 工作流类型定义
└── utils/
    ├── node-utils.ts               # 节点工具函数
    └── graph-utils.ts              # 图算法工具（循环检测等）
```

### 依赖安装

```bash
npm install @vue-flow/core @vue-flow/background @vue-flow/controls @vue-flow/minimap
```

## 2. 核心功能实现

### 2.1 ✅ 自动对齐（Snap to Grid）

**功能说明**：节点拖拽时自动对齐到网格，提供视觉对齐辅助线。

**实现方式**：
- 使用 Vue Flow 内置的 `snap-to-grid` 和 `snap-grid` 属性
- 配置网格大小为 `[20, 20]`

**代码示例**：
```vue
<VueFlow
  :snap-to-grid="true"
  :snap-grid="[20, 20]"
>
```

### 2.2 ✅ 节点分组

**功能说明**：支持将多个节点组合成一个分组，可以整体移动和操作。

**实现方式**：
- 使用 Vue Flow 的 `Group` 节点类型
- 通过 `groupNodes` API 创建分组
- 分组节点可以包含子节点

**关键 API**：
```typescript
import { useVueFlow } from '@vue-flow/core'

const { groupNodes, ungroupNodes } = useVueFlow()

// 创建分组
const groupId = groupNodes(selectedNodeIds)

// 取消分组
ungroupNodes(groupId)
```

### 2.3 ✅ 右键菜单

**功能说明**：在节点或画布空白处右键显示上下文菜单。

**实现要点**：
- 监听 `@node-contextmenu` 和 `@pane-contextmenu` 事件
- 显示自定义 `ContextMenu` 组件
- 菜单项包括：复制、粘贴、删除、分组等

**事件处理**：
```typescript
const onNodeContextMenu = (event: NodeContextMenuEvent) => {
  event.event.preventDefault()
  contextMenu.value = {
    visible: true,
    x: event.event.clientX,
    y: event.event.clientY,
    target: event.node,
  }
}
```

### 2.4 节点选中与右侧边栏

**功能说明**：
1. 点击节点选中节点
2. 如果节点有详细内容，唤起右侧边栏展示细节
3. 如果节点没有后续节点，在节点右侧显示加号按钮
4. 点击加号弹出节点选择器，选择并添加新节点

**实现步骤**：

#### 步骤 1：节点选中处理
```typescript
const selectedNode = ref<Node | null>(null)
const sidebarVisible = ref(false)

const onNodeClick = (event: NodeMouseEvent) => {
  const node = event.node
  selectedNode.value = node
  
  // 检查节点是否有详细内容
  if (node.data?.hasDetails) {
    sidebarVisible.value = true
  }
  
  // 检查是否有后续节点
  const hasNextNodes = getEdges.value.some(
    edge => edge.source === node.id
  )
  
  // 如果没有后续节点，显示加号按钮
  showAddButton.value = !hasNextNodes
}
```

#### 步骤 2：右侧边栏组件
```vue
<!-- Sidebar.vue -->
<template>
  <div v-if="visible" class="sidebar">
    <div class="sidebar-header">
      <h3>{{ node?.data?.title }}</h3>
      <button @click="close">×</button>
    </div>
    <div class="sidebar-content">
      <!-- 节点详细信息 -->
      <NodeDetails :node="node" />
    </div>
  </div>
</template>
```

#### 步骤 3：节点加号按钮

#### 步骤 4：节点选择器

### 2.5 连线加号功能

**功能说明**：点击连线时显示加号按钮，点击后弹出节点选择器，在连线中间插入新节点。

**实现步骤**：

#### 步骤 1：连线点击处理

#### 步骤 2：在连线中间插入节点

### 2.7 ✅ 连线规则验证

**功能说明**：验证连线是否符合业务规则，防止创建循环、重复连线等。

**验证规则**：
1. 不能自连接（节点不能连接到自己）
2. 不能重复连线（相同源和目标只能有一条连线）
3. 不能形成循环（防止死循环）

## 3. 组件交互流程

### 3.1 节点选中流程
```
用户点击节点 
  → onNodeClick 事件触发
  → 设置 selectedNode
  → 检查节点是否有详情 → 显示右侧边栏
  → 检查是否有后续节点 → 显示/隐藏加号按钮
```

### 3.2 添加节点流程
```
点击节点加号按钮
  → 显示 NodeSelector 组件
  → 用户选择节点类型
  → 创建新节点
  → 创建连线（从当前节点到新节点）
  → 更新历史记录
```

### 3.3 连线插入节点流程
```
点击连线
  → onEdgeClick 事件触发
  → 计算连线中点位置
  → 显示加号按钮
  → 点击加号 → 显示 NodeSelector
  → 选择节点类型
  → 删除原连线
  → 创建新节点
  → 创建两条新连线（源→新节点，新节点→目标）
```

## 4. 样式规范

### 4.1 节点样式
- 默认尺寸：120px × 60px
- 边框：2px solid #4d53e8
- 圆角：8px
- 选中状态：边框颜色 #37d0ff，带阴影效果

### 4.2 连线样式
- 颜色：#4d53e8
- 宽度：2px
- 类型：smoothstep（平滑曲线）

### 4.3 加号按钮样式
- 尺寸：24px × 24px
- 背景：#4d53e8
- 颜色：白色
- 圆角：50%（圆形）
- 悬停效果：放大 1.1 倍

### 4.4 右侧边栏样式
- 宽度：320px
- 背景：白色
- 阴影：0 2px 8px rgba(0,0,0,0.1)
- 位置：固定在右侧

## 5. 状态管理

### 5.1 编辑器状态
```typescript
interface EditorState {
  selectedNode: Node | null
  selectedEdge: Edge | null
  sidebarVisible: boolean
  nodeSelectorVisible: boolean
  contextMenu: {
    visible: boolean
    x: number
    y: number
    target: Node | null
  }
}
```

### 5.2 Pinia Store
```typescript
export const useEditorStore = defineStore('editor', () => {
  const selectedNode = ref<Node | null>(null)
  const sidebarVisible = ref(false)
  
  const setSelectedNode = (node: Node | null) => {
    selectedNode.value = node
    sidebarVisible.value = !!node?.data?.hasDetails
  }
  
  return {
    selectedNode,
    sidebarVisible,
    setSelectedNode,
  }
})
```

## 6. 最佳实践

1. **性能优化**：
   - 使用 `v-memo` 优化节点渲染
   - 大量节点时使用虚拟滚动
   - 防抖处理频繁的状态更新

2. **用户体验**：
   - 提供视觉反馈（加载状态、动画效果）
   - 错误提示友好明确
   - 支持键盘导航

3. **代码组织**：
   - 使用 Composables 封装可复用逻辑
   - 类型定义统一管理
   - 工具函数独立文件

4. **测试**：
   - 单元测试覆盖核心逻辑
   - E2E 测试覆盖主要交互流程  