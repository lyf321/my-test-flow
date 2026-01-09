# AntV X6 快速开始指南

## 1. 项目初始化

### 基础项目结构

```
src/
├── components/
│   ├── x6/
│   │   ├── WorkflowEditor.vue      # 主编辑器组件
│   │   ├── Sidebar.vue              # 右侧边栏（节点详情面板）
│   │   ├── NodeSelector.vue        # 节点选择器（加号弹窗）
│   │   └── nodes/
│   │       ├── StartNode.vue        # 开始节点
│   │       ├── EndNode.vue          # 结束节点
│   │       └── ...                  # 其他节点类型
├── composables/
│   ├── useGraph.ts                 # Graph 实例管理
│   ├── useLineRules.ts             # 连线规则验证
│   ├── useNodeSelector.ts          # 节点选择器逻辑
│   └── useSidebar.ts               # 右侧边栏管理
├── stores/
│   └── editor.ts                   # Pinia store（编辑器状态）
└── types/
    └── workflow.ts                 # 类型定义
```

### 依赖安装

```bash
npm install @antv/x6 tslib
```

**注意**：X6 3.x 版本中，插件已内置在主包中，无需单独安装插件包。

## 2. 核心功能实现

### 2.1 ✅ 自动对齐（Snapline）

**功能说明**：节点拖拽时显示对齐辅助线，帮助对齐到其他节点。

**实现方式**：
- 使用 X6 内置的 `Snapline` 插件
- 配置 `sharp: true` 显示锐利对齐线

**代码示例**：
```typescript
import { Snapline } from '@antv/x6'

graph.use(
  new Snapline({
    enabled: true,
    sharp: true,
  })
)
```

### 2.2 ✅ 节点分组

**功能说明**：支持将多个节点组合成一个分组，可以整体移动和操作。

**实现方式**：
- 使用 X6 的 `groupCells` API 创建分组
- 分组是一个特殊的节点，包含子节点

**关键 API**：
```typescript
// 创建分组
const group = graph.groupCells(selectedCells)

// 取消分组
graph.ungroupCells(group)
```

**代码示例**：
```typescript
graph.bindKey(['meta+g', 'ctrl+g'], () => {
  const cells = graph.getSelectedCells()
  if (cells.length > 1) {
    const group = graph.groupCells(cells)
    graph.cleanSelection()
    graph.select(group)
  }
  return false
})
```

### 2.3 ✅ 右键菜单

**功能说明**：在节点或画布空白处右键显示上下文菜单。

**实现要点**：
- 监听 `node:contextmenu` 和 `blank:contextmenu` 事件
- 可以使用 X6 内置的 `Menu` 插件，或自定义菜单组件

**事件处理**：
```typescript
graph.on('node:contextmenu', ({ e, node }) => {
  e.preventDefault()
  
  // 使用自定义菜单组件
  showContextMenu(e.clientX, e.clientY, node)
  
  // 或使用 X6 Menu 插件
  const menu = new Menu({
    items: [
      { label: '复制', onClick: () => graph.copy([node]) },
      { label: '删除', onClick: () => graph.removeCells([node]) },
    ],
  })
  menu.show(e.clientX, e.clientY)
})
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
const selectedNode = ref<any>(null)
const sidebarVisible = ref(false)

graph.on('node:click', ({ node }) => {
  selectedNode.value = node
  
  // 检查节点是否有详细内容
  const nodeData = node.getData()
  if (nodeData?.hasDetails) {
    sidebarVisible.value = true
  }
  
  // 检查是否有后续节点
  const outgoingEdges = graph.getOutgoingEdges(node)
  const hasNextNodes = outgoingEdges && outgoingEdges.length > 0
  
  // 如果没有后续节点，显示加号按钮
  showAddButton.value = !hasNextNodes
  addButtonNodeId.value = node.id
})
```

#### 步骤 2：自定义节点添加加号按钮
```typescript
// 注册自定义节点
Graph.registerNode('custom-node', {
  inherit: 'rect',
  // ... 其他配置
  
  // 在节点渲染后添加加号按钮
  afterDraw: function() {
    const node = this as any
    const bbox = node.getBBox()
    
    // 创建加号按钮
    const addButton = node.view.container.querySelector('.add-button')
    if (!addButton && showAddButton.value && node.id === addButtonNodeId.value) {
      const button = document.createElement('div')
      button.className = 'add-button'
      button.innerHTML = '+'
      button.style.cssText = `
        position: absolute;
        right: -12px;
        top: 50%;
        transform: translateY(-50%);
        width: 24px;
        height: 24px;
        background: #4d53e8;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10;
      `
      button.addEventListener('click', (e) => {
        e.stopPropagation()
        showNodeSelector(node.id, 'right')
      })
      node.view.container.appendChild(button)
    }
  },
}, true)
```

