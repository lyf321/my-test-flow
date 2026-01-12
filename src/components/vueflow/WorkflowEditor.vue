<template>
  <div class="workflow-editor vueflow-editor">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      :default-viewport="{ zoom: 1, x: 0, y: 0 }"
      :min-zoom="0.2"
      :max-zoom="4"
      :snap-to-grid="true"
      :snap-grid="[20, 20]"
      :connection-line-style="{ stroke: '#4d53e8', strokeWidth: 2.5 }"
      :default-edge-options="{ 
        type: 'smoothstep',
        style: { stroke: '#4d53e8', strokeWidth: 2.5 },
        animated: false
      }"
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
        <StartNode :id="id" :data="data" @add-node="(nodeId, event) => handleNodeAdd(nodeId, event)" />
      </template>
      <template #node-end="{ data, id }">
        <EndNode :id="id" :data="data" @add-node="(nodeId, event) => handleNodeAdd(nodeId, event)" />
      </template>
      <template #node-condition="{ data, id }">
        <ConditionNode :id="id" :data="data" @add-node="(nodeId, event) => handleNodeAdd(nodeId, event)" />
      </template>
      <template #node-big-scene="{ data, id }">
        <BigSceneNode :id="id" :data="data" @add-node="(nodeId, event) => handleNodeAdd(nodeId, event)" />
      </template>
      <template #node-enter-guide="{ data, id }">
        <EnterGuideNode :id="id" :data="data" @add-node="(nodeId, event) => handleNodeAdd(nodeId, event)" />
      </template>
      <template #node-exit-guide="{ data, id }">
        <ExitGuideNode :id="id" :data="data" @add-node="(nodeId, event) => handleNodeAdd(nodeId, event)" />
      </template>
      
      <!-- 自定义边 -->
      <template #edge-smoothstep="edgeProps">
        <CustomEdge v-bind="edgeProps" @add-node="handleEdgeAddNode" />
      </template>
    </VueFlow>

    <!-- 右侧边栏 -->
    <Sidebar
      :visible="sidebar.visible.value"
      :node="sidebar.selectedNode.value"
      @close="sidebar.close"
    />

    <!-- 节点选择器 -->
    <NodeSelector
      :visible="nodeSelector.visible.value"
      :x="nodeSelector.position.value.x"
      :y="nodeSelector.position.value.y"
      :available-node-types="availableNodeTypes"
      @select="handleNodeTypeSelect"
      @close="nodeSelector.hide"
    />

    <!-- 右键菜单 -->
    <ContextMenu
      :visible="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :target="contextMenu.target"
      @close="closeContextMenu"
    />

    <!-- 右上角操作栏 -->
    <div class="top-toolbar">
      <button 
        class="toolbar-btn" 
        @click="showAddNodeMenu"
        title="新增节点"
      >
        <span class="icon">+</span>
        <span class="label">新增节点</span>
      </button>
      <button 
        class="toolbar-btn" 
        @click="arrangeNodes"
        title="整理节点"
      >
        <span class="icon">⚡</span>
        <span class="label">整理节点</span>
      </button>
    </div>

    <!-- 右下角控制栏 -->
    <div class="bottom-controls">
      <button 
        class="control-btn" 
        @click="focusSelectedNode"
        :disabled="!hasSelectedNode"
        title="回到选中节点"
      >
        <span class="icon">🎯</span>
      </button>
      <div class="control-divider"></div>
      <button 
        class="control-btn" 
        @click="zoomOut"
        title="缩小"
      >
        <span class="icon">−</span>
      </button>
      <span class="zoom-level">{{ Math.round(currentZoom * 100) }}%</span>
      <button 
        class="control-btn" 
        @click="zoomIn"
        title="放大"
      >
        <span class="icon">+</span>
      </button>
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
import { useSidebar } from '@/composables/useSidebar'
import { useNodeSelector } from '@/composables/useNodeSelector'
import { initialData } from '@/data/initial-data'
import StartNode from './nodes/StartNode.vue'
import EndNode from './nodes/EndNode.vue'
import ConditionNode from './nodes/ConditionNode.vue'
import BigSceneNode from './nodes/BigSceneNode.vue'
import EnterGuideNode from './nodes/EnterGuideNode.vue'
import ExitGuideNode from './nodes/ExitGuideNode.vue'
import CustomEdge from './edges/CustomEdge.vue'
import ContextMenu from './ContextMenu.vue'
import Sidebar from './Sidebar.vue'
import NodeSelector from './NodeSelector.vue'

