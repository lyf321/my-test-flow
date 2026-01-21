<template>
  <div v-if="visible" class="connection-indicator">
    <svg class="indicator-line" :width="lineWidth" :height="lineHeight">
      <path
        :d="linePath"
        fill="none"
        :stroke="lineColor"
        :stroke-width="strokeWidth"
        stroke-dasharray="5,5"
        class="animated-line"
      />
    </svg>
    <div class="indicator-badge" :style="badgePosition">
      <span class="badge-icon">{{ icon }}</span>
      <span v-if="showLabel" class="badge-label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Position {
  x: number
  y: number
}

const props = withDefaults(defineProps<{
  sourcePos: Position
  targetPos: Position
  visible?: boolean
  icon?: string
  label?: string
  showLabel?: boolean
  color?: string
  animated?: boolean
}>(), {
  visible: true,
  icon: '🎨',
  label: '已连接',
  showLabel: false,
  color: '#8b5cf6',
  animated: true
})

const lineWidth = computed(() => {
  return Math.abs(props.targetPos.x - props.sourcePos.x) + 40
})

const lineHeight = computed(() => {
  return Math.abs(props.targetPos.y - props.sourcePos.y) + 40
})

const linePath = computed(() => {
  const startX = 20
  const startY = props.sourcePos.y < props.targetPos.y ? 20 : lineHeight.value - 20
  const endX = lineWidth.value - 20
  const endY = props.sourcePos.y < props.targetPos.y ? lineHeight.value - 20 : 20

  // 创建贝塞尔曲线路径
  const midX = (startX + endX) / 2
  const controlX1 = midX
  const controlX2 = midX

  return `M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`
})

const lineColor = computed(() => props.color)
const strokeWidth = computed(() => 1)

const badgePosition = computed(() => {
  // 徽章位置在连线中点
  const midX = lineWidth.value / 2
  const midY = lineHeight.value / 2

  return {
    left: `${midX}px`,
    top: `${midY}px`,
    transform: 'translate(-50%, -50%)'
  }
})
</script>

<style scoped>
.connection-indicator {
  position: absolute;
  pointer-events: none;
  z-index: 1;
}

.indicator-line {
  position: absolute;
  top: 0;
  left: 0;
}

.animated-line {
  animation: dash 20s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -100;
  }
}

.indicator-badge {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ffffff;
  border: 2px solid #8b5cf6;
  border-radius: 12px;
  padding: 4px 8px;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.2s;
}

.indicator-badge:hover {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.badge-icon {
  font-size: 14px;
  line-height: 1;
}

.badge-label {
  font-size: 11px;
  font-weight: 600;
  color: #8b5cf6;
  white-space: nowrap;
}
</style>
