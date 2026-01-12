<template>
  <div class="big-scene-node" :class="{ selected: isSelected }">
    <Handle type="target" :position="Position.Left" :style="{ background: '#4d53e8' }" />
    <Handle type="source" :position="Position.Right" :style="{ background: '#4d53e8' }" />
    
    <div class="node-content">
      <div class="node-icon">🎬</div>
      <div class="node-title">{{ data.title || '大场景' }}</div>
      <div v-if="data.subScenes && data.subScenes.length > 0" class="sub-scenes-badge">
        {{ data.subScenes.length }} 个小场景
      </div>
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
.big-scene-node {
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  border: 2px solid #4d53e8;
  border-radius: 12px;
  padding: 16px 20px;
  min-width: 160px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(77, 83, 232, 0.12);
  transition: all 0.2s ease;
  cursor: pointer;
}

.big-scene-node:hover {
  box-shadow: 0 4px 16px rgba(77, 83, 232, 0.18);
  transform: translateY(-2px);
}

.big-scene-node.selected {
  border-color: #37d0ff;
  box-shadow: 0 0 0 3px rgba(55, 208, 255, 0.2), 0 4px 16px rgba(77, 83, 232, 0.2);
  background: linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%);
}

.node-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.node-icon {
  font-size: 24px;
  line-height: 1;
}

.node-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  line-height: 1.4;
}

.sub-scenes-badge {
  font-size: 11px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
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
</style>

