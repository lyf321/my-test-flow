# 待实现功能清单

基于 `VUE_FLOW_QUICKSTART.md` 的功能对比分析

## 🔴 高优先级功能

### 1. 完善右键菜单功能

**当前状态**：界面已实现，但功能为空

**需要实现**：

#### 1.1 删除功能
```typescript
// ContextMenu.vue
const handleDelete = () => {
  if (props.target) {
    // 删除选中的节点
    removeNodes([props.target.id])
    // 删除相关连线
    const edgesToRemove = getEdges.value.filter(
      e => e.source === props.target.id || e.target === props.target.id
    )
    removeEdges(edgesToRemove.map(e => e.id))
  }
  emit('close')
}
```

#### 1.2 复制功能
```typescript
const clipboard = ref<Node | null>(null)

const handleCopy = () => {
  if (props.target) {
    clipboard.value = { ...props.target }
  }
  emit('close')
}
```

#### 1.3 粘贴功能
```typescript
const handlePaste = () => {
  if (clipboard.value) {
    const newNode: Node = {
      ...clipboard.value,
      id: `${clipboard.value.type}_${Date.now()}`,
      position: {
        x: clipboard.value.position.x + 50,
        y: clipboard.value.position.y + 50,
      },
    }
    addNodes([newNode])
  }
  emit('close')
}
```

**预计工作量**：2-3 小时

---

### 2. 添加节点右键菜单

**需要实现**：

#### 2.1 添加事件监听
```vue
<!-- WorkflowEditor.vue -->
<VueFlow
  @node-contextmenu="onNodeContextMenu"
  @pane-contextmenu="onPaneContextMenu"
>
```

#### 2.2 实现事件处理
```typescript
const onNodeContextMenu = (event: any) => {
  event.event.preventDefault()
  contextMenu.value = {
    visible: true,
    x: event.event.clientX,
    y: event.event.clientY,
    target: event.node,
  }
}
```

#### 2.3 区分节点菜单和画布菜单
```vue
<!-- ContextMenu.vue -->
<div v-if="target" class="menu-item" @click="handleCopy">复制节点</div>
<div v-if="target" class="menu-item" @click="handleDelete">删除节点</div>
<div v-if="!target" class="menu-item" @click="handlePaste">粘贴</div>
```

**预计工作量**：1-2 小时

---

## 🟡 中优先级功能

### 3. 添加撤销/重做工具栏按钮

**需要实现**：

```vue
<!-- WorkflowEditor.vue - 右上角操作栏 -->
<div class="top-toolbar">
  <button 
    class="toolbar-btn" 
    @click="undo" 
    :disabled="!canUndo"
    title="撤销 (Ctrl+Z)"
  >
    <span class="icon">↶</span>
    <span class="label">撤销</span>
  </button>
  <button 
    class="toolbar-btn" 
    @click="redo" 
    :disabled="!canRedo"
    title="重做 (Ctrl+Shift+Z)"
  >
    <span class="icon">↷</span>
    <span class="label">重做</span>
  </button>
  <div class="toolbar-divider"></div>
  <button class="toolbar-btn" @click="showAddNodeMenu">
    <span class="icon">+</span>
    <span class="label">新增节点</span>
  </button>
  <button class="toolbar-btn" @click="arrangeNodes">
    <span class="icon">⚡</span>
    <span class="label">整理节点</span>
  </button>
</div>
```

**预计工作量**：30 分钟

---

### 4. 优化复制/粘贴功能

**需要增强**：

#### 4.1 支持键盘快捷键
```typescript
const handleKeyDown = (event: KeyboardEvent) => {
  // Ctrl+C 复制
  if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
    const selectedNode = getNodes.value.find(n => n.selected)
    if (selectedNode) {
      clipboard.value = { ...selectedNode }
    }
  }
  
  // Ctrl+V 粘贴
  if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
    if (clipboard.value) {
      // 粘贴逻辑
    }
  }
}
```

