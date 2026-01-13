<template>
  <div class="workflow-editor x6-editor">
    <div ref="containerRef" class="editor-container"></div>
    
    <!-- 右侧边栏 -->
    <Sidebar :visible="sidebar.visible.value" :node="sidebar.selectedNode.value" @close="sidebar.close" />

    <!-- 节点选择器 -->
    <NodeSelector
      :visible="nodeSelector.visible.value"
      :x="nodeSelector.position.value.x"
      :y="nodeSelector.position.value.y"
      :available-node-types="availableNodeTypes"
      @select="handleNodeTypeSelect"
      @close="nodeSelector.hide"
    />

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
    <div
      v-if="groupMenu.visible"
      class="group-menu"
      :style="{ left: `${groupMenu.x}px`, top: `${groupMenu.y}px` }"
      @click.stop
    >
      <div class="menu-header">已选中 {{ selectedCells.length }} 个节点</div>
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
      <button class="control-btn" @click="focusSelected" :disabled="!hasSelection" title="回到选中节点">
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
import { Graph, Node as X6Node, Edge as X6Edge, Cell } from '@antv/x6'
import { Selection, Snapline, History, Keyboard, MiniMap } from '@antv/x6'
import { useEditorStore } from '@/stores/editor'
import { useLineRulesVueFlow } from '@/composables/useLineRulesVueFlow'
import { useSidebar } from '@/composables/useSidebar'
import { useNodeSelector } from '@/composables/useNodeSelector'
import { initialData } from '@/data/initial-data'
import Sidebar from '../vueflow/Sidebar.vue'
import NodeSelector from '../vueflow/NodeSelector.vue'

const containerRef = ref<HTMLElement>()
const store = useEditorStore()
const { canAddLine } = useLineRulesVueFlow()
const sidebar = useSidebar()
const nodeSelector = useNodeSelector()

let graph: Graph | null = null
const currentZoom = ref(1)
const selectedCells = ref<Cell[]>([])

// 浮动分组菜单
const groupMenu = ref({
  visible: false,
  x: 0,
  y: 0,
})

// 节点类型配置
const NODE_CONFIG = {
  start: { color: '#4d53e8', icon: '▶️', gradient: ['#ffffff', '#f0f9ff'] },
  end: { color: '#ef4444', icon: '⏹️', gradient: ['#ffffff', '#fef2f2'] },
  condition: { color: '#f59e0b', icon: '◆', gradient: ['#ffffff', '#fffbeb'] },
  'big-scene': { color: '#8b5cf6', icon: '🎬', gradient: ['#ffffff', '#faf5ff'] },
  'enter-guide': { color: '#3b82f6', icon: '🎭', gradient: ['#ffffff', '#eff6ff'] },
  'exit-guide': { color: '#ec4899', icon: '🚪', gradient: ['#ffffff', '#fdf2f8'] },
}

