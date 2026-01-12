<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="node-selector-overlay" @click="hide">
        <div class="node-selector" :style="positionStyle" @click.stop>
          <div class="selector-header">
            <span class="title">选择节点类型</span>
            <button class="close-btn" @click="hide">×</button>
          </div>
          <div class="selector-list">
            <div
              v-for="nodeType in availableNodeTypes"
              :key="nodeType.id"
              class="selector-item"
              @click="selectNode(nodeType)"
            >
              <span class="icon">{{ nodeType.icon || '○' }}</span>
              <span class="label">{{ nodeType.label }}</span>
            </div>
            <div v-if="availableNodeTypes.length === 0" class="empty-state">
              <span>暂无可添加的节点</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type NodeType } from '@/composables/useNodeSelector'

const props = defineProps<{
  visible: boolean
  x: number
  y: number
  availableNodeTypes: NodeType[]
}>()

const emit = defineEmits<{
  select: [nodeType: NodeType]
  close: []
}>()

const positionStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
}))

const availableNodeTypes = computed(() => props.availableNodeTypes)

const selectNode = (nodeType: NodeType) => {
  emit('select', nodeType)
  hide()
}

const hide = () => {
  emit('close')
}
</script>

<style scoped>
.node-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.1);
}

.node-selector {
  position: absolute;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  min-width: 240px;
  max-width: 320px;
  transform: translate(-50%, -50%);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.selector-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
}

.selector-header .title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.selector-list {
  padding: 8px;
  max-height: 360px;
  overflow-y: auto;
}

.selector-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 4px;
  border: 1px solid transparent;
}

.selector-item:hover {
  background: #f3f4f6;
  border-color: #e5e7eb;
  transform: translateX(2px);
}

.selector-item:active {
  background: #e5e7eb;
  transform: translateX(0);
}

.selector-item .icon {
  font-size: 18px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f4ff;
  border-radius: 6px;
  color: #4d53e8;
  flex-shrink: 0;
}

.selector-item .label {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
  flex: 1;
}

.empty-state {
  padding: 24px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

