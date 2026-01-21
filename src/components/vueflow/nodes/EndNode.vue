<template>
  <BaseNode
    :id="id"
    :data="data"
    node-type="end"
    :input-ports="inputPorts"
    :custom-style="customStyle"
    @add-node="handleAddNode"
  >
    <template #default>
      <div class="end-node-content">
        <div class="end-icon">U</div>
        <div class="end-label">结束</div>
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

// 定义输入端口（结束节点只有输入）
const inputPorts: PortDefinition[] = [
  {
    id: 'input',
    name: 'input',
    type: PortType.Input,
    position: PortPosition.Left,
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
.end-node-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.end-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f97316;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
}

.end-label {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
}

/* 覆盖BaseNode的样式 */
:deep(.base-node.node-end) {
  background: #ffffff;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 24px;
  padding: 8px 12px;
}

:deep(.base-node.node-end:hover) {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

:deep(.base-node.node-end.selected) {
  box-shadow: 0 0 0 2px #f97316, 0 2px 6px rgba(0, 0, 0, 0.15);
}
</style>