onMounted(() => {
  if (!containerRef.value) return

  // 创建画布
  graph = new Graph({
    container: containerRef.value,
    width: containerRef.value.offsetWidth,
    height: containerRef.value.offsetHeight,
    autoResize: true,
    grid: {
      size: 20,
      visible: true,
      type: 'dot',
      args: {
        color: '#d1d5db',
        thickness: 1.5,
      },
    },
    background: {
      color: '#fafbfc',
    },
    highlighting: {
      magnetAdsorbed: {
        name: 'stroke',
        args: {
          attrs: {
            fill: '#4d53e8',
            stroke: '#4d53e8',
          },
        },
      },
    },
    panning: {
      enabled: true,
      eventTypes: ['leftMouseDown', 'mouseWheel'],
    },
    mousewheel: {
      enabled: true,
      modifiers: ['ctrl', 'meta'],
      minScale: 0.2,
      maxScale: 4,
    },
    connecting: {
      router: {
        name: 'manhattan',
        args: {
          padding: 20,
          startDirections: ['bottom'],
          endDirections: ['top'],
        },
      },
      connector: {
        name: 'smooth',
      },
      anchor: 'center',
      connectionPoint: 'anchor',
      allowBlank: false,
      allowLoop: false,
      allowNode: false,
      snap: {
        radius: 20,
      },
      highlight: true,
      createEdge() {
        return graph!.createEdge({
          attrs: {
            line: {
              stroke: '#4d53e8',
              strokeWidth: 2.5,
              targetMarker: {
                name: 'block',
                width: 10,
                height: 8,
                fill: '#4d53e8',
              },
              strokeLinecap: 'round',
            },
          },
          connector: {
            name: 'smooth',
          },
          zIndex: 0,
        })
      },
      validateConnection({ sourceView, targetView, sourceMagnet, targetMagnet }) {
        if (!sourceMagnet || !targetMagnet) return false
        if (sourceView === targetView) return false
        
        const sourceId = sourceView?.cell.id
        const targetId = targetView?.cell.id
        
        if (sourceId && targetId) {
          return canAddLine({
            source: sourceId as string,
            target: targetId as string,
          })
        }
        
        return false
      },
    },
  })

  // 注册节点类型
  registerNodes()

  // 使用插件
  graph.use(
    new Snapline({
      enabled: true,
      sharp: true,
    })
  )

  graph.use(
    new History({
      enabled: true,
    })
  )

  graph.use(
    new Keyboard({
      enabled: true,
    })
  )

  graph.use(
    new Selection({
      enabled: true,
      rubberband: true,
      showNodeSelectionBox: true,
      modifiers: 'shift',
      movable: true,
      multiple: true,
    })
  )

  // 小地图
    graph.use(
      new MiniMap({
      container: document.createElement('div'),
        width: 200,
        height: 160,
        padding: 10,
      })
    )

  // 监听选择变化
  graph.on('selection:changed', ({ selected }) => {
    selectedCells.value = selected
    handleSelectionChange(selected)
  })

  // 监听节点点击
  graph.on('node:click', ({ node }) => {
    const nodeData = node.getData()
    
    if (nodeData.type === 'big-scene' && nodeData.subScenes?.length > 0) {
      sidebar.open({
        id: node.id,
        type: nodeData.type,
        data: nodeData,
        position: node.position(),
      })
    }
  })

  // 监听节点鼠标进入
  graph.on('node:mouseenter', ({ node }) => {
    const data = node.getData()
    if (data.type !== 'group') {
      // 显示加号按钮
      node.attr('add-button-bg/visibility', 'visible')
      node.attr('add-icon/visibility', 'visible')
      
      // 增强悬停效果
      const config = NODE_CONFIG[data.type as keyof typeof NODE_CONFIG]
      if (config) {
        node.attr('body/filter', {
          name: 'dropShadow',
          args: {
            dx: 0,
            dy: 4,
            blur: 16,
            color: config.color,
            opacity: 0.18,
          },
        })
      }
    }
  })

  // 监听节点鼠标离开
  graph.on('node:mouseleave', ({ node }) => {
    const data = node.getData()
    if (data.type !== 'group') {
      node.attr('add-button-bg/visibility', 'hidden')
      node.attr('add-icon/visibility', 'hidden')
      
      // 恢复默认阴影
      const config = NODE_CONFIG[data.type as keyof typeof NODE_CONFIG]
      if (config) {
        node.attr('body/filter', {
          name: 'dropShadow',
          args: {
            dx: 0,
            dy: 2,
            blur: 8,
            color: config.color,
            opacity: 0.12,
          },
        })
      }
    }
  })

  // 监听节点选中
  graph.on('node:selected', ({ node }) => {
    const data = node.getData()
    if (data.type !== 'group') {
      const config = NODE_CONFIG[data.type as keyof typeof NODE_CONFIG]
      if (config) {
        // 选中样式
        node.attr('body/stroke', '#37d0ff')
        node.attr('body/strokeWidth', 3)
        node.attr('body/filter', {
          name: 'dropShadow',
          args: {
            dx: 0,
            dy: 4,
            blur: 16,
            color: '#37d0ff',
            opacity: 0.3,
          },
        })
      }
    }
  })

  // 监听节点取消选中
  graph.on('node:unselected', ({ node }) => {
    const data = node.getData()
    if (data.type !== 'group') {
      const config = NODE_CONFIG[data.type as keyof typeof NODE_CONFIG]
      if (config) {
        // 恢复默认样式
        node.attr('body/stroke', config.color)
        node.attr('body/strokeWidth', 2.5)
        node.attr('body/filter', {
          name: 'dropShadow',
          args: {
            dx: 0,
            dy: 2,
            blur: 8,
            color: config.color,
            opacity: 0.12,
          },
        })
      }
    }
  })

  // 监听加号按钮点击
  graph.on('cell:mousedown', ({ cell, e }) => {
    const target = e.target as SVGElement
    
    // 检查是否点击了加号按钮
    if (target && cell.isNode() && (target.getAttribute('selector') === 'add-button' || target.getAttribute('selector') === 'add-icon')) {
      e.stopPropagation()
      
      const clickedNode = cell as X6Node
      const data = clickedNode.getData()
      const pos = clickedNode.position()
      const size = clickedNode.size()
      
      // 计算屏幕坐标
      const screenPos = graph!.localToClient(pos.x + size.width + 20, pos.y + size.height / 2)
      
      nodeSelector.show(screenPos.x, screenPos.y, {
        type: 'node',
        nodeId: clickedNode.id,
        sourceNodeType: data.type,
      })
    }
  })

  // 监听边鼠标进入
  graph.on('edge:mouseenter', ({ edge }) => {
    // 高亮边
    edge.attr('line/strokeWidth', 3)
    edge.attr('line/stroke', '#5b63eb')
    
    const data = edge.getData()
    if (!data.toolAdded) {
      edge.addTools([
        {
          name: 'button',
          args: {
            markup: [
              {
                tagName: 'circle',
                selector: 'button-bg',
                attrs: {
                  r: 14,
                  fill: '#4d53e8',
                  stroke: '#fff',
                  strokeWidth: 2.5,
                  cursor: 'pointer',
                  filter: {
                    name: 'dropShadow',
                    args: {
                      dx: 0,
                      dy: 2,
                      blur: 6,
                      color: '#4d53e8',
                      opacity: 0.3,
                    },
                  },
                },
              },
              {
                tagName: 'text',
                selector: 'icon',
                attrs: {
                  text: '+',
                  fill: '#fff',
                  fontSize: 18,
                  fontWeight: 'bold',
                  textAnchor: 'middle',
                  alignmentBaseline: 'middle',
                  cursor: 'pointer',
                  y: 1,
                  pointerEvents: 'none',
                },
              },
            ],
            distance: '50%',
            onClick({ edge }: any) {
              const sourceNode = graph!.getCellById(edge.getSourceCellId()) as X6Node
              const targetNode = graph!.getCellById(edge.getTargetCellId()) as X6Node
              
              if (sourceNode && targetNode) {
                const sourcePos = sourceNode.position()
                const targetPos = targetNode.position()
                const midX = (sourcePos.x + targetPos.x) / 2
                const midY = (sourcePos.y + targetPos.y) / 2
                
                const screenPos = graph!.localToClient(midX, midY)
                
                nodeSelector.show(screenPos.x, screenPos.y, {
                  type: 'edge',
                  edgeId: edge.id,
                })
              }
            },
          },
        },
      ])
      edge.setData({ ...data, toolAdded: true })
    }
  })

  // 监听边鼠标离开
  graph.on('edge:mouseleave', ({ edge }) => {
    // 恢复边样式
    edge.attr('line/strokeWidth', 2.5)
    edge.attr('line/stroke', '#4d53e8')
    
    edge.removeTools()
    const data = edge.getData()
    edge.setData({ ...data, toolAdded: false })
  })

  // 监听画布点击
  graph.on('blank:click', () => {
    groupMenu.value.visible = false
    sidebar.close()
  })

  // 监听缩放变化
  graph.on('scale', ({ sx }) => {
    currentZoom.value = sx
  })

  // 快捷键
  setupKeyboard()

  // 初始化节点
  initNodes()

  // 保存实例
  store.setX6Graph(graph)
})

