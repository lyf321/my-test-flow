# BaseNode 改进建议

基于设计文档对当前 BaseNode 实现的分析和改进建议。

---

## 当前实现评估

### ✅ 已完成的设计要点

1. **组合模式** - 通过插槽实现内容注入（header、body、footer）
2. **状态管理** - 支持 selected、dragging、executing、error 状态
3. **端口系统** - 支持自定义输入/输出端口位置和数量
4. **样式定制** - 通过 customStyle 支持样式覆盖
5. **执行状态可视化** - 预留执行状态指示器和错误指示器
6. **类型化设计** - 完整的 TypeScript 类型定义

### ⚠️ 需要改进的部分

---

## 改进优先级

### 🔴 高优先级（立即改进）

#### 1. 重构 BigSceneNode 使用 BaseNode

**问题**：BigSceneNode 还是独立实现，未使用新的 BaseNode 架构

**改进方案**：
```vue
<!-- BigSceneNode.vue 改进版 -->
<template>
  <BaseNode
    :id="id"
    :data="data"
    node-type="big-scene"
    :input-ports="inputPorts"
    :output-ports="outputPorts"
    :custom-style="customStyle"
    @add-node="handleAddNode"
  >
    <template #default>
      <div class="scene-content">
        <div class="node-icon">🎬</div>
        <div class="node-title">{{ data.title || '大场景' }}</div>
        <div v-if="hasSubScenes" class="sub-scenes-badge">
          {{ data.subScenes.length }} 个小场景
        </div>
      </div>
    </template>
  </BaseNode>
</template>
```

#### 2. 增强端口定制能力

**问题**：端口样式固定，无法定制

**改进方案**：
```typescript
// 在 PortDefinition 中增加样式配置
interface PortDefinition {
  id: string
  name: string
  type: PortType
  position: PortPosition
  dataType?: string
  required?: boolean
  multiple?: boolean
  // 新增
  style?: {
    color?: string
    size?: number
    shape?: 'circle' | 'square' | 'diamond'
  }
  label?: string
  showLabel?: boolean
}
```

```vue
<!-- BaseNode.vue 改进 -->
<Handle
  :id="inputPort.id"
  type="target"
  :position="getVueFlowPosition(inputPort.position)"
  :style="{
    background: inputPort.style?.color || '#4d53e8',
    width: `${inputPort.style?.size || 8}px`,
    height: `${inputPort.style?.size || 8}px`,
  }"
>
  <span v-if="inputPort.showLabel" class="port-label">
    {{ inputPort.label || inputPort.name }}
  </span>
</Handle>
```

#### 3. 添加节点事件系统

**问题**：缺少完整的事件处理

**改进方案**：
```typescript
// BaseNode.vue 增加事件定义
const emit = defineEmits<{
  addNode: [nodeId: string, event?: MouseEvent]
  click: [event: MouseEvent]
  dblclick: [event: MouseEvent]
  contextmenu: [event: MouseEvent]
  dragStart: [event: DragEvent]
  dragEnd: [event: DragEvent]
  delete: []
  copy: []
  config: []
}>()
```

---

### 🟡 中优先级（近期改进）

#### 4. 添加节点工具栏

**改进方案**：
```vue
<!-- BaseNode.vue 增加工具栏插槽 -->
<template>
  <div class="base-node">
    <!-- 节点工具栏（悬停时显示） -->
    <div v-if="showToolbar" class="node-toolbar">
      <slot name="toolbar">
        <button @click="handleConfig" title="配置">⚙️</button>
        <button @click="handleCopy" title="复制">📋</button>
        <button @click="handleDelete" title="删除">🗑️</button>
      </slot>
    </div>
    
    <!-- 原有内容 -->
  </div>
</template>

<script setup lang="ts">
const showToolbar = computed(() => {
  return isSelected.value || isHovered.value
})
</script>
```

#### 5. 支持节点配置面板

**改进方案**：
```vue
<!-- BaseNode.vue 增加配置按钮和面板 -->
<template>
  <div class="base-node">
    <!-- 配置按钮 -->
    <button
      v-if="hasConfig"
      class="config-button"
      @click.stop="toggleConfig"
      title="配置节点"
    >
      ⚙️
    </button>
    
    <!-- 配置面板（弹出） -->
    <Teleport to="body">
      <div v-if="showConfigPanel" class="node-config-panel">
        <slot name="config-panel">
          <!-- 动态配置表单将在这里渲染 -->
        </slot>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  // ...
  hasConfig?: boolean
  configSchema?: NodeConfigSchema
}>()

const showConfigPanel = ref(false)

const toggleConfig = () => {
  showConfigPanel.value = !showConfigPanel.value
  emit('config')
}
</script>
```

#### 6. 增强视觉元素支持

**改进方案**：
```vue
<!-- BaseNode.vue 增加更多视觉插槽 -->
<template>
  <div class="base-node">
    <!-- 节点图标 -->
    <div v-if="$slots.icon || nodeIcon" class="node-icon-wrapper">
      <slot name="icon">
        <span class="node-icon">{{ nodeIcon }}</span>
      </slot>
    </div>
    
    <!-- 节点徽章 -->
    <div v-if="$slots.badge || badges.length > 0" class="node-badges">
      <slot name="badge">
        <span
          v-for="badge in badges"
          :key="badge.id"
          class="node-badge"
          :class="`badge-${badge.type}`"
        >
          {{ badge.text }}
        </span>
      </slot>
    </div>
    
    <!-- 节点描述（悬停提示） -->
    <div v-if="description" class="node-description" :title="description">
      ℹ️
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  // ...
  nodeIcon?: string
  badges?: Array<{ id: string; text: string; type: string }>
  description?: string
}>()
</script>
```

