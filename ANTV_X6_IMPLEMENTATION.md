# AntV X6 工作流编辑器完整实现

## 🎉 已实现的功能

基于 Vue Flow 的实现，在 AntV X6 中完整实现了所有功能：

### ✅ 1. 节点类型

- **开始节点** (Start) - 椭圆形，绿色
- **结束节点** (End) - 椭圆形，红色
- **条件节点** (Condition) - 矩形，橙色
- **大场景节点** (BigScene) - 矩形，紫色，160x80
- **入戏引导节点** (EnterGuide) - 矩形，蓝色
- **出戏引导节点** (ExitGuide) - 矩形，粉色
- **分组节点** (Group) - 虚线边框，半透明背景

### ✅ 2. 核心交互功能

#### 框选多选
- 按住 **Shift** 键拖动可框选多个节点
- 支持多选节点
- 选中后自动显示浮动分组菜单

#### 浮动分组菜单
- 选中 ≥2 个节点时自动弹出
- 显示在选中节点的中心位置
- 包含：
  - **创建分组** - 将选中节点打组
  - **取消分组** - 解散包含选中节点的分组
  - **取消** - 关闭菜单

#### 分组功能
- **创建分组**：
  - 计算选中节点的边界
  - 自动添加 60px 边距
  - 创建半透明虚线背景的分组节点
  - 使用 X6 的 `addChild()` 建立父子关系
  - 子节点会跟随分组移动
  - 创建后自动取消所有选中状态

- **解散分组**：
  - 选中分组内的任意节点
  - 点击"取消分组"
  - 自动找到包含这些节点的分组
  - 移除父子关系并删除分组节点
  - 子节点保持原位置

### ✅ 3. 节点侧边加号按钮

- 鼠标悬停节点时，右侧显示蓝色加号按钮
- 点击加号弹出节点选择器
- 自动在节点右侧创建新节点并连线
- 根据源节点类型过滤可用节点类型

### ✅ 4. 边上的加号按钮

- 鼠标悬停边时，中间显示蓝色加号按钮
- 点击加号弹出节点选择器（仅显示"大场景"）
- 在边的中点插入新节点
- 自动删除原边，创建两条新边

### ✅ 5. 右上角操作栏

- **新增节点**：在画布中心显示节点选择器
- **整理节点**：自动层次布局排列节点
  - 计算节点层级
  - 横向间距 250px
  - 纵向间距 150px
  - 自动居中显示

### ✅ 6. 右下角控制栏

- **回到选中节点**：居中显示选中的节点
- **缩小**：zoom(-0.1)
- **缩放级别显示**：实时显示当前缩放比例
- **放大**：zoom(0.1)

### ✅ 7. 右侧边栏

- 点击"大场景"节点时自动打开
- 显示节点详细信息
- 复用 Vue Flow 的 Sidebar 组件

### ✅ 8. 节点选择器

- 弹窗式节点类型选择
- 根据上下文过滤可用类型
- 三种触发场景：
  1. 从工具栏添加 - 所有类型
  2. 从节点添加 - 根据源节点类型过滤
  3. 从边插入 - 仅"大场景"

### ✅ 9. 连线规则验证

- 复用 `useLineRulesVueFlow` composable
- 防止自环（self-loop）
- 防止重复连线
- 防止循环依赖
- 特定节点类型连线限制

### ✅ 10. 其他功能

- **网格对齐**：20px 网格
- **对齐辅助线**：Snapline 插件
- **历史记录**：撤销/重做（Ctrl+Z / Ctrl+Shift+Z）
- **快捷键**：
  - `Delete` / `Backspace` - 删除选中元素
  - `Ctrl/Cmd + Z` - 撤销
  - `Ctrl/Cmd + Shift + Z` - 重做
- **小地图**：MiniMap 插件
- **自动缩放**：鼠标滚轮 + Ctrl/Cmd

## 📊 技术实现对比

| 功能 | Vue Flow | AntV X6 | 实现方式 |
|------|----------|---------|---------|
| 节点注册 | 自定义 Vue 组件 | `Graph.registerNode()` | X6 使用配置式定义 |
| 分组 | `parentNode` + 相对坐标 | `node.addChild()` | X6 内置父子节点支持 |
| 节点加号 | 自定义组件 + emit | `markup` + 鼠标事件 | X6 使用 SVG markup |
| 边加号 | 自定义边组件 | Edge Tools API | X6 使用 tools 插件 |
| 选择器 | 复用 Vue 组件 | 复用 Vue 组件 | 共享同一组件 |
| 侧边栏 | 复用 Vue 组件 | 复用 Vue 组件 | 共享同一组件 |
| 连线规则 | `canAddLine()` | `validateConnection()` | 共享验证逻辑 |

## 🎨 节点样式配置

```typescript
const NODE_COLORS = {
  start: '#10b981',        // 绿色
  end: '#ef4444',          // 红色
  condition: '#f59e0b',    // 橙色
  'big-scene': '#8b5cf6',  // 紫色
  'enter-guide': '#3b82f6', // 蓝色
  'exit-guide': '#ec4899',  // 粉色
}
```

## 🔧 关键代码片段

### 节点注册（带加号按钮）

```typescript
const registerNodeType = (type, label, color, width, height, shape) => {
  Graph.registerNode(type, {
    inherit: shape,
    width, height,
    markup: [
      { tagName: 'rect', selector: 'body' },
      { tagName: 'text', selector: 'label' },
      // 加号按钮
      {
        tagName: 'circle',
        selector: 'add-button',
        attrs: {
          cx: width + 20,
          cy: height / 2,
          r: 16,
          fill: '#4d53e8',
          visibility: 'hidden',
        },
      },
      {
        tagName: 'text',
        selector: 'add-icon',
        attrs: {
          x: width + 20,
          y: height / 2,
          text: '+',
          fill: '#fff',
          fontSize: 20,
          visibility: 'hidden',
        },
      },
    ],
    // ... attrs, ports
  })
}
```