onUnmounted(() => {
  graph?.dispose()
})

// 注册节点类型
const registerNodes = () => {
  if (!graph) return

  // 通用节点注册函数
  const registerNodeType = (
    type: string,
    config: { color: string; icon: string; gradient: string[] },
    width = 140,
    height = 70,
    isCircle = false
  ) => {
    const shape = isCircle ? 'ellipse' : 'rect'
    
  Graph.registerNode(
      type,
      {
        inherit: shape,
        width,
        height,
        markup: [
          // 主背景
          {
            tagName: shape === 'ellipse' ? 'ellipse' : 'rect',
            selector: 'body',
          },
          // 图标（仅非圆形节点）
          ...(isCircle ? [] : [{
            tagName: 'text',
            selector: 'icon',
      attrs: {
              x: width / 2,
              y: height / 3,
              text: config.icon,
              fontSize: 20,
              textAnchor: 'middle',
              alignmentBaseline: 'middle',
            },
          }]),
          // 标签
          {
            tagName: 'text',
            selector: 'label',
          },
          // 加号按钮背景
          {
            tagName: 'circle',
            selector: 'add-button-bg',
            attrs: {
              cx: width + 16,
              cy: height / 2,
              r: 14,
              fill: config.color,
              stroke: '#fff',
              strokeWidth: 2.5,
              cursor: 'pointer',
              visibility: 'hidden',
              filter: 'drop-shadow(0 2px 6px rgba(77, 83, 232, 0.3))',
            },
          },
          // 加号图标
          {
            tagName: 'text',
            selector: 'add-icon',
            attrs: {
              x: width + 16,
              y: height / 2 + 1,
              text: '+',
                fill: '#fff',
              fontSize: 18,
              fontWeight: 'bold',
              textAnchor: 'middle',
              alignmentBaseline: 'middle',
              cursor: 'pointer',
              visibility: 'hidden',
              pointerEvents: 'none',
            },
          },
        ],
        attrs: {
          body: {
            stroke: config.color,
            strokeWidth: 2.5,
            fill: {
              type: 'linearGradient',
              stops: [
                { offset: '0%', color: config.gradient[0] },
                { offset: '100%', color: config.gradient[1] },
              ],
              attrs: {
                x1: '0%',
                y1: '0%',
                x2: '100%',
                y2: '100%',
              },
            },
            rx: isCircle ? 0 : 12,
            ry: isCircle ? 0 : 12,
            filter: {
              name: 'dropShadow',
              args: {
                dx: 0,
                dy: 2,
                blur: 8,
                color: config.color,
                opacity: 0.12,
              },
            },
          },
          label: {
            text: '',
            fill: '#1f2937',
            fontSize: 13,
            fontWeight: 600,
            textAnchor: 'middle',
            alignmentBaseline: 'middle',
            refX: '50%',
            refY: isCircle ? '50%' : '60%',
        },
      },
      ports: {
        groups: {
            top: {
            position: 'top',
            attrs: {
              circle: {
                  r: 5,
                magnet: true,
                  stroke: config.color,
                strokeWidth: 2,
                fill: '#fff',
              },
            },
          },
            bottom: {
              position: 'bottom',
              attrs: {
                circle: {
                  r: 5,
                  magnet: true,
                  stroke: config.color,
                  strokeWidth: 2,
                  fill: '#fff',
                },
              },
            },
          },
          items: [
            { group: 'top', id: 'top' },
            { group: 'bottom', id: 'bottom' },
          ],
        },
        data: { type },
    },
    true
  )
  }

  // 注册所有节点类型
  registerNodeType('start', NODE_CONFIG.start, 120, 60, true)
  registerNodeType('end', NODE_CONFIG.end, 120, 60, true)
  registerNodeType('condition', NODE_CONFIG.condition, 140, 70, false)
  registerNodeType('big-scene', NODE_CONFIG['big-scene'], 160, 80, false)
  registerNodeType('enter-guide', NODE_CONFIG['enter-guide'], 140, 70, false)
  registerNodeType('exit-guide', NODE_CONFIG['exit-guide'], 140, 70, false)

  // 注册分组节点
  Graph.registerNode(
    'group',
    {
      inherit: 'rect',
      width: 400,
      height: 300,
      markup: [
        {
          tagName: 'rect',
          selector: 'body',
        },
        {
          tagName: 'rect',
          selector: 'header',
        },
        {
          tagName: 'text',
          selector: 'icon',
        },
        {
          tagName: 'text',
          selector: 'label',
        },
      ],
            attrs: {
        body: {
                stroke: '#4d53e8',
                strokeWidth: 2,
          strokeDasharray: '6,4',
          fill: {
            type: 'linearGradient',
            stops: [
              { offset: '0%', color: 'rgba(77, 83, 232, 0.02)' },
              { offset: '100%', color: 'rgba(77, 83, 232, 0.05)' },
            ],
            attrs: {
              x1: '0%',
              y1: '0%',
              x2: '100%',
              y2: '100%',
            },
          },
          rx: 16,
          ry: 16,
        },
        header: {
          width: 'calc(w)',
          height: 36,
          fill: 'rgba(77, 83, 232, 0.1)',
          rx: 16,
          ry: 16,
          refX: 0,
          refY: 0,
        },
        icon: {
          text: '📦',
          fill: '#4d53e8',
          fontSize: 14,
          fontWeight: 600,
          refX: 16,
          refY: 18,
          textAnchor: 'start',
          alignmentBaseline: 'middle',
        },
        label: {
          text: '分组',
          fill: '#4d53e8',
          fontSize: 13,
          fontWeight: 600,
          refX: 36,
          refY: 18,
          textAnchor: 'start',
          alignmentBaseline: 'middle',
        },
      },
      zIndex: -10,
      data: { type: 'group' },
    },
    true
  )
}