#### 步骤 3：右侧边栏组件
```vue
<!-- Sidebar.vue -->
<template>
  <div v-if="visible" class="sidebar">
    <div class="sidebar-header">
      <h3>{{ nodeData?.title }}</h3>
      <button @click="close">×</button>
    </div>
    <div class="sidebar-content">
      <NodeDetails :node-data="nodeData" />
    </div>
  </div>
</template>
```

#### 步骤 4：节点选择器
```vue
<!-- NodeSelector.vue -->
<template>
  <div v-if="visible" class="node-selector" :style="positionStyle">
    <div class="selector-list">
      <div 
        v-for="nodeType in nodeTypes"
        :key="nodeType.id"
        class="selector-item"
        @click="selectNode(nodeType)"
      >
        <span class="icon">{{ nodeType.icon }}</span>
        <span class="label">{{ nodeType.label }}</span>
      </div>
    </div>
  </div>
</template>
```

### 2.5 连线加号功能

**功能说明**：点击连线时显示加号按钮，点击后弹出节点选择器，在连线中间插入新节点。

**实现步骤**：

#### 步骤 1：连线点击处理
```typescript
const selectedEdge = ref<any>(null)
const edgeAddButtonVisible = ref(false)

graph.on('edge:click', ({ edge, e }) => {
  selectedEdge.value = edge
  edgeAddButtonVisible.value = true
  
  // 计算加号按钮位置（连线中点）
  const sourceNode = edge.getSourceNode()
  const targetNode = edge.getTargetNode()
  
  if (sourceNode && targetNode) {
    const sourceBBox = sourceNode.getBBox()
    const targetBBox = targetNode.getBBox()
    
    const midX = (sourceBBox.x + targetBBox.x) / 2
    const midY = (sourceBBox.y + targetBBox.y) / 2
    
    addButtonPosition.value = { x: midX, y: midY }
    showNodeSelectorForEdge(edge.id, midX, midY)
  }
})
```

#### 步骤 2：在连线中间插入节点
```typescript
const insertNodeInEdge = (edge: any, newNodeType: string, position: { x: number, y: number }) => {
  // 1. 获取原连线的源和目标
  const sourceCell = edge.getSourceCell()
  const targetCell = edge.getTargetCell()
  
  // 2. 删除原连线
  graph.removeEdge(edge)
  
  // 3. 创建新节点
  const newNode = graph.addNode({
    shape: newNodeType,
    x: position.x,
    y: position.y,
    width: 120,
    height: 60,
    label: newNodeType,
  })
  
  // 4. 创建两条新连线
  graph.addEdge({
    source: sourceCell,
    target: newNode,
    attrs: {
      line: {
        stroke: '#4d53e8',
        strokeWidth: 2,
      },
    },
  })
  
  graph.addEdge({
    source: newNode,
    target: targetCell,
    attrs: {
      line: {
        stroke: '#4d53e8',
        strokeWidth: 2,
      },
    },
  })
}
```

### 2.6 ✅ 快捷键系统

**功能说明**：支持常用快捷键操作。

**快捷键列表**：
- `Ctrl/Cmd + Z` - 撤销
- `Ctrl/Cmd + Shift + Z` - 重做
- `Ctrl/Cmd + C` - 复制
- `Ctrl/Cmd + V` - 粘贴
- `Ctrl/Cmd + A` - 全选
- `Delete/Backspace` - 删除选中节点

**实现方式**：
```typescript
import { Keyboard } from '@antv/x6'

graph.use(
  new Keyboard({
    enabled: true,
  })
)

// 绑定快捷键
graph.bindKey(['meta+z', 'ctrl+z'], () => {
  if (graph.canUndo()) {
    graph.undo()
  }
  return false
})

graph.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
  if (graph.canRedo()) {
    graph.redo()
  }
  return false
})

graph.bindKey(['delete', 'backspace'], () => {
  const cells = graph.getSelectedCells()
  if (cells.length) {
    graph.removeCells(cells)
  }
  return false
})
```

### 2.7 ✅ 连线规则验证

**功能说明**：验证连线是否符合业务规则，防止创建循环、重复连线等。

**验证规则**：
1. 不能自连接（节点不能连接到自己）
2. 不能重复连线（相同源和目标只能有一条连线）
3. 不能形成循环（防止死循环）

**实现方式**：
```typescript
// useLineRules.ts
import type { Graph } from '@antv/x6'

export function useLineRules(graph: Graph) {
  const wouldCreateCycle = (sourceId: string, targetId: string): boolean => {
    const visited = new Set<string>()
    const stack = [targetId]
    
    while (stack.length > 0) {
      const current = stack.pop()!
      if (current === sourceId) return true
      if (visited.has(current)) continue
      visited.add(current)
      
      const node = graph.getCellById(current)
      if (node) {
        const outgoingEdges = graph.getOutgoingEdges(node)
        if (outgoingEdges) {
          for (const edge of outgoingEdges) {
            const target = edge.getTargetCell()
            if (target && !visited.has(target.id)) {
              stack.push(target.id)
            }
          }
        }
      }
    }
    return false
  }
  
  return { wouldCreateCycle }
}
```

