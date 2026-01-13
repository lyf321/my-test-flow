<template>
  <BaseNode
    :id="id"
    :data="data"
    node-type="condition"
    :input-ports="inputPorts"
    :output-ports="outputPorts"
    :custom-style="customStyle"
    @add-node="handleAddNode"
  >
    <template #default>
      <div class="node-title">{{ data.title || 'Condition' }}</div>
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

// 定义输入端口
const inputPorts: PortDefinition[] = [
  {
    id: 'input',
    name: 'input',
    type: PortType.Input,
    position: PortPosition.Top,
  },
]

// 定义输出端口
const outputPorts: PortDefinition[] = [
  {
    id: 'output',
    name: 'output',
    type: PortType.Output,
    position: PortPosition.Bottom,
  },
]

// 自定义样式（菱形）
const customStyle: NodeStyle = {
  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
}

const handleAddNode = (nodeId: string, event?: MouseEvent) => {
  emit('addNode', nodeId, event)
}
</script>

<style scoped>
.node-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  line-height: 1.4;
}
</style>

