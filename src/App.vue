<template>
  <div class="app-container">
    <div class="header">
      <h1>工作流编辑器</h1>
      <div class="tabs">
        <button
          :class="['tab', { active: activeTab === 'x6' }]"
          @click="activeTab = 'x6'"
        >
          AntV X6
        </button>
        <button
          :class="['tab', { active: activeTab === 'vueflow' }]"
          @click="activeTab = 'vueflow'"
        >
          Vue Flow
        </button>
      </div>
    </div>
    <div class="editor-container">
      <X6Editor v-if="activeTab === 'x6'" />
      <VueFlowEditor v-if="activeTab === 'vueflow'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import X6Editor from './components/x6/WorkflowEditor.vue'
import VueFlowEditor from './components/vueflow/WorkflowEditor.vue'

const activeTab = ref<'x6' | 'vueflow'>('vueflow')
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header h1 {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.tabs {
  display: flex;
  gap: 8px;
}

.tab {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.tab:hover {
  background: #f9fafb;
}

.tab.active {
  background: #4d53e8;
  color: #fff;
  border-color: #4d53e8;
}

.editor-container {
  flex: 1;
  overflow: hidden;
}
</style>

