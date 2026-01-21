<template>
  <BaseNode
    :id="id"
    :data="data"
    node-type="2d-description"
    :input-ports="inputPorts"
    :output-ports="outputPorts"
    :custom-style="customStyle"
    node-icon="🎨"
    :badges="badges"
    @add-node="handleAddNode"
  >
    <template #default>
      <div class="2d-description-content">
        <div class="node-title">{{ data.title || '2D画面描述' }}</div>
        <div v-if="linkedScenesCount > 0" class="linked-scenes-badge">
          关联 {{ linkedScenesCount }} 个场景
        </div>
      </div>
    </template>
  </BaseNode>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseNode from './BaseNode.vue'
import type { PortDefinition, NodeStyle } from '@/types/node'
import { PortPosition, PortType } from '@/types/node'

const props = defineProps<{
  id: string
  data: any
}>()

const emit = defineEmits<{
  addNode: [nodeId: string, event?: MouseEvent]
}>()

const inputPorts: PortDefinition[] = [
  {
    id: 'input',
    name: 'input',
    type: PortType.Input,
    position: PortPosition.Left,
    style: { color: '#8b5cf6' }
  },
]

const outputPorts: PortDefinition[] = [
  {
    id: 'output',
    name: 'output',
    type: PortType.Output,
    position: PortPosition.Right,
    style: { color: '#8b5cf6' }
  },
]

const customStyle: NodeStyle = {
  minWidth: '180px',
  minHeight: '80px',
}

const linkedScenesCount = computed(() => {
  return props.data?.linkedSubScenes?.length || 0
})

const badges = computed(() => {
  const result = []
  if (props.data?.isShared) {
    result.push({ id: 'shared', text: '共享', type: 'info' })
  }
  return result
})

const handleAddNode = (nodeId: string, event?: MouseEvent) => {
  emit('addNode', nodeId, event)
}
</script>

<style scoped>
.2d-description-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.node-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
}

.linked-scenes-badge {
  font-size: 11px;
  color: #8b5cf6;
  background: #f3e8ff;
  padding: 2px 8px;
  border-radius: 10px;
}

:deep(.base-node.node-2d-description) {
  background: linear-gradient(135deg, #ffffff 0%, #faf5ff 100%);
  border-color: #8b5cf6;
}
</style>
