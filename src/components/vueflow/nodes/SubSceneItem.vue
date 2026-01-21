<template>
  <div 
    class="sub-scene-item"
    :class="{ 'has-2d': subScene.linkedTo2DNode }"
  >
    <!-- 连接点 - 直接放在小场景项内部 -->
    <Handle
      :id="`sub-scene-${subScene.id}`"
      type="source"
      :position="Position.Right"
      class="sub-scene-handle"
    />
    
    <div class="sub-scene-header">
      <span class="drag-handle">⋮</span>
      <div 
        class="sub-scene-title"
        :contenteditable="editing"
        @dblclick="startEdit"
        @blur="saveEdit"
        @keydown.enter.prevent="saveEdit"
        ref="titleInput"
      >
        {{ index + 1 }}.{{ subScene.name }}
      </div>
      <button 
        class="delete-btn-sm" 
        @click.stop="handleDelete"
        title="删除"
      >
        删除
      </button>
    </div>

    <div 
      class="sub-scene-desc"
      :contenteditable="editingDesc"
      @dblclick="startEditDesc"
      @blur="saveDescEdit"
      ref="descInput"
    >
      ● {{ subScene.description || '场景描述' }}
    </div>

    <div class="sub-scene-actions">
      <button 
        v-if="!subScene.linkedTo2DNode"
        class="action-link-2d" 
        @click.stop="handleAdd2D"
      >
        添加2D画面
      </button>
      <div v-else class="connection-status">
        <span class="status-indicator">
          <span class="indicator-icon">🎨</span>
          {{ subScene.is2DNodeShared ? '共享2D' : '已连接2D' }}
        </span>
        <button 
          class="action-link-sm" 
          @click.stop="handleView2D"
        >
          查看
        </button>
        <button 
          v-if="!subScene.is2DNodeShared"
          class="action-link-sm danger" 
          @click.stop="handleRemove2D"
        >
          删除
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import type { SubScene } from '@/types/node'

const props = defineProps<{
  subScene: SubScene
  index: number
}>()

const emit = defineEmits<{
  update: [subScene: SubScene]
  delete: []
  add2D: []
  view2D: [nodeId: string]
  remove2D: []
}>()

// 编辑状态
const editing = ref(false)
const editingDesc = ref(false)
const titleInput = ref<HTMLElement | null>(null)
const descInput = ref<HTMLElement | null>(null)

// 标题编辑
const startEdit = () => {
  editing.value = true
  nextTick(() => {
    if (titleInput.value) {
      titleInput.value.focus()
      // 选中所有文本
      const range = document.createRange()
      range.selectNodeContents(titleInput.value)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  })
}

const saveEdit = () => {
  if (titleInput.value && editing.value) {
    let newTitle = titleInput.value.textContent || ''
    // 移除序号前缀
    newTitle = newTitle.replace(/^\d+\./, '')
    
    const updatedSubScene = {
      ...props.subScene,
      name: newTitle
    }
    emit('update', updatedSubScene)
    editing.value = false
  }
}

// 描述编辑
const startEditDesc = () => {
  editingDesc.value = true
  nextTick(() => {
    if (descInput.value) {
      descInput.value.focus()
    }
  })
}

const saveDescEdit = () => {
  if (descInput.value && editingDesc.value) {
    let newDesc = descInput.value.textContent || ''
    // 移除● 前缀
    newDesc = newDesc.replace(/^●\s*/, '')
    
    const updatedSubScene = {
      ...props.subScene,
      description: newDesc
    }
    emit('update', updatedSubScene)
    editingDesc.value = false
  }
}

// 操作处理
const handleDelete = () => {
  emit('delete')
}

const handleAdd2D = () => {
  emit('add2D')
}

const handleView2D = () => {
  if (props.subScene.linkedTo2DNode) {
    emit('view2D', props.subScene.linkedTo2DNode)
  }
}

const handleRemove2D = () => {
  emit('remove2D')
}
</script>

<style scoped>
.sub-scene-item {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  position: relative;
  transition: all 0.2s;
  margin-right: 8px; /* 为连接点留出空间 */
}

.sub-scene-item:hover {
  border-color: #d1d5db;
  background: #f3f4f6;
}

.sub-scene-item.has-2d {
  border-left: 3px solid #8b5cf6;
}

.sub-scene-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.drag-handle {
  color: #9ca3af;
  font-size: 12px;
  cursor: grab;
  user-select: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.sub-scene-title {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  cursor: text;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background 0.2s;
  min-height: 20px;
}

.sub-scene-title:hover {
  background: #e5e7eb;
}

.sub-scene-title[contenteditable="true"] {
  outline: 1px solid #3b82f6;
  background: #ffffff;
}

.delete-btn-sm {
  font-size: 11px;
  color: #ef4444;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s;
  white-space: nowrap;
}

.delete-btn-sm:hover {
  background: #fee2e2;
  color: #dc2626;
}

.sub-scene-desc {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 8px;
  padding-left: 18px;
  cursor: text;
  padding: 4px 8px 4px 18px;
  border-radius: 4px;
  transition: background 0.2s;
  min-height: 24px;
}

.sub-scene-desc:hover {
  background: #e5e7eb;
}

.sub-scene-desc[contenteditable="true"] {
  outline: 1px solid #3b82f6;
  background: #ffffff;
}

.sub-scene-actions {
  padding-left: 18px;
}

.action-link-2d {
  font-size: 12px;
  color: #8b5cf6;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  transition: color 0.2s;
}

.action-link-2d:hover {
  color: #7c3aed;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #8b5cf6;
  background: #f3e8ff;
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.indicator-icon {
  font-size: 12px;
  line-height: 1;
}

.action-link-sm {
  font-size: 11px;
  color: #3b82f6;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s;
  white-space: nowrap;
}

.action-link-sm:hover {
  background: #dbeafe;
  color: #2563eb;
}

.action-link-sm.danger {
  color: #ef4444;
}

.action-link-sm.danger:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* 连接点样式 */
.sub-scene-handle {
  width: 12px !important;
  height: 12px !important;
  background: #8b5cf6 !important;
  border: 2px solid white !important;
  right: -6px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  cursor: crosshair !important;
  z-index: 10 !important;
}

.sub-scene-handle:hover {
  width: 16px !important;
  height: 16px !important;
  right: -8px !important;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2) !important;
}
</style>
