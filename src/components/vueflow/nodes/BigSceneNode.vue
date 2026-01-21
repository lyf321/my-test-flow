<template>
  <div 
    class="big-scene-card"
    :class="{
      'selected': isSelected,
      'dragging': isDragging
    }"
    :style="cardStyle"
    @click.stop="handleCardClick"
  >
    <!-- 主要输入输出连接点 -->
    <Handle
      id="input"
      type="target"
      :position="Position.Left"
      class="main-handle"
      :style="{ top: '24px' }"
    />
    <Handle
      id="output"
      type="source"
      :position="Position.Right"
      class="main-handle"
      :style="{ top: '24px' }"
    />

    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="header-title">{{ data.headerTitle || '开端1' }}</div>
      <div class="header-actions">
        <button class="icon-btn" @click.stop="handleMenuClick" title="菜单">
          <span>⋮</span>
        </button>
        <!-- <button 
          class="icon-btn" 
          @click.stop="toggleCollapse" 
          :title="collapsed ? '展开' : '折叠'"
        >
          <span>{{ collapsed ? '↓' : '↑' }}</span>
        </button> -->
      </div>
    </div>

    <!-- 可折叠内容 -->
    <transition name="collapse">
      <div class="card-content">
        <!-- 场景信息区 -->
        <div class="scene-info">
          <div class="main-title-row">
            <div class="connection-dot left"></div>
            <div class="main-title-content">
              <div 
                class="main-title" 
                :contenteditable="editingTitle"
                @dblclick="startEditTitle"
                @blur="saveTitle"
                @keydown.enter.prevent="saveTitle"
                ref="titleRef"
              >
                {{ data.title || '1.外一般桥内一夜' }}
              </div>
              <button 
                class="action-link" 
                @click.stop="handleRegenerate"
                title="重新生成"
              >
                🔄 重新生成
              </button>
            </div>
            <div class="connection-dot right"></div>
          </div>

          <div 
            class="description-text"
            :contenteditable="editingDesc"
            @dblclick="startEditDesc"
            @blur="saveDesc"
            ref="descRef"
          >
            {{ data.description || '般桥内的根烟引警声新街道到背景，一道不规则的光影在主视图边缘内现，随即镜头定一就不避光地的波段，系统提示当前慢，恒患…' }}
          </div>

          <button 
            class="outline-btn" 
            @click.stop="handleGenerateOutline"
          >
            生成小场景大纲
          </button>
        </div>

        <!-- 小场景列表 -->
        <div class="sub-scenes-section">
          <div class="section-header">
            <span class="section-title">小场景</span>
            <button 
              class="action-link-sm" 
              @click.stop="toggleSubScenesCollapse"
            >
              {{ subScenesCollapsed ? '展开全部' : '收起全部' }}
            </button>
          </div>

          <transition name="collapse">
            <div v-if="!subScenesCollapsed && hasSubScenes" class="sub-scenes-list">
              <div
                v-for="(subScene, index) in data.subScenes"
                :key="subScene.id"
                class="sub-scene-wrapper"
              >
                <SubSceneItem
                  :sub-scene="subScene"
                  :index="index"
                  @update="updateSubScene"
                  @delete="deleteSubScene(index)"
                  @add2D="handleAdd2D(index)"
                  @view2D="handleView2D"
                  @remove2D="handleRemove2D(index)"
                />
              </div>
            </div>
          </transition>

          <button 
            class="add-sub-scene-btn" 
            @click.stop="handleAddSubScene"
          >
            <span class="btn-icon">➕</span>
            添加小场景
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import type { SubScene } from '@/types/node'
import SubSceneItem from './SubSceneItem.vue'

const props = defineProps<{
  id: string
  data: any
}>()

const emit = defineEmits<{
  addSubScene: []
  deleteSubScene: [index: number]
  add2D: [index: number]
  view2D: [nodeId: string]
  remove2D: [index: number]
  regenerate: []
  generateOutline: []
  updateData: [data: any]
  updateSubScene: [subScene: SubScene, index: number]
}>()

const { getNode } = useVueFlow()

// 状态管理
const subScenesCollapsed = ref(props.data.subScenesCollapsed || false)
const editingTitle = ref(false)
const editingDesc = ref(false)
const editingSubScene = ref<string | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const descRef = ref<HTMLElement | null>(null)

// 计算属性
const node = computed(() => getNode.value(props.id))
const isSelected = computed(() => node.value?.selected || false)
const isDragging = computed(() => node.value?.dragging || false)

const hasSubScenes = computed(() => {
  return props.data?.subScenes && props.data.subScenes.length > 0
})

