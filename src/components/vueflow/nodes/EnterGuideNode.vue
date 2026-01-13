<template>
  <BaseNode
    :id="id"
    :data="data"
    node-type="enter-guide"
    :input-ports="inputPorts"
    :output-ports="outputPorts"
    :custom-style="customStyle"
    @add-node="handleAddNode"
  >
    <template #default>
      <div class="node-content">
        <div class="node-icon">→</div>
        <div class="node-title">{{ data.title || '入戏引导' }}</div>
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

// 自定义样式（绿色主题）
const customStyle: NodeStyle = {
  backgroundColor: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
  borderColor: '#10b981',
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

/* 覆盖BaseNode的样式 */
:deep(.base-node.node-enter-guide) {
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
  border-color: #10b981;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.12);
}

:deep(.base-node.node-enter-guide:hover) {
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.18);
}

:deep(.base-node.node-enter-guide.selected) {
  border-color: #34d399;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.2), 0 4px 16px rgba(16, 185, 129, 0.2);
  background: linear-gradient(135deg, #ffffff 0%, #d1fae5 100%);
}

:deep(.base-node.node-enter-guide .add-node-button) {
  background: #10b981;
}

:deep(.base-node.node-enter-guide .add-node-button:hover) {
  background: #059669;
}
</style>

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