const { push: pushHistory, undo: undoHistory, redo: redoHistory, canUndo, canRedo } = useHistory()
const { canAddLine } = useLineRulesVueFlow()
const sidebar = useSidebar()
const nodeSelector = useNodeSelector()

// Vue Flow 实例
const { 
  getNodes, 
  getEdges, 
  addEdges, 
  addNodes, 
  removeNodes, 
  removeEdges, 
  setNodes, 
  setEdges, 
  getNode, 
  project,
  setViewport,
  getViewport,
  fitView,
  zoomIn: vueFlowZoomIn,
  zoomOut: vueFlowZoomOut,
} = useVueFlow()

// 响应式数据
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])
const currentZoom = ref(1)

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
  
  // 大场景节点：如果有小场景，显示侧边栏
  if (node.type === 'big-scene' && node.data?.subScenes && node.data.subScenes.length > 0) {
    sidebar.open(node)
  } else if (node.data?.hasDetails) {
    sidebar.open(node)
  } else {
    sidebar.close()
  }
}

const onEdgeClick = (event: any) => {
  // 边点击事件现在由 CustomEdge 组件处理
}

// 处理边上的加号按钮点击
const handleEdgeAddNode = (edgeId: string) => {
  const edge = getEdges.value.find(e => e.id === edgeId)
  
  if (edge) {
    const sourceNode = getNode.value(edge.source)
    const targetNode = getNode.value(edge.target)
    
    if (sourceNode && targetNode) {
      // 计算屏幕坐标中点
      const midX = (sourceNode.position.x + targetNode.position.x) / 2
      const midY = (sourceNode.position.y + targetNode.position.y) / 2
      
      // 转换为屏幕坐标
      const screenPos = project({ x: midX, y: midY })
      
      // 显示节点选择器
      nodeSelector.show(screenPos.x, screenPos.y, {
        type: 'edge',
        edgeId: edge.id,
      })
    }
  }
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

// 计算可用的节点类型
const availableNodeTypes = computed(() => {
  const context = nodeSelector.context.value
  if (!context) return nodeSelector.nodeTypes

  if (context.type === 'node' && context.nodeId) {
    const sourceNode = getNode.value(context.nodeId)
    return nodeSelector.getAvailableNodeTypes(sourceNode?.type)
  } else if (context.type === 'edge') {
    // 连线中间插入节点，只允许大场景
    return nodeSelector.nodeTypes.filter(t => t.type === 'big-scene')
  }

  return nodeSelector.nodeTypes
})

// 处理节点加号按钮点击
const handleNodeAdd = (nodeId: string, event?: MouseEvent) => {
  const node = getNode.value(nodeId)
  if (node) {
    let x: number, y: number
    
    if (event) {
      // 如果有事件对象，直接使用事件坐标
      x = event.clientX
      y = event.clientY
    } else {
      // 否则计算节点右侧位置
      const nodePosition = node.position
      const nodeWidth = typeof node.width === 'number' ? node.width : 120
      const nodeHeight = typeof node.height === 'number' ? node.height : 60
      const flowX = nodePosition.x + nodeWidth + 20
      const flowY = nodePosition.y + nodeHeight / 2
      
      // 转换为屏幕坐标
      const screenPos = project({ x: flowX, y: flowY })
      x = screenPos.x
      y = screenPos.y
    }
    
    // 显示节点选择器
    nodeSelector.show(x, y, {
      type: 'node',
      nodeId: nodeId,
      sourceNodeType: node.type,
    })
  }
}

// 处理节点类型选择
const handleNodeTypeSelect = (nodeType: any) => {
  console.log('handleNodeTypeSelect', nodeType)
  if (nodeSelector.context.value?.type === 'node') {
    // 从节点添加新节点
    const sourceNodeId = nodeSelector.context.value.nodeId
    
    if (sourceNodeId) {
      // 从现有节点添加
      const sourceNode = getNode.value(sourceNodeId)
      
      if (sourceNode) {
        const nodeWidth = typeof sourceNode.width === 'number' ? sourceNode.width : 160
        const newNode: Node = {
          id: `${nodeType.type}_${Date.now()}`,
          type: nodeType.type,
          position: {
            x: sourceNode.position.x + nodeWidth + 150,
            y: sourceNode.position.y,
          },
          data: { 
            title: nodeType.label,
            hasDetails: nodeType.type === 'big-scene',
            subScenes: nodeType.type === 'big-scene' ? [] : undefined,
          },
          style: {
            width: nodeType.type === 'big-scene' ? 160 : 140,
            height: nodeType.type === 'big-scene' ? 80 : 70,
          },
        }
        
        addNodes([newNode])
        
        // 创建连线
        const newEdge: Edge = {
          id: `edge_${Date.now()}`,
          source: sourceNodeId,
          target: newNode.id,
          type: 'smoothstep',
          style: {
            stroke: '#4d53e8',
            strokeWidth: 2,
          },
        }
        addEdges([newEdge])
        
        // 更新历史记录
        const nodes = Array.isArray(getNodes.value) ? getNodes.value : [...getNodes.value]
        const edges = Array.isArray(getEdges.value) ? getEdges.value : [...getEdges.value]
        pushHistory({ nodes, edges })
      }
    } else {
      // 从操作栏添加（没有源节点）
      const viewport = getViewport()
      // 将屏幕中心坐标转换为画布坐标
      const canvasX = (window.innerWidth / 2 - viewport.x) / viewport.zoom
      const canvasY = (window.innerHeight / 2 - viewport.y) / viewport.zoom
      
      const newNode: Node = {
        id: `${nodeType.type}_${Date.now()}`,
        type: nodeType.type,
        position: {
          x: canvasX - 80, // 居中偏移
          y: canvasY - 40,
        },
        data: { 
          title: nodeType.label,
          hasDetails: nodeType.type === 'big-scene',
          subScenes: nodeType.type === 'big-scene' ? [] : undefined,
        },
        style: {
          width: nodeType.type === 'big-scene' ? 160 : 140,
          height: nodeType.type === 'big-scene' ? 80 : 70,
        },
      }
      
      addNodes([newNode])
      
      // 更新历史记录
      const nodes = Array.isArray(getNodes.value) ? getNodes.value : [...getNodes.value]
      const edges = Array.isArray(getEdges.value) ? getEdges.value : [...getEdges.value]
      pushHistory({ nodes, edges })
    }
  } else if (nodeSelector.context.value?.type === 'edge') {
    // 在连线中间插入节点
    const edgeId = nodeSelector.context.value.edgeId
    const edge = getEdges.value.find(e => e.id === edgeId)
    
    if (edge) {
      const sourceNode = getNode.value(edge.source)
      const targetNode = getNode.value(edge.target)
      
      if (sourceNode && targetNode) {
        // 计算新节点位置（连线中点）
        const midX = (sourceNode.position.x + targetNode.position.x) / 2
        const midY = (sourceNode.position.y + targetNode.position.y) / 2
        
        // 创建新节点
        const newNode: Node = {
          id: `${nodeType.type}_${Date.now()}`,
          type: nodeType.type,
          position: { x: midX, y: midY },
          data: { 
            title: nodeType.label,
            hasDetails: nodeType.type === 'big-scene',
            subScenes: nodeType.type === 'big-scene' ? [] : undefined,
          },
          style: {
            width: nodeType.type === 'big-scene' ? 160 : 140,
            height: nodeType.type === 'big-scene' ? 80 : 70,
          },
        }
        
        // 删除原连线
        removeEdges([edge.id])
        
        // 添加新节点
        addNodes([newNode])
        
        // 创建两条新连线
        const edge1: Edge = {
          id: `edge_${Date.now()}_1`,
          source: edge.source,
          target: newNode.id,
          type: 'smoothstep',
          style: {
            stroke: '#4d53e8',
            strokeWidth: 2,
          },
        }
        const edge2: Edge = {
          id: `edge_${Date.now()}_2`,
          source: newNode.id,
          target: edge.target,
          type: 'smoothstep',
          style: {
            stroke: '#4d53e8',
            strokeWidth: 2,
          },
        }
        addEdges([edge1, edge2])
        
        // 更新历史记录
        const nodes = Array.isArray(getNodes.value) ? getNodes.value : [...getNodes.value]
        const edges = Array.isArray(getEdges.value) ? getEdges.value : [...getEdges.value]
        pushHistory({ nodes, edges })
      }
    }
  }
}

// 右上角操作栏方法
const showAddNodeMenu = () => {
  // 在画布中心显示节点选择器
  const viewport = getViewport()
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2
  
  nodeSelector.show(centerX, centerY, {
    type: 'node',
    nodeId: undefined,
    sourceNodeType: undefined,
  })
}

const arrangeNodes = () => {
  // 自动整理节点布局
  const allNodes = Array.isArray(getNodes.value) ? getNodes.value : [...getNodes.value]
  if (allNodes.length === 0) return

  // 使用层次布局算法
  const nodeMap = new Map<string, Node>()
  allNodes.forEach(node => nodeMap.set(node.id, node))

  // 计算每个节点的层级
  const levels = new Map<string, number>()
  const visited = new Set<string>()

  const calculateLevel = (nodeId: string, level: number) => {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    
    const currentLevel = levels.get(nodeId) || 0
    levels.set(nodeId, Math.max(currentLevel, level))

    const outgoingEdges = getEdges.value.filter(e => e.source === nodeId)
    outgoingEdges.forEach(edge => {
      calculateLevel(edge.target, level + 1)
    })
  }

  // 找到所有起始节点（没有入边的节点）
  const startNodes = allNodes.filter(node => {
    const hasIncoming = getEdges.value.some(e => e.target === node.id)
    return !hasIncoming
  })

  startNodes.forEach(node => calculateLevel(node.id, 0))

  // 按层级分组节点
  const levelGroups = new Map<number, Node[]>()
  levels.forEach((level, nodeId) => {
    const node = nodeMap.get(nodeId)
    if (node) {
      if (!levelGroups.has(level)) {
        levelGroups.set(level, [])
      }
      levelGroups.get(level)!.push(node)
    }
  })

  // 布局参数
  const horizontalSpacing = 250
  const verticalSpacing = 150
  const startX = 100
  const startY = 100

  // 更新节点位置
  const updatedNodes = allNodes.map(node => {
    const level = levels.get(node.id) || 0
    const nodesInLevel = levelGroups.get(level) || []
    const indexInLevel = nodesInLevel.findIndex(n => n.id === node.id)

    return {
      ...node,
      position: {
        x: startX + level * horizontalSpacing,
        y: startY + indexInLevel * verticalSpacing,
      },
    }
  })

  setNodes(updatedNodes)
  
  // 更新历史记录
  const edges = Array.isArray(getEdges.value) ? getEdges.value : [...getEdges.value]
  pushHistory({ nodes: updatedNodes, edges })

  // 自动适应视图
  setTimeout(() => {
    fitView({ padding: 0.2, duration: 300 })
  }, 100)
}

// 右下角控制栏方法
const hasSelectedNode = computed(() => {
  return getNodes.value.some(n => n.selected)
})

const focusSelectedNode = () => {
  const selectedNode = getNodes.value.find(n => n.selected)
  if (selectedNode) {
    const nodeWidth = typeof selectedNode.width === 'number' ? selectedNode.width : 140
    const nodeHeight = typeof selectedNode.height === 'number' ? selectedNode.height : 70
    
    setViewport({
      x: window.innerWidth / 2 - selectedNode.position.x - nodeWidth / 2,
      y: window.innerHeight / 2 - selectedNode.position.y - nodeHeight / 2,
      zoom: 1,
    }, { duration: 300 })
  }
}

const zoomIn = () => {
  vueFlowZoomIn()
  updateZoomLevel()
}

const zoomOut = () => {
  vueFlowZoomOut()
  updateZoomLevel()
}

const updateZoomLevel = () => {
  const viewport = getViewport()
  currentZoom.value = viewport.zoom
}

// 监听视图变化
onMounted(() => {
  updateZoomLevel()
  const interval = setInterval(updateZoomLevel, 100)
  
  return () => clearInterval(interval)
})
</script>

<style scoped>
.vueflow-editor {
  width: 100%;
  height: 100%;
  position: relative;
}

/* 右上角操作栏 */
.top-toolbar {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: all 0.2s;
  white-space: nowrap;
  font-weight: 500;
}

.toolbar-btn .icon {
  font-size: 16px;
  line-height: 1;
}

.toolbar-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #4d53e8;
  color: #4d53e8;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(77, 83, 232, 0.15);
}

.toolbar-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(77, 83, 232, 0.1);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 右下角控制栏 */
.bottom-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
}

.control-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  color: #374151;
  transition: all 0.2s;
}

.control-btn .icon {
  font-size: 18px;
  line-height: 1;
}

.control-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #4d53e8;
}

.control-btn:active:not(:disabled) {
  background: #e5e7eb;
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.control-divider {
  width: 1px;
  height: 24px;
  background: #e5e7eb;
  margin: 0 4px;
}

.zoom-level {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  min-width: 48px;
  text-align: center;
}
</style>

