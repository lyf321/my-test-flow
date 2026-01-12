<template>
  <Transition name="slide">
    <div v-if="visible" class="sidebar">
      <div class="sidebar-header">
        <h3>{{ nodeData?.title || '节点详情' }}</h3>
        <button class="close-btn" @click="close">×</button>
      </div>
      <div class="sidebar-content">
        <div v-if="nodeData" class="node-details">
          <!-- 大场景节点的小场景列表 -->
          <div v-if="node?.type === 'big-scene'" class="sub-scenes-section">
            <div class="section-header">
              <label>小场景列表</label>
              <button class="add-sub-scene-btn" @click="addSubScene">+ 添加小场景</button>
            </div>
            
            <div v-if="nodeData.subScenes && nodeData.subScenes.length > 0" class="sub-scenes-list">
              <div 
                v-for="(subScene, index) in nodeData.subScenes" 
                :key="subScene.id"
                class="sub-scene-item"
              >
                <div class="sub-scene-header">
                  <span class="sub-scene-number">{{ index + 1 }}</span>
                  <span class="sub-scene-name">{{ subScene.name }}</span>
                  <button class="delete-btn" @click="deleteSubScene(index)" title="删除">×</button>
                </div>
                <div v-if="subScene.description" class="sub-scene-description">
                  {{ subScene.description }}
                </div>
              </div>
            </div>
            
            <div v-else class="empty-sub-scenes">
              <p>暂无小场景，点击上方按钮添加</p>
            </div>
          </div>

          <!-- 通用节点信息 -->
          <div class="detail-section">
            <label>节点ID</label>
            <div class="value">{{ node?.id }}</div>
          </div>
          <div class="detail-section">
            <label>节点类型</label>
            <div class="value">{{ getNodeTypeLabel(node?.type) }}</div>
          </div>
          <div class="detail-section" v-if="nodeData.description">
            <label>描述</label>
            <div class="value">{{ nodeData.description }}</div>
          </div>
          <div class="detail-section" v-if="nodeData.config">
            <label>配置</label>
            <pre class="value">{{ JSON.stringify(nodeData.config, null, 2) }}</pre>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>请选择一个节点查看详情</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Node } from '@vue-flow/core'

const props = defineProps<{
  visible: boolean
  node: Node | null
}>()

const emit = defineEmits<{
  close: []
}>()

const nodeData = computed(() => props.node?.data)

const close = () => {
  emit('close')
}

const getNodeTypeLabel = (type: string | undefined): string => {
  const typeMap: Record<string, string> = {
    'start': '开始节点',
    'end': '结束节点',
    'big-scene': '大场景',
    'enter-guide': '入戏引导',
    'exit-guide': '出戏引导',
  }
  return typeMap[type || ''] || type || '未知'
}

const addSubScene = () => {
  if (!props.node || !props.node.data) return
  
  const newSubScene = {
    id: `sub_scene_${Date.now()}`,
    name: `小场景 ${(props.node.data.subScenes?.length || 0) + 1}`,
    description: '场景描述',
    config: {},
  }
  
  if (!props.node.data.subScenes) {
    props.node.data.subScenes = []
  }
  
  props.node.data.subScenes.push(newSubScene)
}

const deleteSubScene = (index: number) => {
  if (!props.node || !props.node.data || !props.node.data.subScenes) return
  
  if (confirm('确定要删除这个小场景吗？')) {
    props.node.data.subScenes.splice(index, 1)
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  right: 0;
  top: 0;
  width: 360px;
  height: 100vh;
  background: #ffffff;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e5e7eb;
}

.sidebar-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  letter-spacing: -0.01em;
}

.close-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #fafbfc;
}

.node-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-section label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-section .value {
  font-size: 14px;
  color: #1f2937;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  word-break: break-word;
}

.detail-section pre.value {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}

/* 小场景相关样式 */
.sub-scenes-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.add-sub-scene-btn {
  padding: 6px 12px;
  background: #4d53e8;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-sub-scene-btn:hover {
  background: #3b41d6;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(77, 83, 232, 0.3);
}

.sub-scenes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sub-scene-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s;
}

.sub-scene-item:hover {
  border-color: #4d53e8;
  box-shadow: 0 2px 8px rgba(77, 83, 232, 0.1);
}

.sub-scene-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.sub-scene-number {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #4d53e8;
  color: white;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.sub-scene-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.delete-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 18px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  line-height: 1;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.sub-scene-description {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
  padding-left: 28px;
}

.empty-sub-scenes {
  padding: 32px 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #e5e7eb;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(100%);
}
</style>