#### 4.2 支持多节点复制
```typescript
const clipboard = ref<Node[]>([])

const handleCopy = () => {
  const selectedNodes = getNodes.value.filter(n => n.selected)
  if (selectedNodes.length > 0) {
    clipboard.value = selectedNodes.map(n => ({ ...n }))
  }
}
```

**预计工作量**：2-3 小时

---

## 🟢 低优先级功能

### 5. 节点分组功能

**需要实现**：

#### 5.1 使用 Vue Flow API
```typescript
import { useVueFlow } from '@vue-flow/core'

const { groupNodes, ungroupNodes } = useVueFlow()

// 创建分组
const handleGroup = () => {
  const selectedNodeIds = getNodes.value
    .filter(n => n.selected)
    .map(n => n.id)
  
  if (selectedNodeIds.length > 1) {
    const groupId = groupNodes(selectedNodeIds)
    console.log('Created group:', groupId)
  }
}

// 取消分组
const handleUngroup = () => {
  const selectedGroup = getNodes.value.find(
    n => n.selected && n.type === 'group'
  )
  
  if (selectedGroup) {
    ungroupNodes(selectedGroup.id)
  }
}
```

#### 5.2 添加到右键菜单
```vue
<div v-if="canGroup" class="menu-item" @click="handleGroup">创建分组</div>
<div v-if="isGroup" class="menu-item" @click="handleUngroup">取消分组</div>
```

**预计工作量**：4-5 小时

---

### 6. 节点拖拽预览

**功能说明**：从节点选择器拖拽节点到画布

**需要实现**：
- 监听拖拽事件
- 显示拖拽预览
- 在释放位置创建节点

**预计工作量**：3-4 小时

---

## 📊 实现优先级总结

| 功能 | 优先级 | 工作量 | 用户价值 |
|------|--------|--------|----------|
| 右键菜单删除 | 🔴 高 | 1h | ⭐⭐⭐⭐⭐ |
| 节点右键菜单 | 🔴 高 | 2h | ⭐⭐⭐⭐⭐ |
| 复制/粘贴基础功能 | 🔴 高 | 2h | ⭐⭐⭐⭐ |
| 撤销/重做按钮 | 🟡 中 | 0.5h | ⭐⭐⭐ |
| 复制/粘贴增强 | 🟡 中 | 3h | ⭐⭐⭐ |
| 节点分组 | 🟢 低 | 5h | ⭐⭐ |
| 拖拽预览 | 🟢 低 | 4h | ⭐⭐ |

---

## 🎯 推荐实现顺序

### 第一阶段（必需功能）
1. ✅ 右键菜单删除功能
2. ✅ 节点右键菜单
3. ✅ 基础复制/粘贴

**预计总工作量**：5 小时

### 第二阶段（增强功能）
4. 撤销/重做按钮
5. 复制/粘贴快捷键
6. 多节点复制

**预计总工作量**：4 小时

### 第三阶段（高级功能）
7. 节点分组
8. 拖拽预览

**预计总工作量**：9 小时

---

## 💡 其他建议

### 性能优化
- 大量节点时使用虚拟滚动
- 添加节点渲染防抖
- 优化历史记录存储

### 用户体验
- 添加操作提示（Toast）
- 添加加载动画
- 优化错误提示

### 数据持久化
- 实现保存/加载功能
- 支持导出为 JSON
- 支持导入工作流

### 协作功能
- 多人实时编辑
- 版本控制
- 评论功能

---

## 📝 备注

当前已实现的核心功能已经可以满足基本的工作流编辑需求：
- ✅ 节点创建和连接
- ✅ 连线规则验证
- ✅ 大场景小场景管理
- ✅ 自动布局
- ✅ 视图控制
- ✅ 快捷键支持

未实现的功能主要是编辑增强和高级特性，可以根据实际需求逐步添加。