// 初始化节点
const initNodes = () => {
  if (!graph) return

  initialData.nodes.forEach((nodeData: any) => {
    graph!.addNode({
      id: nodeData.id,
      shape: nodeData.type,
      x: nodeData.position.x,
      y: nodeData.position.y,
      attrs: {
        label: {
          text: nodeData.data.title || nodeData.type,
        },
      },
      data: {
        ...nodeData.data,
        type: nodeData.type,
      },
    })
  })

  initialData.edges.forEach((edgeData: any) => {
    graph!.addEdge({
      id: edgeData.id,
      source: edgeData.source,
      target: edgeData.target,
      attrs: {
        line: {
          stroke: '#4d53e8',
          strokeWidth: 2.5,
          targetMarker: {
            name: 'block',
            width: 12,
            height: 8,
          },
        },
      },
    })
  })

  graph.centerContent()
}

// 快捷键设置
const setupKeyboard = () => {
  if (!graph) return

  graph.bindKey(['meta+z', 'ctrl+z'], () => {
      graph!.undo()
    return false
  })

  graph.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
      graph!.redo()
    return false
  })

  graph.bindKey(['delete', 'backspace'], () => {
    const cells = graph!.getSelectedCells()
    if (cells.length) {
      graph!.removeCells(cells)
    }
    return false
  })
}