---

### 🟢 低优先级（未来改进）

#### 7. 节点尺寸控制

**改进方案**：
```vue
<!-- BaseNode.vue 增加尺寸调整功能 -->
<template>
  <div class="base-node" :class="{ resizing: isResizing }">
    <!-- 尺寸调整手柄 -->
    <div
      v-if="resizable"
      class="resize-handle"
      @mousedown="startResize"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  // ...
  resizable?: boolean
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
}>()

const isResizing = ref(false)

const startResize = (e: MouseEvent) => {
  isResizing.value = true
  // 实现尺寸调整逻辑
}
</script>
```

#### 8. 节点验证指示器

**改进方案**：
```vue
<!-- BaseNode.vue 增加验证状态 -->
<template>
  <div class="base-node" :class="validationClass">
    <!-- 验证指示器 -->
    <div v-if="hasValidationIssues" class="validation-indicator">
      <span v-if="validationWarnings.length" title="警告">⚠️</span>
      <span v-if="validationErrors.length" title="错误">❌</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  // ...
  validationWarnings?: string[]
  validationErrors?: string[]
}>()

const hasValidationIssues = computed(() => {
  return (validationWarnings?.length || 0) > 0 ||
         (validationErrors?.length || 0) > 0
})

const validationClass = computed(() => ({
  'has-warnings': validationWarnings?.length,
  'has-errors': validationErrors?.length,
}))
</script>
```

#### 9. 节点进度条

**改进方案**：
```vue
<!-- BaseNode.vue 增加进度显示 -->
<template>
  <div class="base-node">
    <!-- 进度条（执行时显示） -->
    <div v-if="isExecuting && progress !== undefined" class="progress-bar">
      <div class="progress-fill" :style="{ width: `${progress}%` }" />
      <span class="progress-text">{{ Math.round(progress) }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const progress = computed(() => node.value?.data?.progress)
</script>
```

#### 10. 节点动画效果

**改进方案**：
```vue
<!-- BaseNode.vue 增加更多动画 -->
<style scoped>
/* 添加节点 */
.base-node {
  animation: fadeInScale 0.3s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 删除节点 */
.base-node.deleting {
  animation: fadeOutScale 0.3s ease-in forwards;
}

@keyframes fadeOutScale {
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}

/* 连接动画 */
.base-node.connecting {
  animation: breathe 1s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(77, 83, 232, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(77, 83, 232, 0);
  }
}
</style>
```

---

## 完整改进后的 BaseNode 接口

```typescript
interface BaseNodeProps {
  // 基础属性
  id: string
  data: any
  nodeType: string
  
  // 端口配置
  inputPorts?: PortDefinition[]
  outputPorts?: PortDefinition[]
  
  // 样式配置
  customStyle?: NodeStyle
  
  // 视觉元素
  nodeIcon?: string
  badges?: Array<{ id: string; text: string; type: string }>
  description?: string
  
  // 功能配置
  hasConfig?: boolean
  configSchema?: NodeConfigSchema
  resizable?: boolean
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  
  // 验证状态
  validationWarnings?: string[]
  validationErrors?: string[]
}

interface BaseNodeEmits {
  // 交互事件
  addNode: [nodeId: string, event?: MouseEvent]
  click: [event: MouseEvent]
  dblclick: [event: MouseEvent]
  contextmenu: [event: MouseEvent]
  
  // 拖拽事件
  dragStart: [event: DragEvent]
  dragEnd: [event: DragEvent]
  
  // 操作事件
  delete: []
  copy: []
  config: []
  
  // 尺寸事件
  resize: [width: number, height: number]
}

interface BaseNodeSlots {
  // 内容插槽
  default?: () => any
  header?: () => any
  footer?: () => any
  
  // 视觉插槽
  icon?: () => any
  badge?: () => any
  
  // 功能插槽
  toolbar?: () => any
  'config-panel'?: () => any
}
```

---

## 实施计划

### 第一阶段（1-2天）
1. ✅ 重构 BigSceneNode 使用 BaseNode
2. ✅ 增强端口定制能力
3. ✅ 添加基础事件系统

### 第二阶段（2-3天）
4. ⬜ 添加节点工具栏
5. ⬜ 支持配置面板入口
6. ⬜ 增强视觉元素支持

### 第三阶段（按需实施）
7. ⬜ 节点尺寸控制
8. ⬜ 验证指示器
9. ⬜ 进度条显示
10. ⬜ 动画效果优化

---

## 总结

当前 BaseNode 实现已经完成了核心功能，符合设计文档中的基础要求。主要优点是：
- ✅ 架构清晰，符合组合模式
- ✅ 状态管理完善
- ✅ 扩展性良好

需要改进的方向主要是：
- 🔴 统一所有节点使用 BaseNode
- 🟡 增强交互能力（工具栏、配置面板）
- 🟡 丰富视觉表现（图标、徽章、描述）
- 🟢 添加高级功能（尺寸调整、验证、进度）

建议按优先级逐步实施改进，确保每次改进都能带来实际价值。