### 节点鼠标悬停显示加号

```typescript
graph.on('node:mouseenter', ({ node }) => {
  const data = node.getData()
  if (data.type !== 'group') {
    node.attr('add-button/visibility', 'visible')
    node.attr('add-icon/visibility', 'visible')
  }
})

graph.on('node:mouseleave', ({ node }) => {
  node.attr('add-button/visibility', 'hidden')
  node.attr('add-icon/visibility', 'hidden')
})
```

### 边工具（加号按钮）

```typescript
graph.on('edge:mouseenter', ({ edge }) => {
  edge.addTools([
    {
      name: 'button',
      args: {
        markup: [
          {
            tagName: 'circle',
            selector: 'button',
            attrs: { r: 16, fill: '#4d53e8', cursor: 'pointer' },
          },
          {
            tagName: 'text',
            selector: 'icon',
            attrs: { text: '+', fill: '#fff', fontSize: 20 },
          },
        ],
        distance: '50%',
        onClick({ edge }) {
          // 弹出节点选择器
          nodeSelector.show(x, y, { type: 'edge', edgeId: edge.id })
        },
      },
    },
  ])
})
```

### 创建分组

```typescript
const createGroup = () => {
  const selected = graph.getSelectedCells().filter(cell => 
    cell.isNode() && cell.getData().type !== 'group'
  )
  
  // 计算边界
  let minX = Infinity, minY = Infinity
  let maxX = -Infinity, maxY = -Infinity
  selected.forEach(cell => {
    const bbox = cell.getBBox()
    minX = Math.min(minX, bbox.x)
    minY = Math.min(minY, bbox.y)
    maxX = Math.max(maxX, bbox.x + bbox.width)
    maxY = Math.max(maxY, bbox.y + bbox.height)
  })
  
  const padding = 60
  const groupNode = graph.addNode({
    shape: 'group',
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
    label: `分组 (${selected.length})`,
    zIndex: -10,
  })
  
  // 建立父子关系
  selected.forEach(cell => {
    if (cell.isNode()) {
      groupNode.addChild(cell)
    }
  })
  
  graph.cleanSelection()
}
```

### 解散分组

```typescript
const removeGroup = () => {
  const selectedNodeIds = selectedCells.value.map(cell => cell.id)
  
  // 找到包含这些节点的分组
  const groupsToRemove = graph.getNodes().filter(node => {
    const data = node.getData()
    if (data.type === 'group' && data.nodeIds) {
      return data.nodeIds.some(id => selectedNodeIds.includes(id))
    }
    return false
  })
  
  // 删除分组
  groupsToRemove.forEach(groupNode => {
    const children = groupNode.getChildren()
    if (children) {
      children.forEach(child => groupNode.removeChild(child))
    }
    graph.removeNode(groupNode.id)
  })
}
```

## 🚀 使用方法

1. **框选节点**：按住 Shift 拖动框选多个节点
2. **创建分组**：选中多个节点后点击"创建分组"
3. **拖动分组**：拖动分组节点，子节点自动跟随
4. **解散分组**：选中分组内的节点，点击"取消分组"
5. **添加节点**：
   - 工具栏"新增节点" - 在画布中心添加
   - 节点右侧加号 - 从节点添加并连线
   - 边中间加号 - 在边中间插入节点
6. **整理节点**：点击"整理节点"自动排列
7. **缩放平移**：
   - 鼠标滚轮 + Ctrl/Cmd - 缩放
   - 左键拖动 - 平移画布
   - 右下角按钮 - 缩放控制

## 🎯 与 Vue Flow 的功能对比

| 功能 | Vue Flow | X6 | 状态 |
|------|----------|-----|------|
| 框选多选 | ✅ | ✅ | 完全一致 |
| 分组功能 | ✅ | ✅ | 完全一致 |
| 节点加号 | ✅ | ✅ | 完全一致 |
| 边加号 | ✅ | ✅ | 完全一致 |
| 节点选择器 | ✅ | ✅ | 共享组件 |
| 右侧边栏 | ✅ | ✅ | 共享组件 |
| 操作栏 | ✅ | ✅ | 完全一致 |
| 控制栏 | ✅ | ✅ | 完全一致 |
| 连线规则 | ✅ | ✅ | 共享逻辑 |
| 历史记录 | ✅ | ✅ | 完全一致 |
| 快捷键 | ✅ | ✅ | 完全一致 |

## ✨ 总结

已在 AntV X6 中完整实现 Vue Flow 的所有功能，包括：

- ✅ 所有节点类型（Start、End、Condition、BigScene、EnterGuide、ExitGuide、Group）
- ✅ 框选多选 + 浮动分组菜单
- ✅ 创建分组 + 解散分组（使用 addChild/removeChild）
- ✅ 节点侧边加号按钮（markup + 鼠标事件）
- ✅ 边上加号按钮（Edge Tools）
- ✅ 右上角操作栏（新增、整理）
- ✅ 右下角控制栏（回到选中、缩放）
- ✅ 右侧边栏（节点详情）
- ✅ 节点选择器弹窗
- ✅ 连线规则验证

**两种实现方式特点：**

- **Vue Flow**：更 Vue 化，组件式开发，易于自定义 UI
- **AntV X6**：更底层，配置式开发，性能更好，功能更强大

两者功能完全一致，可以根据项目需求选择使用！🎉

