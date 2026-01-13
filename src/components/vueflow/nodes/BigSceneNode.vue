<template>
  <BaseNode
    :id="id"
    :data="data"
    node-type="big-scene"
    :input-ports="inputPorts"
    :output-ports="outputPorts"
    :custom-style="customStyle"
    @add-node="handleAddNode"
  >
    <template #default>
      <div class="scene-content">
        <div class="node-icon">🎬</div>
        <div class="node-title">{{ data.title || '大场景' }}</div>
        <div v-if="hasSubScenes" class="sub-scenes-badge">
          {{ data.subScenes.length }} 个小场景
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

// 自定义样式
const customStyle: NodeStyle = {
  minWidth: '160px',
  minHeight: '80px',
}

const hasSubScenes = computed(() => {
  return props.data?.subScenes && props.data.subScenes.length > 0
})

const handleAddNode = (nodeId: string, event?: MouseEvent) => {
  emit('addNode', nodeId, event)
}
</script>

<style scoped>
.scene-content {
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

/* 覆盖BaseNode的样式，让大场景节点有不同的外观 */
:deep(.base-node.node-big-scene) {
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  min-width: 160px;
  min-height: 80px;
  cursor: pointer;
}

:deep(.base-node.node-big-scene:hover) {
  box-shadow: 0 4px 16px rgba(77, 83, 232, 0.18);
  transform: translateY(-2px);
}

:deep(.base-node.node-big-scene.selected) {
  background: linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%);
}
</style>

