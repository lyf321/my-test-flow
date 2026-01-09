<template>
  <div class="end-node" :class="{ selected: isSelected }">
    <Handle type="target" position="top" :style="{ background: '#4d53e8' }" />
    <div class="node-content">
      <div class="node-title">{{ data.title || 'End' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, useVueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'

const props = defineProps<{
  id: string
  data: any
}>()

const { getNode } = useVueFlow()

const isSelected = computed(() => {
  const node = getNode.value(props.id)
  return node?.selected || false
})
</script>

<style scoped>
.end-node {
  background: white;
  border: 2px solid #4d53e8;
  border-radius: 8px;
  padding: 12px;
  min-width: 100px;
  min-height: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.end-node.selected {
  border-color: #37d0ff;
  box-shadow: 0 0 0 2px rgba(55, 208, 255, 0.2);
}

.node-content {
  width: 100%;
}

.node-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  text-align: center;
}
</style>

