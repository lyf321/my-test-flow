<template>
  <div class="enter-guide-node" :class="{ selected: isSelected }">
    <Handle type="target" :position="Position.Left" :style="{ background: '#10b981' }" />
    <Handle type="source" :position="Position.Right" :style="{ background: '#10b981' }" />
    <div class="node-content">
      <div class="node-icon">→</div>
      <div class="node-title">{{ data.title || '入戏引导' }}</div>
    </div>
    <button
      v-if="showAddButton"
      class="add-node-button"
      @click.stop="handleAddClick"
      title="添加节点"
    >
      +
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, useVueFlow, Position } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'

const props = defineProps<{
  id: string
  data: any
}>()

const emit = defineEmits<{
  addNode: [nodeId: string, event?: MouseEvent]
}>()

const { getNode, getEdges } = useVueFlow()

const isSelected = computed(() => {
  const node = getNode.value(props.id)
  return node?.selected || false
})

// 检查是否有后续节点
const showAddButton = computed(() => {
  const outgoingEdges = getEdges.value.filter(edge => edge.source === props.id)
  return outgoingEdges.length === 0 && isSelected.value
})

const handleAddClick = (event: MouseEvent) => {
  emit('addNode', props.id, event)
}
</script>

<style scoped>
.enter-guide-node {
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
  border: 2px solid #10b981;
  border-radius: 12px;
  padding: 16px 20px;
  min-width: 140px;
  min-height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.12);
  transition: all 0.2s ease;
  cursor: pointer;
}

.enter-guide-node:hover {
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.18);
  transform: translateY(-2px);
}

.enter-guide-node.selected {
  border-color: #34d399;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.2), 0 4px 16px rgba(16, 185, 129, 0.2);
  background: linear-gradient(135deg, #ffffff 0%, #d1fae5 100%);
}

.node-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.node-icon {
  font-size: 20px;
  line-height: 1;
  color: #10b981;
  font-weight: bold;
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
  background: #10b981;
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
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
  line-height: 1;
}

.add-node-button:hover {
  background: #059669;
  transform: translateY(-50%) scale(1.15);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.add-node-button:active {
  transform: translateY(-50%) scale(0.9);
  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.3);
}
</style>

