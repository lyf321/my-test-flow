<template>
  <div
    class="base-node"
    :class="{
      selected: isSelected,
      dragging: isDragging,
      executing: isExecuting,
      error: hasError,
      [`node-${nodeType}`]: true,
    }"
    :style="nodeStyle"
    @click="handleClick"
    @dblclick="handleDblClick"
    @contextmenu="handleContextMenu"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 输入端口 -->
    <template v-for="inputPort in inputPorts" :key="inputPort.id">
      <Handle
        :id="inputPort.id"
        type="target"
        :position="getVueFlowPosition(inputPort.position)"
        :style="getPortStyle(inputPort)"
        :class="getPortClass(inputPort)"
      >
        <span v-if="inputPort.showLabel" class="port-label">
          {{ inputPort.label || inputPort.name }}
        </span>
      </Handle>
    </template>

    <!-- 节点图标 -->
    <div v-if="$slots.icon || nodeIcon" class="node-icon-wrapper">
      <slot name="icon">
        <span class="node-icon-emoji">{{ nodeIcon }}</span>
      </slot>
    </div>

    <!-- 节点内容 -->
    <div class="node-content">
      <!-- 头部插槽 -->
      <div v-if="$slots.header" class="node-header">
        <slot name="header" />
      </div>

      <!-- 主体内容插槽 -->
      <div class="node-body">
        <slot>
          <div class="node-title">{{ nodeTitle }}</div>
        </slot>
      </div>

      <!-- 底部插槽 -->
      <div v-if="$slots.footer" class="node-footer">
        <slot name="footer" />
      </div>
    </div>

    <!-- 节点徽章 -->
    <div v-if="$slots.badge || (badges && badges.length > 0)" class="node-badges">
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
    <div v-if="description" class="node-description-icon" :title="description">
      ℹ️
    </div>

    <!-- 输出端口 -->
    <template v-for="outputPort in outputPorts" :key="outputPort.id">
      <Handle
        :id="outputPort.id"
        type="source"
        :position="getVueFlowPosition(outputPort.position)"
        :style="getPortStyle(outputPort)"
        :class="getPortClass(outputPort)"
      >
        <span v-if="outputPort.showLabel" class="port-label">
          {{ outputPort.label || outputPort.name }}
        </span>
      </Handle>
    </template>

    <!-- 添加节点按钮 -->
    <button
      v-if="showAddButton"
      class="add-node-button"
      @click.stop="handleAddClick"
      title="添加节点"
    >
      +
    </button>

    <!-- 执行状态指示器（为未来执行引擎预留） -->
    <div v-if="isExecuting" class="execution-indicator">
      <div class="spinner"></div>
    </div>

    <!-- 错误指示器（为未来执行引擎预留） -->
    <div v-if="hasError" class="error-indicator" :title="errorMessage">
      ⚠️
    </div>

    <!-- 节点工具栏（悬停或选中时显示） -->
    <div v-if="showToolbarButtons" class="node-toolbar">
      <slot name="toolbar">
        <button
          v-if="props.hasConfig"
          class="toolbar-btn"
          @click.stop="handleConfigClick"
          title="配置"
        >
          ⚙️
        </button>
        <button
          class="toolbar-btn"
          @click.stop="handleCopyClick"
          title="复制"
        >
          📋
        </button>
        <button
          class="toolbar-btn"
          @click.stop="handleDeleteClick"
          title="删除"
        >
          🗑️
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Handle, useVueFlow, Position } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import type { PortDefinition, NodeStyle } from '@/types/node'
import { PortPosition } from '@/types/node'

const props = defineProps<{
  id: string
  data: any
  nodeType: string
  inputPorts?: PortDefinition[]
  outputPorts?: PortDefinition[]
  customStyle?: NodeStyle
  showToolbar?: boolean
  hasConfig?: boolean
  nodeIcon?: string
  badges?: Array<{ id: string; text: string; type: string }>
  description?: string
}>()

const emit = defineEmits<{
  // 节点操作
  addNode: [nodeId: string, event?: MouseEvent]
  delete: []
  copy: []
  config: []
  // 交互事件
  click: [event: MouseEvent]
  dblclick: [event: MouseEvent]
  contextmenu: [event: MouseEvent]
  // 拖拽事件（预留，Vue Flow已处理）
  dragStart: []
  dragEnd: []
}>()

const { getNode, getEdges } = useVueFlow()

// 节点状态
const node = computed(() => getNode.value(props.id))
const isSelected = computed(() => node.value?.selected || false)
const isDragging = computed(() => node.value?.dragging || false)
const isExecuting = computed(() => node.value?.data?.executing || false)
const hasError = computed(() => node.value?.data?.error || false)
const errorMessage = computed(() => node.value?.data?.errorMessage || '')

// 工具栏显示控制
const isHovered = ref(false)
const showToolbarButtons = computed(() => {
  return props.showToolbar !== false && (isSelected.value || isHovered.value)
})

// 节点标题
const nodeTitle = computed(() => props.data?.title || props.nodeType)

// 检查是否有后续节点
const showAddButton = computed(() => {
  const outgoingEdges = getEdges.value.filter(edge => edge.source === props.id)
  return outgoingEdges.length === 0 && isSelected.value
})

// 默认输入端口（如果没有提供）
const defaultInputPorts: PortDefinition[] = [
  {
    id: 'input',
    name: 'input',
    type: 'input' as any,
    position: PortPosition.Top,
  },
]

// 默认输出端口（如果没有提供）
const defaultOutputPorts: PortDefinition[] = [
  {
    id: 'output',
    name: 'output',
    type: 'output' as any,
    position: PortPosition.Bottom,
  },
]

