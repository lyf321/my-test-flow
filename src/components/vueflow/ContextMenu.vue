<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="context-menu"
      :style="{ left: `${x}px`, top: `${y}px` }"
      @click.stop
    >
      <div class="menu-item" @click="handleCopy">复制</div>
      <div class="menu-item" @click="handlePaste">粘贴</div>
      <div class="menu-divider"></div>
      <div class="menu-item" @click="handleDelete">删除</div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import type { Node } from '@vue-flow/core'

const props = defineProps<{
  visible: boolean
  x: number
  y: number
  target: Node | null
}>()

const emit = defineEmits<{
  close: []
}>()

const handleCopy = () => {
  // 实现复制逻辑
  emit('close')
}

const handlePaste = () => {
  // 实现粘贴逻辑
  emit('close')
}

const handleDelete = () => {
  // 实现删除逻辑
  emit('close')
}

const handleClickOutside = (event: MouseEvent) => {
  if (props.visible) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  min-width: 120px;
  z-index: 1000;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background 0.2s;
}

.menu-item:hover {
  background: #f9fafb;
}

.menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
}
</style>

