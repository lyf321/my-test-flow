<template>
  <BaseNode
    :id="id"
    :data="data"
    node-type="start"
    :output-ports="outputPorts"
    @add-node="handleAddNode"
  >
    <template #default>
      <div class="node-title">{{ data.title || 'Start' }}</div>
    </template>
  </BaseNode>
</template>

<script setup lang="ts">
import BaseNode from './BaseNode.vue'
import type { PortDefinition } from '@/types/node'
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
    position: PortPosition.Bottom,
  },
]

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