**在 Graph 配置中使用**：
```typescript
graph = new Graph({
  // ... 其他配置
  connecting: {
    validateConnection: ({ sourceView, targetView }) => {
      if (sourceView === targetView) {
        return false // 不能自连接
      }
      
      if (sourceView && targetView) {
        const sourceId = sourceView.cell.id as string
        const targetId = targetView.cell.id as string
        
        // 检查是否已存在连线
        const existingEdge = graph.getEdges().find(
          edge => edge.getSourceCell().id === sourceId && 
                  edge.getTargetCell().id === targetId
        )
        if (existingEdge) {
          return false
        }
        
        // 检查是否会形成循环
        if (wouldCreateCycle(sourceId, targetId)) {
          return false
        }
      }
      
      return true
    },
  },
})
```

## 3. 组件交互流程

### 3.1 节点选中流程
```
用户点击节点
  → node:click 事件触发
  → 设置 selectedNode
  → 检查节点是否有详情 → 显示右侧边栏
  → 检查是否有后续节点 → 显示/隐藏加号按钮
```

### 3.2 添加节点流程
```
点击节点加号按钮
  → 显示 NodeSelector 组件
  → 用户选择节点类型
  → 创建新节点（graph.addNode）
  → 创建连线（graph.addEdge）
  → 更新历史记录
```

### 3.3 连线插入节点流程
```
点击连线
  → edge:click 事件触发
  → 计算连线中点位置
  → 显示加号按钮/NodeSelector
  → 选择节点类型
  → 删除原连线（graph.removeEdge）
  → 创建新节点
  → 创建两条新连线（源→新节点，新节点→目标）
```

## 4. X6 插件使用

### 4.1 已使用的插件
- **Snapline** - 对齐线
- **History** - 撤销/重做
- **Keyboard** - 快捷键
- **Selection** - 选择
- **Minimap** - 小地图
- **Clipboard** - 剪贴板

### 4.2 插件初始化
```typescript
import { 
  Snapline, 
  History, 
  Keyboard, 
  Selection, 
  Minimap, 
  Clipboard 
} from '@antv/x6'

// 使用插件
graph.use(new Snapline({ enabled: true }))
graph.use(new History({ enabled: true }))
graph.use(new Keyboard({ enabled: true }))
graph.use(new Selection({ enabled: true }))
graph.use(new Minimap({ container: minimapContainer }))
graph.use(new Clipboard({ enabled: true }))
```

## 5. 样式规范

### 5.1 节点样式
- 默认尺寸：120px × 60px
- 边框：2px solid #4d53e8
- 圆角：8px
- 选中状态：通过 Selection 插件控制

### 5.2 连线样式
- 颜色：#4d53e8
- 宽度：2px
- 路由：manhattan（曼哈顿路由）
- 连接器：rounded（圆角）

### 5.3 加号按钮样式
- 尺寸：24px × 24px
- 背景：#4d53e8
- 颜色：白色
- 圆角：50%（圆形）
- 位置：绝对定位在节点边缘

### 5.4 右侧边栏样式
- 宽度：320px
- 背景：白色
- 阴影：0 2px 8px rgba(0,0,0,0.1)
- 位置：固定在右侧

## 6. 状态管理

### 6.1 编辑器状态
```typescript
interface EditorState {
  graph: Graph | null
  selectedNode: any | null
  selectedEdge: any | null
  sidebarVisible: boolean
  nodeSelectorVisible: boolean
  contextMenu: {
    visible: boolean
    x: number
    y: number
    target: any | null
  }
}
```

### 6.2 Pinia Store
```typescript
export const useEditorStore = defineStore('editor', () => {
  const x6Graph = ref<Graph | null>(null)
  const selectedNode = ref<any>(null)
  const sidebarVisible = ref(false)
  
  const setX6Graph = (graph: Graph) => {
    x6Graph.value = graph
  }
  
  const setSelectedNode = (node: any | null) => {
    selectedNode.value = node
    sidebarVisible.value = !!node?.getData()?.hasDetails
  }
  
  return {
    x6Graph,
    selectedNode,
    sidebarVisible,
    setX6Graph,
    setSelectedNode,
  }
})
```

## 7. 最佳实践

1. **性能优化**：
   - 大量节点时使用虚拟渲染
   - 合理使用 `batchUpdate` 批量操作
   - 避免频繁的 DOM 操作

2. **用户体验**：
   - 提供视觉反馈（加载状态、动画效果）
   - 错误提示友好明确
   - 支持键盘导航

3. **代码组织**：
   - 使用 Composables 封装可复用逻辑
   - 节点注册统一管理
   - 工具函数独立文件

4. **X6 特性利用**：
   - 充分利用 X6 的插件系统
   - 使用自定义节点扩展功能
   - 利用事件系统实现交互

5. **测试**：
   - 单元测试覆盖核心逻辑
   - E2E 测试覆盖主要交互流程  