<template>
  <div class="enter-guide-wrapper">
    <div class="guide-card">
      <!-- 头部 -->
      <div class="card-header">
        <div class="header-left">
          <div class="guide-icon">→</div>
          <span class="guide-title">入戏引导</span>
        </div>
        <div class="header-right">
          <span class="generate-badge">更新生成</span>
        </div>
      </div>
      
      <!-- 内容区 -->
      <div class="card-content">
        <div class="content-text">
          {{ data.content || '此刻，你并不在地球。你正位于一艘正在遥航的虚拟船上，眼皮之外，是微末险名的星域。恒星的光在这处弧霾，宇宙安眠而流逝。' }}
        </div>
      </div>
    </div>
    
    <!-- Vue Flow 连接点 -->
    <Handle
      :id="`${id}-input`"
      type="target"
      :position="Position.Left"
      class="guide-handle guide-handle-input"
    />
    <Handle
      :id="`${id}-output`"
      type="source"
      :position="Position.Right"
      class="guide-handle guide-handle-output"
    />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{
  id: string
  data: any
}>()

const emit = defineEmits<{
  addNode: [nodeId: string, event?: MouseEvent]
}>()
</script>

<style scoped>
.enter-guide-wrapper {
  position: relative;
  width: 320px;
}

.guide-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #e5e7eb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.guide-icon {
  width: 24px;
  height: 24px;
  background: #8b5cf6;
  border-radius: 4px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.guide-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.generate-badge {
  font-size: 12px;
  color: #8b5cf6;
  background: #f3e8ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.card-content {
  padding: 16px;
}

.content-text {
  font-size: 13px;
  line-height: 1.6;
  color: #4b5563;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Vue Flow 连接点 */
.guide-handle {
  width: 10px;
  height: 10px;
  border: 2px solid #8b5cf6;
  background: white;
  border-radius: 50%;
  transition: all 0.2s;
}

.guide-handle:hover {
  width: 14px;
  height: 14px;
  border-width: 3px;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2);
}

.guide-handle-input {
  left: -5px;
}

.guide-handle-output {
  right: -5px;
}
</style>