// 处理选择变化
let isSelectingNodes = false
const handleSelectionChange = (selected: Cell[]) => {
  if (selected.length >= 2) {
    isSelectingNodes = true

    // 计算选中节点的中心位置
    let totalX = 0
    let totalY = 0
    
    selected.forEach(cell => {
      if (cell.isNode()) {
        const pos = cell.position()
        totalX += pos.x
        totalY += pos.y
      }
    })

    const centerX = totalX / selected.length
    const centerY = totalY / selected.length

    // 转换为屏幕坐标
    const screenPos = graph!.localToClient(centerX, centerY)

    setTimeout(() => {
      groupMenu.value = {
        visible: true,
        x: screenPos.x,
        y: screenPos.y + 50,
      }
    }, 0)
  } else {
    if (!isSelectingNodes) {
      groupMenu.value.visible = false
    }
    isSelectingNodes = false
  }
}

// 关闭分组菜单
const closeGroupMenu = () => {
  groupMenu.value.visible = false
}

// 创建分组
const createGroup = () => {
  if (!graph) return

  const selected = graph.getSelectedCells().filter(cell => {
    const data = cell.getData()
    return cell.isNode() && data.type !== 'group'
  })

  if (selected.length < 2) {
    alert('请至少选中两个节点来创建分组')
    return
  }

  // 计算边界
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  selected.forEach(cell => {
    const bbox = cell.getBBox()
    minX = Math.min(minX, bbox.x)
    minY = Math.min(minY, bbox.y)
    maxX = Math.max(maxX, bbox.x + bbox.width)
    maxY = Math.max(maxY, bbox.y + bbox.height)
  })

  const padding = 60
  const groupX = minX - padding
  const groupY = minY - padding
  const groupWidth = maxX - minX + padding * 2
  const groupHeight = maxY - minY + padding * 2

  // 创建分组节点
  const groupNode = graph.addNode({
    shape: 'group',
    x: groupX,
    y: groupY,
    width: groupWidth,
    height: groupHeight,
    attrs: {
      label: {
        text: `分组 (${selected.length})`,
      },
    },
    zIndex: -10,
    data: {
      type: 'group',
      nodeIds: selected.map(cell => cell.id),
      nodeCount: selected.length,
    },
  })

  // 设置父子关系
  selected.forEach(cell => {
    if (cell.isNode()) {
      groupNode.addChild(cell)
    }
  })

  // 取消选中
  graph.cleanSelection()
  closeGroupMenu()

  console.log('✅ 创建分组成功')
}

