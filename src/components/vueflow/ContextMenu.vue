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
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 6px 0;
  min-width: 160px;
  z-index: 1000;
}

.menu-item {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #1f2937;
  transition: all 0.15s ease;
  font-weight: 500;
}

.menu-item:hover {
  background: #f3f4f6;
  color: #111827;
}

.menu-item:active {
  background: #e5e7eb;
}

.menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
}
</style>

