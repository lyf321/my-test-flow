<template>
  <div class="workflow-editor vueflow-editor">
    <VueFlow
      v-model="elements"
      :nodes="nodes"
      :edges="edges"
      :default-viewport="{ zoom: 1, x: 0, y: 0 }"
      :min-zoom="0.2"
      :max-zoom="4"
      :snap-to-grid="true"
      :snap-grid="[20, 20]"
      :connection-line-style="{ stroke: '#4d53e8', strokeWidth: 2 }"
      :default-edge-options="{ type: 'smoothstep' }"
      @nodes-change="onNodesChange"
      @edges-change="onEdgesChange"
      @connect="onConnect"
      @node-click="onNodeClick"
      @edge-click="onEdgeClick"
      @pane-contextmenu="onPaneContextMenu"
    >
      <!-- 背景网格 -->
      <Background :pattern-color="'#e5e7eb'" :gap="20" :size="1" />

      <!-- 控制按钮 -->
      <Controls />

      <!-- 缩略图 -->
      <MiniMap
        :node-stroke-color="'#4d53e8'"
        :node-color="'#fff'"
        :mask-color="'rgba(0, 0, 0, 0.1)'"
      />

      <!-- 自定义节点插槽 -->
      <template #node-start="{ data, id }">
        <StartNode :id="id" :data="data" />
      </template>
      <template #node-end="{ data, id }">
        <EndNode :id="id" :data="data" />
      </template>
      <template #node-condition="{ data, id }">
        <ConditionNode :id="id" :data="data" />
      </template>
    </VueFlow>

    <!-- 右键菜单 -->
    <ContextMenu
      v-if="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :target="contextMenu.target"
      @close="closeContextMenu"
    />

    <!-- 工具栏 -->
    <div class="toolbar">
      <button @click="undo" :disabled="!canUndo">撤销</button>
      <button @click="redo" :disabled="!canRedo">重做</button>
      <button @click="clear">清空</button>
      <button @click="addStartNode">添加开始节点</button>
      <button @click="addEndNode">添加结束节点</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { VueFlow, useVueFlow, type Node, type Edge, type Connection } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import { useHistory } from '@/composables/useHistory'
import { useLineRulesVueFlow } from '@/composables/useLineRulesVueFlow'
import { initialData } from '@/data/initial-data'
import StartNode from './nodes/StartNode.vue'
import EndNode from './nodes/EndNode.vue'
import ConditionNode from './nodes/ConditionNode.vue'
import ContextMenu from './ContextMenu.vue'

const { push: pushHistory, undo: undoHistory, redo: redoHistory, canUndo, canRedo } = useHistory()
const { canAddLine } = useLineRulesVueFlow()

// Vue Flow 实例
const { getNodes, getEdges, addEdges, addNodes, removeNodes, removeEdges, setNodes, setEdges } = useVueFlow()

// 响应式数据
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

const elements = computed({
  get: () => ({ nodes: nodes.value, edges: edges.value }),
  set: (val) => {
    nodes.value = val.nodes
    edges.value = val.edges
  },
})

// 右键菜单
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  target: null as Node | null,
})

// 事件处理
const onNodesChange = () => {
  const nodes = Array.isArray(getNodes.value) ? getNodes.value : [...getNodes.value]
  const edges = Array.isArray(getEdges.value) ? getEdges.value : [...getEdges.value]
  pushHistory({ nodes, edges })
}

const onEdgesChange = () => {
  const nodes = Array.isArray(getNodes.value) ? getNodes.value : [...getNodes.value]
  const edges = Array.isArray(getEdges.value) ? getEdges.value : [...getEdges.value]
  pushHistory({ nodes, edges })
}

const onConnect = (connection: Connection) => {
  if (canAddLine(connection)) {
    addEdges([connection])
    const nodes = Array.isArray(getNodes.value) ? getNodes.value : [...getNodes.value]
    const edges = Array.isArray(getEdges.value) ? getEdges.value : [...getEdges.value]
    pushHistory({ nodes, edges })
  }
}

const onNodeClick = (event: any) => {
  const node = event.node
  // 处理节点点击
}

const onEdgeClick = (event: any) => {
  // 处理连线点击
}

const onPaneContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    target: null,
  }
}

const closeContextMenu = () => {
  contextMenu.value.visible = false
}

// 快捷键处理
const handleKeyDown = (event: KeyboardEvent) => {
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement ||
    (event.target as HTMLElement).isContentEditable
  ) {
    return
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    undo()
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey) {
    event.preventDefault()
    redo()
  }

  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault()
    const selectedNodes = getNodes.value.filter(n => n.selected)
    if (selectedNodes.length) {
      removeNodes(selectedNodes.map(n => n.id))
      const edgesToRemove = getEdges.value.filter(
        e => selectedNodes.some(n => n.id === e.source || n.id === e.target)
      )
      removeEdges(edgesToRemove.map(e => e.id))
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  // 初始化节点
  initNodes()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// 初始化节点
const initNodes = () => {
  const vueFlowNodes: Node[] = initialData.nodes.map((nodeData: any) => ({
    id: nodeData.id,
    type: nodeData.type,
    position: nodeData.position,
    data: nodeData.data,
    style: {
      width: 120,
      height: 60,
    },
  }))

  const vueFlowEdges: Edge[] = initialData.edges.map((edgeData: any) => ({
    id: edgeData.id,
    source: edgeData.source,
    target: edgeData.target,
    type: 'smoothstep',
    style: {
      stroke: '#4d53e8',
      strokeWidth: 2,
    },
  }))

  setNodes(vueFlowNodes)
  setEdges(vueFlowEdges)
}

// 工具栏方法
const undo = () => {
  const state = undoHistory()
  if (state) {
    setNodes(state.nodes)
    setEdges(state.edges)
  }
}

const redo = () => {
  const state = redoHistory()
  if (state) {
    setNodes(state.nodes)
    setEdges(state.edges)
  }
}

const clear = () => {
  setNodes([])
  setEdges([])
}

const addStartNode = () => {
  const newNode: Node = {
    id: `start_${Date.now()}`,
    type: 'start',
    position: { x: 100, y: 100 },
    data: { title: 'Start' },
    style: {
      width: 120,
      height: 60,
    },
  }
  addNodes([newNode])
}

const addEndNode = () => {
  const newNode: Node = {
    id: `end_${Date.now()}`,
    type: 'end',
    position: { x: 300, y: 100 },
    data: { title: 'End' },
    style: {
      width: 120,
      height: 60,
    },
  }
  addNodes([newNode])
}
</script>

<style scoped>
.vueflow-editor {
  width: 100%;
  height: 100%;
  position: relative;
}

.toolbar {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.toolbar button {
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.toolbar button:hover:not(:disabled) {
  background: #f9fafb;
}

.toolbar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

