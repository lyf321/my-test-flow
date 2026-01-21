<template>
  <BaseNode
    :id="id"
    :data="data"
    node-type="start"
    :output-ports="outputPorts"
    :custom-style="customStyle"
    @add-node="handleAddNode"
  >
    <template #default>
      <div class="start-node-content">
        <div class="start-icon">开</div>
        <div class="start-label">开始</div>
      </div>
    </template>
  </BaseNode>
</template>

<script setup lang="ts">
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

// 定义输出端口（开始节点只有输出）
const outputPorts: PortDefinition[] = [
  {
    id: 'output',
    name: 'output',
    type: PortType.Output,
    position: PortPosition.Right,
  },
]

// 自定义样式
const customStyle: NodeStyle = {
  backgroundColor: '#ffffff',
  borderColor: 'transparent',
  minHeight: '48px',
  padding: '8px 12px',
}

const handleAddNode = (nodeId: string, event?: MouseEvent) => {
  emit('addNode', nodeId, event)
}
</script>

<style scoped>
.start-node-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.start-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #10b981;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.start-label {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
}

/* 覆盖BaseNode的样式 */
:deep(.base-node.node-start) {
  background: #ffffff;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 24px;
  padding: 8px 12px;
}

:deep(.base-node.node-start:hover) {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

:deep(.base-node.node-start.selected) {
  box-shadow: 0 0 0 2px #10b981, 0 2px 6px rgba(0, 0, 0, 0.15);
}
</style>

