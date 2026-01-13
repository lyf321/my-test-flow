<template>
  <div class="group-node">
    <!-- 分组标签 -->
    <div class="group-label">
      <span class="icon">📦</span>
      <span class="text">{{ data.label || '分组' }}</span>
      <span class="count">({{ childNodeCount }})</span>
    </div>
    
    <!-- 内容区域 - 子节点会自动渲染在这里 -->
    <div class="group-content"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'

const props = defineProps<{
  id: string
  data: any
}>()

const { getNodes } = useVueFlow()

// 计算组内子节点数量
const childNodeCount = computed(() => {
  const allNodes = getNodes.value
  return allNodes.filter((n: any) => n.parentNode === props.id).length
})
</script>

<style scoped>
.group-node {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(77, 83, 232, 0.02) 0%, rgba(77, 83, 232, 0.05) 100%);
  border: 2px dashed #4d53e8;
  border-radius: 16px;
  box-sizing: border-box;
  position: relative;
  padding: 16px;
}

.group-label {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(77, 83, 232, 0.9);
  color: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.group-label .icon {
  font-size: 14px;
}

.group-label .text {
  font-size: 13px;
}

.group-label .count {
  font-size: 11px;
  opacity: 0.9;
  margin-left: 2px;
}

.group-content {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>

