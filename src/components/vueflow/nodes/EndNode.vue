<template>
  <BaseNode
    :id="id"
    :data="data"
    node-type="end"
    :input-ports="inputPorts"
    @add-node="handleAddNode"
  >
    <template #default>
      <div class="node-title">{{ data.title || 'End' }}</div>
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

// 定义输入端口（结束节点只有输入）
const inputPorts: PortDefinition[] = [
  {
    id: 'input',
    name: 'input',
    type: PortType.Input,
    position: PortPosition.Top,
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