const inputPorts = computed(() => props.inputPorts || defaultInputPorts)
const outputPorts = computed(() => props.outputPorts || defaultOutputPorts)

// 转换端口位置为Vue Flow Position
const getVueFlowPosition = (position: PortPosition): Position => {
  const map: Record<PortPosition, Position> = {
    [PortPosition.Top]: Position.Top,
    [PortPosition.Bottom]: Position.Bottom,
    [PortPosition.Left]: Position.Left,
    [PortPosition.Right]: Position.Right,
  }
  return map[position] || Position.Bottom
}

// 节点样式
const nodeStyle = computed(() => {
  return {
    ...props.customStyle,
  }
})

// 获取端口样式
const getPortStyle = (port: PortDefinition) => {
  const defaultColor = '#4d53e8'
  const defaultSize = 8
  
  return {
    background: port.style?.color || defaultColor,
    width: `${port.style?.size || defaultSize}px`,
    height: `${port.style?.size || defaultSize}px`,
  }
}

// 获取端口样式类
const getPortClass = (port: PortDefinition) => {
  return {
    [`port-${port.style?.shape || 'circle'}`]: true,
    'has-label': port.showLabel,
  }
}

// 事件处理
const handleClick = (event: MouseEvent) => {
  emit('click', event)
}

const handleDblClick = (event: MouseEvent) => {
  emit('dblclick', event)
}

const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  emit('contextmenu', event)
}

// 工具栏按钮处理
const handleConfigClick = () => {
  emit('config')
}

const handleCopyClick = () => {
  emit('copy')
}

const handleDeleteClick = () => {
  emit('delete')
}

// 处理添加节点点击
const handleAddClick = (event: MouseEvent) => {
  emit('addNode', props.id, event)
}

// 监听鼠标悬停
const handleMouseEnter = () => {
  isHovered.value = true
}

const handleMouseLeave = () => {
  isHovered.value = false
}
</script>

<style scoped>
.base-node {
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid #4d53e8;
  border-radius: 12px;
  padding: 16px 20px;
  min-width: 140px;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(77, 83, 232, 0.1);
  transition: all 0.2s ease;
}

.base-node:hover {
  box-shadow: 0 4px 12px rgba(77, 83, 232, 0.15);
  transform: translateY(-1px);
}

.base-node.selected {
  border-color: #37d0ff;
  box-shadow: 0 0 0 3px rgba(55, 208, 255, 0.2), 0 4px 12px rgba(77, 83, 232, 0.2);
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
}

.base-node.executing {
  border-color: #10b981;
  animation: pulse 2s infinite;
}

.base-node.error {
  border-color: #ef4444;
  background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.node-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.node-header {
  width: 100%;
  margin-bottom: 8px;
}

.node-body {
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-footer {
  width: 100%;
  margin-top: 8px;
}

.node-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  line-height: 1.4;
}

.add-node-button {
  position: absolute;
  right: -14px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  background: #4d53e8;
  color: white;
  border: 2px solid white;
  border-radius: 50%;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(77, 83, 232, 0.3);
  line-height: 1;
}

.add-node-button:hover {
  background: #3b41d6;
  transform: translateY(-50%) scale(1.15);
  box-shadow: 0 4px 12px rgba(77, 83, 232, 0.4);
}

.add-node-button:active {
  transform: translateY(-50%) scale(0.9);
  box-shadow: 0 1px 3px rgba(77, 83, 232, 0.3);
}

.execution-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 16px;
  height: 16px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 16px;
  cursor: help;
}

/* 端口样式 */
:deep(.vue-flow__handle) {
  transition: all 0.2s ease;
}

:deep(.vue-flow__handle:hover) {
  transform: scale(1.3);
}

:deep(.vue-flow__handle.port-square) {
  border-radius: 2px;
}

:deep(.vue-flow__handle.port-diamond) {
  transform: rotate(45deg);
}

:deep(.vue-flow__handle.port-diamond:hover) {
  transform: rotate(45deg) scale(1.3);
}

/* 端口标签 */
.port-label {
  position: absolute;
  font-size: 10px;
  color: #6b7280;
  white-space: nowrap;
  pointer-events: none;
  background: white;
  padding: 2px 4px;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.vue-flow__handle-top .port-label) {
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
}

:deep(.vue-flow__handle-bottom .port-label) {
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
}

:deep(.vue-flow__handle-left .port-label) {
  left: -60px;
  top: 50%;
  transform: translateY(-50%);
}

:deep(.vue-flow__handle-right .port-label) {
  right: -60px;
  top: 50%;
  transform: translateY(-50%);
}

/* 节点工具栏 */
.node-toolbar {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  background: white;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  z-index: 100;
  animation: fadeInDown 0.2s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.toolbar-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #f3f4f6;
  transform: scale(1.1);
}

.toolbar-btn:active {
  transform: scale(0.95);
}

/* 节点图标 */
.node-icon-wrapper {
  position: absolute;
  top: -12px;
  left: 12px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid #4d53e8;
  z-index: 10;
}

.node-icon-emoji {
  font-size: 14px;
  line-height: 1;
}

/* 节点徽章 */
.node-badges {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  z-index: 10;
}

.node-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  background: #f3f4f6;
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.node-badge.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.node-badge.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.node-badge.badge-error {
  background: #fee2e2;
  color: #991b1b;
}

.node-badge.badge-info {
  background: #dbeafe;
  color: #1e40af;
}

/* 节点描述图标 */
.node-description-icon {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 14px;
  cursor: help;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.node-description-icon:hover {
  opacity: 1;
}
</style>