const cardHeight = computed(() => {
  
  let baseHeight = 280 // 头部 + 场景信息
  
  if (hasSubScenes.value && !subScenesCollapsed.value) {
    baseHeight += 60 // 小场景区域标题
    baseHeight += props.data.subScenes.length * 100 // 每个小场景项
  } else {
    baseHeight += 60 // 折叠状态的小场景区域
  }
  
  return baseHeight
})

const cardStyle = computed(() => ({
  minHeight: `${cardHeight.value}px`
}))

const toggleSubScenesCollapse = () => {
  subScenesCollapsed.value = !subScenesCollapsed.value
  emit('updateData', { ...props.data, subScenesCollapsed: subScenesCollapsed.value })
}

// 编辑功能
const startEditTitle = () => {
  editingTitle.value = true
  nextTick(() => {
    if (titleRef.value) {
      titleRef.value.focus()
      const range = document.createRange()
      range.selectNodeContents(titleRef.value)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  })
}

const saveTitle = () => {
  if (titleRef.value && editingTitle.value) {
    const newTitle = titleRef.value.textContent || ''
    emit('updateData', { ...props.data, title: newTitle })
    editingTitle.value = false
  }
}

const startEditDesc = () => {
  editingDesc.value = true
  nextTick(() => {
    if (descRef.value) {
      descRef.value.focus()
    }
  })
}

const saveDesc = () => {
  if (descRef.value && editingDesc.value) {
    const newDesc = descRef.value.textContent || ''
    emit('updateData', { ...props.data, description: newDesc })
    editingDesc.value = false
  }
}

const updateSubScene = (subScene: SubScene) => {
  const index = props.data.subScenes?.findIndex((s: SubScene) => s.id === subScene.id)
  if (index !== -1) {
    emit('updateSubScene', subScene, index)
  }
}

// 事件处理
const handleCardClick = () => {
  // 点击卡片不做额外操作，让VueFlow处理选中
}

const handleMenuClick = () => {
  // TODO: 显示菜单
  console.log('显示菜单')
}

const handleRegenerate = () => {
  emit('regenerate')
}

const handleGenerateOutline = () => {
  emit('generateOutline')
}

const handleAddSubScene = () => {
  emit('addSubScene')
}

const deleteSubScene = (index: number) => {
  if (confirm('确定要删除这个小场景吗？')) {
    emit('deleteSubScene', index)
  }
}

const handleAdd2D = (index: number) => {
  emit('add2D', index)
}

const handleView2D = (nodeId: string) => {
  emit('view2D', nodeId)
}

const handleRemove2D = (index: number) => {
  emit('remove2D', index)
}
</script>

<style scoped>
.big-scene-card {
  width: 320px;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  position: relative;
  overflow: visible;
}

.big-scene-card.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2), 0 4px 12px rgba(0, 0, 0, 0.12);
}

.big-scene-card.dragging {
  opacity: 0.8;
}

/* 主要连接点 */
:deep(.main-handle) {
  width: 12px;
  height: 12px;
  background: #3b82f6;
  border: 2px solid #ffffff;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 12px 12px 0 0;
}

.header-title {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
  font-size: 14px;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: #e5e7eb;
  color: #1f2937;
}

/* 卡片内容 */
.card-content {
  padding: 16px;
}

/* 场景信息区 */
.scene-info {
  margin-bottom: 20px;
}

.main-title-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  position: relative;
}

.connection-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 4px;
  transition: all 0.2s;
}

.connection-dot:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

.main-title-content {
  flex: 1;
}

.main-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  line-height: 1.4;
  cursor: text;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.main-title:hover {
  background: #f3f4f6;
}

.main-title[contenteditable="true"] {
  outline: 2px solid #3b82f6;
  background: #ffffff;
}

.action-link {
  font-size: 12px;
  color: #3b82f6;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.action-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

.description-text {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
  margin: 12px 0;
  padding: 8px;
  border-radius: 6px;
  cursor: text;
  transition: background 0.2s;
  min-height: 60px;
}

.description-text:hover {
  background: #f9fafb;
}

.description-text[contenteditable="true"] {
  outline: 2px solid #3b82f6;
  background: #ffffff;
}

.outline-btn {
  width: 100%;
  padding: 8px 16px;
  background: #eff6ff;
  color: #3b82f6;
  border: 1px solid #dbeafe;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.outline-btn:hover {
  background: #dbeafe;
  border-color: #3b82f6;
}

/* 小场景区域 */
.sub-scenes-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}

.action-link-sm {
  font-size: 11px;
  color: #3b82f6;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.action-link-sm:hover {
  text-decoration: underline;
}

.sub-scenes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.sub-scene-wrapper {
  position: relative;
}

.add-sub-scene-btn {
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  color: #3b82f6;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.add-sub-scene-btn:hover {
  background: #f0f9ff;
  border-color: #3b82f6;
}

.btn-icon {
  font-size: 14px;
  line-height: 1;
}

/* 折叠动画 */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 1000px;
}
</style>
