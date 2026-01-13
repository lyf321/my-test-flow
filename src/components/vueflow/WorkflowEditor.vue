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
      :nodes-selectable="true"
      :edges-selectable="true"
      :elements-selectable="true"
      :pan-on-drag="[1, 2]" 
      :selection-mode="SelectionMode.Partial"
      :multi-selection-key-code="['Meta', 'Control', 'Shift']"
      @nodes-change="onNodesChange" 
      @edges-change="onEdgesChange" 
      @connect="onConnect" 
      @node-click="onNodeClick"
      @edge-click="onEdgeClick" 
      @pane-click="onPaneClick"
      @pane-contextmenu="onPaneContextMenu"
    >
      <!-- 背景网格 -->
      <Background :pattern-color="'#e5e7eb'" :gap="20" :size="1" />

      <!-- 控制按钮 -->
      <Controls />

      <!-- 缩略图 -->
      <MiniMap :node-stroke-color="'#4d53e8'" :node-color="'#fff'" :mask-color="'rgba(0, 0, 0, 0.1)'" />

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
      <template #node-group="{ data, id }">
        <GroupNode :id="id" :data="data" />
      </template>

      <!-- 自定义边 -->
      <template #edge-smoothstep="edgeProps">
        <CustomEdge v-bind="edgeProps" @add-node="handleEdgeAddNode" />
      </template>
    </VueFlow>

    <!-- 右侧边栏 -->
    <Sidebar :visible="sidebar.visible.value" :node="sidebar.selectedNode.value" @close="sidebar.close" />

    <!-- 节点选择器 -->
    <NodeSelector :visible="nodeSelector.visible.value" :x="nodeSelector.position.value.x"
      :y="nodeSelector.position.value.y" :available-node-types="availableNodeTypes" @select="handleNodeTypeSelect"
      @close="nodeSelector.hide" />

    <!-- 右键菜单 -->
    <ContextMenu :visible="contextMenu.visible" :x="contextMenu.x" :y="contextMenu.y" :target="contextMenu.target"
      @close="closeContextMenu" />

    <!-- 右上角操作栏 -->
    <div class="top-toolbar">
      <button class="toolbar-btn" @click="showAddNodeMenu" title="新增节点">
        <span class="icon">+</span>
        <span class="label">新增节点</span>
      </button>
      <button class="toolbar-btn" @click="arrangeNodes" title="整理节点">
        <span class="icon">⚡</span>
        <span class="label">整理节点</span>
      </button>
    </div>

    <!-- 浮动分组菜单 -->
    <div v-if="groupMenu.visible" class="group-menu" :style="{ left: `${groupMenu.x}px`, top: `${groupMenu.y}px` }"
      @click.stop>
      <div class="menu-header">
        已选中 {{ selectedNodeIds.length }} 个节点
      </div>
      <div class="menu-item" @click="createGroup">
        <span class="icon">📦</span>
        <span>创建分组</span>
      </div>
      <div v-if="hasGroupInSelection" class="menu-item" @click="removeGroup">
        <span class="icon">📂</span>
        <span>取消分组</span>
      </div>
      <div class="menu-divider"></div>
      <div class="menu-item cancel" @click="closeGroupMenu">
        <span>取消</span>
      </div>
    </div>

    <!-- 右下角控制栏 -->
    <div class="bottom-controls">
      <button class="control-btn" @click="focusSelectedNode" :disabled="!hasSelectedNode" title="回到选中节点">
        <span class="icon">🎯</span>
      </button>
      <div class="control-divider"></div>
      <button class="control-btn" @click="zoomOut" title="缩小">
        <span class="icon">−</span>
      </button>
      <span class="zoom-level">{{ Math.round(currentZoom * 100) }}%</span>
      <button class="control-btn" @click="zoomIn" title="放大">
        <span class="icon">+</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { VueFlow, useVueFlow, type Connection, SelectionMode, applyChanges } from '@vue-flow/core'
import type { Node } from '@vue-flow/core'

// Edge 类型定义
type Edge = {
  id: string
  source: string
  target: string
  type?: string
  [key: string]: any
}
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
import GroupNode from './nodes/GroupNode.vue'
import CustomEdge from './edges/CustomEdge.vue'
import ContextMenu from './ContextMenu.vue'
import Sidebar from './Sidebar.vue'
import NodeSelector from './NodeSelector.vue'

const { push: pushHistory, undo: undoHistory, redo: redoHistory } = useHistory()
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