// 检查是否有分组在选中的节点中
const hasGroupInSelection = computed(() => {
  if (!graph) return false
  
  const selected = selectedCells.value
  const selectedNodeIds = selected.map(cell => cell.id)
  
  // 检查是否有任何分组包含选中的节点
  const allNodes = graph.getNodes()
  return allNodes.some(node => {
    const data = node.getData()
    if (data.type === 'group' && data.nodeIds) {
      return data.nodeIds.some((id: string) => selectedNodeIds.includes(id))
    }
    return false
  })
})

// 取消分组
const removeGroup = () => {
  if (!graph) return

  const selected = selectedCells.value
  const selectedNodeIds = selected.map(cell => cell.id)
  
  // 找到包含这些节点的分组
  const allNodes = graph.getNodes()
  const groupsToRemove = allNodes.filter(node => {
    const data = node.getData()
    if (data.type === 'group' && data.nodeIds) {
      return data.nodeIds.some((id: string) => selectedNodeIds.includes(id))
    }
    return false
  })
  
  if (groupsToRemove.length === 0) {
    alert('选中的节点不在任何分组内')
    return
  }

  // 删除分组
  groupsToRemove.forEach(groupNode => {
    const children = groupNode.getChildren()
    if (children) {
      children.forEach(child => {
        groupNode.removeChild(child)
      })
    }
    graph!.removeNode(groupNode.id)
  })

  closeGroupMenu()
  console.log(`✅ 已删除 ${groupsToRemove.length} 个分组`)
}

// 计算可用的节点类型
const availableNodeTypes = computed(() => {
  const context = nodeSelector.context.value
  if (!context) return nodeSelector.nodeTypes

  if (context.type === 'node' && context.sourceNodeType) {
    return nodeSelector.getAvailableNodeTypes(context.sourceNodeType)
  }

  return nodeSelector.nodeTypes
})

// 显示添加节点菜单
const showAddNodeMenu = () => {
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2

  nodeSelector.show(centerX, centerY, {
    type: 'node',
    nodeId: undefined,
    sourceNodeType: undefined,
  })
}

// 处理节点类型选择
const handleNodeTypeSelect = (nodeType: any) => {
  if (!graph) return

  const context = nodeSelector.context.value

  if (context?.type === 'node' && context.nodeId) {
    // 从节点添加
    const sourceNode = graph.getCellById(context.nodeId) as X6Node
    if (sourceNode) {
      const sourcePos = sourceNode.position()
      const sourceSize = sourceNode.size()
      
      const newNode = graph.addNode({
        shape: nodeType.type,
        x: sourcePos.x + sourceSize.width + 150,
        y: sourcePos.y,
        attrs: {
          label: {
            text: nodeType.label,
          },
        },
        data: {
          type: nodeType.type,
          title: nodeType.label,
          hasDetails: nodeType.type === 'big-scene',
          subScenes: nodeType.type === 'big-scene' ? [] : undefined,
        },
      })

      // 创建连线
      graph.addEdge({
        source: sourceNode.id,
        target: newNode.id,
        attrs: {
          line: {
            stroke: '#4d53e8',
            strokeWidth: 1,
            targetMarker: {
              name: 'block',
              width: 12,
              height: 8,
            },
          },
        },
      })

      graph.select(newNode)
    }
  } else if (context?.type === 'edge' && context.edgeId) {
    // 在边中间插入
    const edge = graph.getCellById(context.edgeId) as X6Edge
    if (edge) {
      const sourceNode = graph.getCellById(edge.getSourceCellId()) as X6Node
      const targetNode = graph.getCellById(edge.getTargetCellId()) as X6Node
      
      if (sourceNode && targetNode) {
        const sourcePos = sourceNode.position()
        const targetPos = targetNode.position()
        const midX = (sourcePos.x + targetPos.x) / 2
        const midY = (sourcePos.y + targetPos.y) / 2
        
        const newNode = graph.addNode({
          shape: nodeType.type,
          x: midX - 70,
          y: midY - 35,
          attrs: {
            label: {
              text: nodeType.label,
            },
          },
          data: {
            type: nodeType.type,
            title: nodeType.label,
            hasDetails: nodeType.type === 'big-scene',
            subScenes: nodeType.type === 'big-scene' ? [] : undefined,
          },
        })

        // 删除原边
        graph.removeEdge(edge.id)

        // 创建两条新边
        graph.addEdge({
          source: edge.getSourceCellId(),
          target: newNode.id,
      attrs: {
        line: {
          stroke: '#4d53e8',
              strokeWidth: 2.5,
          targetMarker: {
            name: 'block',
            width: 12,
            height: 8,
          },
        },
      },
    })

        graph.addEdge({
          source: newNode.id,
          target: edge.getTargetCellId(),
          attrs: {
            line: {
              stroke: '#4d53e8',
              strokeWidth: 2.5,
              targetMarker: {
                name: 'block',
                width: 12,
                height: 8,
              },
            },
          },
        })

        graph.select(newNode)
      }
    }
  } else {
    // 从工具栏添加
    const scale = graph.transform.getScale()
    const translation = graph.translate()
    
    const canvasX = (window.innerWidth / 2 - translation.tx) / scale.sx
    const canvasY = (window.innerHeight / 2 - translation.ty) / scale.sy

    const newNode = graph.addNode({
      shape: nodeType.type,
      x: canvasX - 70,
      y: canvasY - 35,
      attrs: {
        label: {
          text: nodeType.label,
        },
      },
      data: {
        type: nodeType.type,
        title: nodeType.label,
        hasDetails: nodeType.type === 'big-scene',
        subScenes: nodeType.type === 'big-scene' ? [] : undefined,
      },
    })

    graph.select(newNode)
  }
  
  nodeSelector.hide()
}

