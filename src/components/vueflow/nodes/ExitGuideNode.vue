<template>
  <BaseNode
    :id="id"
    :data="data"
    node-type="exit-guide"
    :input-ports="inputPorts"
    :output-ports="outputPorts"
    :custom-style="customStyle"
    @add-node="handleAddNode"
  >
    <template #default>
      <div class="node-content">
        <div class="node-icon">←</div>
        <div class="node-title">{{ data.title || '出戏引导' }}</div>
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

// 定义输入输出端口（左右布局）
const inputPorts: PortDefinition[] = [
  {
    id: 'input',
    name: 'input',
    type: PortType.Input,
    position: PortPosition.Left,
  },
]

const outputPorts: PortDefinition[] = [
  {
    id: 'output',
    name: 'output',
    type: PortType.Output,
    position: PortPosition.Right,
  },
]

// 自定义样式（橙色主题）
const customStyle: NodeStyle = {
  backgroundColor: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
  borderColor: '#f59e0b',
  minHeight: '70px',
}

const handleAddNode = (nodeId: string, event?: MouseEvent) => {
  emit('addNode', nodeId, event)
}
</script>

<style scoped>
.node-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.node-icon {
  font-size: 20px;
  line-height: 1;
  color: #f59e0b;
  font-weight: bold;
}

.node-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  line-height: 1.4;
}

/* 覆盖BaseNode的样式 */
:deep(.base-node.node-exit-guide) {
  background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
  border-color: #f59e0b;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.12);
}

:deep(.base-node.node-exit-guide:hover) {
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.18);
}

:deep(.base-node.node-exit-guide.selected) {
  border-color: #fbbf24;
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2), 0 4px 16px rgba(245, 158, 11, 0.2);
  background: linear-gradient(135deg, #ffffff 0%, #fef3c7 100%);
}

:deep(.base-node.node-exit-guide .add-node-button) {
  background: #f59e0b;
}

:deep(.base-node.node-exit-guide .add-node-button:hover) {
  background: #d97706;
}
</style>

<style scoped>
.exit-guide-node {
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 16px 20px;
  min-width: 140px;
  min-height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.12);
  transition: all 0.2s ease;
  cursor: pointer;
}

.exit-guide-node:hover {
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.18);
  transform: translateY(-2px);
}

.exit-guide-node.selected {
  border-color: #fbbf24;
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2), 0 4px 16px rgba(245, 158, 11, 0.2);
  background: linear-gradient(135deg, #ffffff 0%, #fef3c7 100%);
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
  color: #f59e0b;
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
  background: #f59e0b;
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
  box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);
  line-height: 1;
}

.add-node-button:hover {
  background: #d97706;
  transform: translateY(-50%) scale(1.15);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.add-node-button:active {
  transform: translateY(-50%) scale(0.9);
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.3);
}
</style>