// 选中节点管理
const selectedNodeIds = ref<string[]>([])

// 浮动分组菜单
const groupMenu = ref({
  visible: false,
  x: 0,
  y: 0,
})

// 防止框选后立即关闭菜单的标志
let isSelectingNodes = false

// 右键菜单
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  target: null as Node | null,
})

// 事件处理
const onNodesChange = (changes: any) => {
  // 应用 changes
  nodes.value = applyChanges(changes, nodes.value) as Node[]
  
  // 手动检测选中变化
  const selectChanges = changes.filter((c: any) => c.type === 'select')
  if (selectChanges.length > 0) {
    console.log('🎯 检测到选中变化:', selectChanges)
    handleSelectionChange()
  }
  
  // 更新历史记录
  const nodesData = Array.isArray(getNodes.value) ? getNodes.value : [...getNodes.value]
  const edgesData = Array.isArray(getEdges.value) ? getEdges.value : [...getEdges.value]
  // @ts-ignore - 类型不完全匹配但功能正常
  pushHistory({ nodes: nodesData, edges: edgesData })
}

const onEdgesChange = (changes: any) => {
  console.log('📝 onEdgesChange 触发:', changes)
  
  // 🔑 关键：必须应用 changes
  edges.value = applyChanges(changes, edges.value)
  
  // 更新历史记录
  const nodesData = Array.isArray(getNodes.value) ? getNodes.value : [...getNodes.value]
  const edgesData = Array.isArray(getEdges.value) ? getEdges.value : [...getEdges.value]
  // @ts-ignore - 类型不完全匹配但功能正常
  pushHistory({ nodes: nodesData, edges: edgesData })
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

const onEdgeClick = () => {
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

// 点击画布关闭分组菜单
const onPaneClick = () => {
  // 如果刚刚完成框选，不要立即关闭菜单
  if (isSelectingNodes) {
    isSelectingNodes = false
    return
  }
  groupMenu.value.visible = false
}

const onPaneContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  groupMenu.value.visible = false // 关闭分组菜单
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
  console.log('WorkflowEditor 组件已挂载')
  console.log('VueFlow 配置:', {
    nodes: nodes.value.length,
    edges: edges.value.length,
    selectionMode: SelectionMode.Partial
  })
  
  window.addEventListener('keydown', handleKeyDown)
  // 初始化节点
  initNodes()
  
  // 监听视图变化
  updateZoomLevel()
  const interval = setInterval(updateZoomLevel, 100)
  
  // 在 onUnmounted 中清理
  onUnmounted(() => {
    clearInterval(interval)
  })
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

  // 🔑 关键：直接设置 nodes.value 和 edges.value
  // 而不是使用 setNodes/setEdges
  nodes.value = vueFlowNodes
  edges.value = vueFlowEdges
  
  console.log('✅ 初始化节点完成:', nodes.value.length, '个节点')
  console.log('✅ 初始化边完成:', edges.value.length, '条边')
}

// 工具栏方法
const undo = () => {
  const state = undoHistory()
  if (state) {
    nodes.value = state.nodes
    edges.value = state.edges
  }
}

const redo = () => {
  const state = redoHistory()
  if (state) {
    nodes.value = state.nodes
    edges.value = state.edges
  }
}

// 已移除 clear, addStartNode, addEndNode 函数，使用新的节点选择器

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

  nodes.value = updatedNodes

  // 更新历史记录
  const edgesData = Array.isArray(getEdges.value) ? getEdges.value : [...getEdges.value]
  // @ts-ignore
  pushHistory({ nodes: updatedNodes, edges: edgesData })

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

// 手动处理选中变化
const handleSelectionChange = () => {
  // 获取当前选中的节点
  const selectedNodes = nodes.value.filter((n: any) => n.selected)
  selectedNodeIds.value = selectedNodes.map((n: any) => n.id)
  
  console.log('✅ 选中的节点数量:', selectedNodes.length)
  console.log('✅ 选中的节点:', selectedNodes)

  // 如果选中了多个节点，显示分组菜单
  if (selectedNodes.length >= 2) {
    // 标记正在选择节点，防止 paneClick 立即关闭菜单
    isSelectingNodes = true

    // 计算选中节点的中心位置
    let centerX = 0, centerY = 0
    selectedNodes.forEach((node: any) => {
      centerX += node.position.x
      centerY += node.position.y
    })
    centerX = centerX / selectedNodes.length
    centerY = centerY / selectedNodes.length

    console.log('📍 节点中心位置:', { centerX, centerY })

    // 转换为屏幕坐标
    const screenPos = project({ x: centerX, y: centerY })

    console.log('📍 屏幕坐标:', screenPos)

    // 使用 setTimeout 确保在下一帧显示菜单
    setTimeout(() => {
      groupMenu.value = {
        visible: true,
        x: screenPos.x,
        y: screenPos.y + 50, // 偏移一点显示在下方
      }
      console.log('✅ 浮动菜单已显示:', groupMenu.value)
    }, 0)
  } else {
    groupMenu.value.visible = false
    console.log('ℹ️ 选中节点少于2个，隐藏菜单')
  }
}

// 判断选中的节点中是否有分组
// 检查选中的节点是否属于某个分组
const hasGroupInSelection = computed(() => {
  const selectedNodes = nodes.value.filter((n: any) => n.selected)
  const selectedNodeIds = selectedNodes.map((n: any) => n.id)
  
  // 查找包含这些节点的分组
  return nodes.value.some((n: any) => {
    if (n.type === 'group' && n.data?.nodeIds) {
      // 检查是否有选中的节点在这个分组内
      return n.data.nodeIds.some((id: string) => selectedNodeIds.includes(id))
    }
    return false
  })
})

// 关闭分组菜单
const closeGroupMenu = () => {
  groupMenu.value.visible = false
}

// 创建分组（使用真正的父子节点关系）
const createGroup = () => {
  const selectedNodes = getNodes.value.filter((n: any) => n.selected && n.type !== 'group')
  
  if (selectedNodes.length < 2) {
    alert('请至少选中两个节点来创建分组')
    return
  }

  console.log('🎨 开始创建分组，选中节点:', selectedNodes)

  // 计算分组的边界
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  
  selectedNodes.forEach((node: any) => {
    const nodeWidth = node.width || node.dimensions?.width || 
                     (node.type === 'big-scene' ? 160 : 140)
    const nodeHeight = node.height || node.dimensions?.height || 
                      (node.type === 'big-scene' ? 80 : 70)
    
    minX = Math.min(minX, node.position.x)
    minY = Math.min(minY, node.position.y)
    maxX = Math.max(maxX, node.position.x + nodeWidth)
    maxY = Math.max(maxY, node.position.y + nodeHeight)
  })

  // 添加边距
  const padding = 60
  const groupX = minX - padding
  const groupY = minY - padding
  const groupWidth = maxX - minX + padding * 2
  const groupHeight = maxY - minY + padding * 2

  // 创建分组节点（作为视觉背景）
  const groupId = `group_${Date.now()}`
  const groupNode: Node = {
    id: groupId,
    type: 'group',
    position: { x: groupX, y: groupY },
    data: { 
      label: `分组`,
      nodeCount: selectedNodes.length,
      nodeIds: selectedNodes.map((n: any) => n.id),  // 保存分组内的节点ID
    },
    style: {
      width: `${groupWidth}px`,
      height: `${groupHeight}px`,
      zIndex: -10,  // 确保在所有节点下方
    },
    selectable: false,  // 分组节点不可选中，避免干扰
  }

  console.log('📦 创建分组节点:', groupNode)

  // 🔑 关键逻辑：
  // 1. 设置 parentNode（节点会跟随分组移动）
  // 2. 计算相对坐标（相对于分组的位置）
  // 3. 取消选中状态
  const updatedNodes = getNodes.value.map((node: any) => {
    const isInGroup = selectedNodes.find((n: any) => n.id === node.id)
    
    if (isInGroup) {
      // 计算相对于分组的位置
      const relativeX = node.position.x - groupX
      const relativeY = node.position.y - groupY
      
      console.log(`📍 节点 ${node.id}: 绝对坐标 (${node.position.x}, ${node.position.y}) → 相对坐标 (${relativeX}, ${relativeY})`)
      
      return {
        ...node,
        parentNode: groupId,  // 设置父节点
        // position: { x: relativeX, y: relativeY },  // 转换为相对坐标
        // extent: 'parent' as const,  // 限制在父节点内
        selected: false,  // 取消选中
      }
    }
    
    // 其他节点只取消选中
    return {
      ...node,
      selected: false,
    }
  })

  // 添加分组节点到列表开头（确保它在子节点之前渲染）
  nodes.value = [groupNode, ...updatedNodes]

  // 关闭菜单
  closeGroupMenu()

  // 更新历史记录
  const nodesData = Array.isArray(getNodes.value) ? getNodes.value : [...getNodes.value]
  const edgesData = Array.isArray(getEdges.value) ? getEdges.value : [...getEdges.value]
  // @ts-ignore
  pushHistory({ nodes: nodesData, edges: edgesData })

  console.log('✅ 创建分组成功:', groupId)
}

// 取消分组（从菜单调用）
// 取消分组：删除包含选中节点的分组
const removeGroup = () => {
  const selectedNodes = nodes.value.filter((n: any) => n.selected)
  const selectedNodeIds = selectedNodes.map((n: any) => n.id)
  
  // 找到包含这些节点的分组
  const groupsToRemove = nodes.value.filter((n: any) => {
    if (n.type === 'group' && n.data?.nodeIds) {
      return n.data.nodeIds.some((id: string) => selectedNodeIds.includes(id))
    }
    return false
  })
  
  if (groupsToRemove.length === 0) {
    alert('选中的节点不在任何分组内')
    return
  }

  // 删除这些分组
  groupsToRemove.forEach((groupNode: any) => {
    ungroupNodes(groupNode.id)
  })

  // 关闭菜单
  closeGroupMenu()
  
  console.log(`✅ 已删除 ${groupsToRemove.length} 个分组`)
}

// 解散分组（恢复子节点为独立节点）
const ungroupNodes = (groupId: string) => {
  console.log('🔓 开始解散分组:', groupId)
  
  const groupNode = getNode.value(groupId)
  if (!groupNode) {
    console.warn('分组节点不存在:', groupId)
    return
  }

  const groupPosition = groupNode.position

  // 找到所有属于这个分组的子节点
  const childNodes = getNodes.value.filter((n: any) => n.parentNode === groupId)
  
  console.log('📦 分组内的子节点:', childNodes)

  // 更新节点：移除父子关系并恢复绝对坐标
  const updatedNodes = getNodes.value
    .map((node: any) => {
      if (node.parentNode === groupId) {
        // 计算绝对位置
        const absoluteX = groupPosition.x + node.position.x
        const absoluteY = groupPosition.y + node.position.y
        
        console.log(`📍 节点 ${node.id}: 相对坐标 (${node.position.x}, ${node.position.y}) → 绝对坐标 (${absoluteX}, ${absoluteY})`)
        
        return {
          ...node,
          parentNode: undefined,  // 移除父节点
          extent: undefined,  // 移除限制
          position: { x: absoluteX, y: absoluteY },  // 恢复绝对坐标
        }
      }
      return node
    })
    .filter((node: any) => node.id !== groupId) // 移除分组节点

  nodes.value = updatedNodes

  // 更新历史记录
  const nodesData = Array.isArray(getNodes.value) ? getNodes.value : [...getNodes.value]
  const edgesData = Array.isArray(getEdges.value) ? getEdges.value : [...getEdges.value]
  // @ts-ignore
  pushHistory({ nodes: nodesData, edges: edgesData })

  console.log('✅ 解散分组成功')
}

// GroupNode 相关函数已移除，现在通过浮动菜单操作

// 视图更新已合并到上面的 onMounted 中
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

.toolbar-btn.active {
  background: #4d53e8;
  color: white;
  border-color: #4d53e8;
}

.toolbar-btn.primary {
  background: #4d53e8;
  color: white;
  border-color: #4d53e8;
}

.toolbar-btn.primary:hover:not(:disabled) {
  background: #3b41d6;
  border-color: #3b41d6;
}

.toolbar-divider {
  width: 1px;
  height: 32px;
  background: #e5e7eb;
  margin: 0 8px;
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

/* 浮动分组菜单 */
.group-menu {
  position: fixed;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  min-width: 200px;
  z-index: 2000;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  transform: translate(-50%, 0);
}

.menu-header {
  padding: 12px 16px;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  text-align: center;
}

.group-menu .menu-item {
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #1f2937;
  transition: all 0.15s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
}

.group-menu .menu-item .icon {
  font-size: 16px;
}

.group-menu .menu-item:hover {
  background: #f3f4f6;
  color: #111827;
}

.group-menu .menu-item:active {
  background: #e5e7eb;
}

.group-menu .menu-item.cancel {
  color: #6b7280;
  justify-content: center;
}

.group-menu .menu-item.cancel:hover {
  background: #f9fafb;
  color: #374151;
}

.group-menu .menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translate(-50%, -10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
</style>