// 整理节点
const arrangeNodes = () => {
  if (!graph) return

  const nodes = graph.getNodes()
  if (nodes.length === 0) return

  // 简单的层次布局
  const edges = graph.getEdges()
  const nodeMap = new Map(nodes.map(node => [node.id, node]))
  const levels = new Map<string, number>()
  const visited = new Set<string>()

  const calculateLevel = (nodeId: string, level: number) => {
    if (visited.has(nodeId)) return
    visited.add(nodeId)

    const currentLevel = levels.get(nodeId) || 0
    levels.set(nodeId, Math.max(currentLevel, level))

    const outgoing = edges.filter(edge => edge.getSourceCellId() === nodeId)
    outgoing.forEach(edge => {
      const targetId = edge.getTargetCellId()
      if (targetId) {
        calculateLevel(targetId, level + 1)
      }
    })
  }

  // 找到起始节点
  const startNodes = nodes.filter(node => {
    const hasIncoming = edges.some(edge => edge.getTargetCellId() === node.id)
    return !hasIncoming
  })

  startNodes.forEach(node => calculateLevel(node.id, 0))

  // 按层级分组
  const levelGroups = new Map<number, X6Node[]>()
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

  // 更新位置
  levels.forEach((level, nodeId) => {
    const node = nodeMap.get(nodeId)
    if (node) {
      const nodesInLevel = levelGroups.get(level) || []
      const indexInLevel = nodesInLevel.findIndex(n => n.id === nodeId)

      node.position(
        startX + level * horizontalSpacing,
        startY + indexInLevel * verticalSpacing
      )
    }
  })

  // 居中显示
  setTimeout(() => {
    graph!.centerContent()
  }, 100)
}

// 右下角控制
const hasSelection = computed(() => selectedCells.value.length > 0)

const focusSelected = () => {
  if (!graph) return

  const selected = graph.getSelectedCells()
  if (selected.length > 0) {
    graph.centerCell(selected[0])
  }
}

const zoomIn = () => {
  if (!graph) return
  graph.zoom(0.1)
}

const zoomOut = () => {
  if (!graph) return
  graph.zoom(-0.1)
}
</script>

<style scoped>
.x6-editor {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.editor-container {
  flex: 1;
  overflow: hidden;
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

.control-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #4d53e8;
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
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  min-width: 200px;
  z-index: 2000;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  transform: translate(-50%, 0);
}

.menu-header {
  padding: 12px 16px;
  background: #f9fafb;
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

.group-menu .menu-item.cancel {
  color: #6b7280;
  justify-content: center;
}

.group-menu .menu-item.cancel:hover {
  background: #f9fafb;
}

.group-menu .menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
}
</style>

