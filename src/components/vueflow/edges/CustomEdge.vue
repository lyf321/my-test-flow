<template>
  <g 
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- 连线路径 -->
    <path
      :id="id"
      :style="style"
      class="vue-flow__edge-path"
      :d="path"
      :marker-end="markerEnd"
    />
    
    <!-- Hover 区域（更宽的透明路径，便于鼠标悬停） -->
    <path
      :d="path"
      class="edge-hover-area"
    />
    
    <!-- 加号按钮 -->
    <foreignObject
      v-if="showAddButton"
      :x="buttonPosition.x - 14"
      :y="buttonPosition.y - 14"
      width="28"
      height="28"
      class="edge-add-button-wrapper"
      @click="handleAddClick"
    >
      <div 
        class="edge-add-button"
        xmlns="http://www.w3.org/1999/xhtml"
      >
        +
      </div>
    </foreignObject>
  </g>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { EdgeProps, getBezierPath } from '@vue-flow/core'

const props = defineProps<EdgeProps>()

const emit = defineEmits<{
  addNode: [edgeId: string]
}>()

const isHovered = ref(false)
let hideTimeout: ReturnType<typeof setTimeout> | null = null

// 计算路径
const path = computed(() => {
  const [pathData] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  })
  return pathData
})

// 计算按钮位置（连线中点）
const buttonPosition = computed(() => {
  return {
    x: (props.sourceX + props.targetX) / 2,
    y: (props.sourceY + props.targetY) / 2,
  }
})

const showAddButton = computed(() => isHovered.value)

const style = computed(() => ({
  stroke: props.style?.stroke || '#4d53e8',
  strokeWidth: props.style?.strokeWidth || 2,
  ...props.style,
}))

const markerEnd = computed(() => props.markerEnd || 'url(#arrow)')

const onMouseEnter = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  isHovered.value = true
}

const onMouseLeave = () => {
  // 添加延迟，避免闪烁
  hideTimeout = setTimeout(() => {
    isHovered.value = false
    hideTimeout = null
  }, 100)
}

const handleAddClick = (event: MouseEvent) => {
  event.stopPropagation()
  event.preventDefault()
  console.log('CustomEdge handleAddClick', props.id)
  emit('addNode', props.id)
}

onUnmounted(() => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
  }
})
</script>

<style scoped>
.edge-hover-area {
  fill: none;
  stroke: transparent;
  stroke-width: 20;
  cursor: pointer;
}

.edge-add-button-wrapper {
  overflow: visible;
  pointer-events: all;
}

.edge-add-button {
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
  box-shadow: 0 2px 8px rgba(77, 83, 232, 0.3);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1;
}

.edge-add-button:hover {
  background: #3b41d6;
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(77, 83, 232, 0.4);
}

.edge-add-button:active {
  transform: scale(0.9);
}
</style>

