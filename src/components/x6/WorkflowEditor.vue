<template>
  <div class="workflow-editor x6-editor">
    <div ref="containerRef" class="editor-container"></div>
    <div id="minimap" class="minimap"></div>
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Graph, Snapline, Clipboard, History, Keyboard, Selection, MiniMap } from '@antv/x6'
import { useEditorStore } from '@/stores/editor'
import { useLineRules } from '@/composables/useLineRules'
import { initialData } from '@/data/initial-data'

const containerRef = ref<HTMLElement>()
const store = useEditorStore()
const { wouldCreateCycle } = useLineRules()

let graph: Graph | null = null
const canUndo = ref(false)
const canRedo = ref(false)

onMounted(() => {
  if (!containerRef.value) return

  // 创建画布
  graph = new Graph({
    container: containerRef.value,
    width: containerRef.value.offsetWidth,
    height: containerRef.value.offsetHeight,
    grid: {
      size: 20,
      visible: true,
      type: 'dot',
      args: {
        color: '#e5e7eb',
        thickness: 1,
      },
    },
    background: {
      color: '#f9fafb',
    },
    // 启用对齐线
    snapline: {
      enabled: true,
      sharp: true,
    },
    // 连线配置
    connecting: {
      router: {
        name: 'manhattan',
        args: {
          padding: 1,
        },
      },
      connector: {
        name: 'rounded',
        args: {
          radius: 8,
        },
      },
      anchor: 'center',
      connectionPoint: 'anchor',
      allowBlank: false,
      allowLoop: false,
      allowNode: false,
      highlight: true,
      snap: {
        radius: 20,
      },
      // 连线规则验证
      validateConnection: ({ sourceView, targetView }) => {
        if (sourceView === targetView) {
          return false
        }
        if (sourceView && targetView) {
          const sourceId = sourceView.cell.id as string
          const targetId = targetView.cell.id as string
          if (wouldCreateCycle(sourceId, targetId)) {
            return false
          }
        }
        return true
      },
    },
    // 鼠标滚轮缩放
    mousewheel: {
      enabled: true,
      modifiers: ['ctrl', 'meta'],
      minScale: 0.2,
      maxScale: 4,
    },
    // 平移画布
    panning: {
      enabled: true,
      eventTypes: ['leftMouseDown', 'mouseWheel'],
    },
  })

  // 注册节点类型
  registerNodes()

  // 使用对齐线插件
  graph.use(
    new Snapline({
      enabled: true,
      sharp: true,
    })
  )

  // 使用历史记录插件
  const history = graph.use(
    new History({
      enabled: true,
    })
  )

  // 监听历史记录变化
  history.on('change', () => {
    canUndo.value = graph!.canUndo()
    canRedo.value = graph!.canRedo()
  })

  // 使用快捷键插件
  graph.use(
    new Keyboard({
      enabled: true,
    })
  )

  // 使用选择插件
  graph.use(
    new Selection({
      enabled: true,
      rubberband: true,
      showNodeSelectionBox: true,
      modifiers: 'shift',
      movable: true,
    })
  )

  // 使用小地图插件
  const minimapContainer = document.getElementById('minimap')
  if (minimapContainer) {
    graph.use(
      new MiniMap({
        enabled: true,
        container: minimapContainer,
        width: 200,
        height: 160,
        padding: 10,
      })
    )
  }

  // 使用剪贴板插件
  graph.use(
    new Clipboard({
      enabled: true,
    })
  )

  // 配置快捷键
  setupShortcuts()

  // 配置右键菜单
  setupContextMenu()

  // 初始化节点
  initNodes()

  // 保存 graph 实例到 store
  store.setX6Graph(graph)
})

onUnmounted(() => {
  graph?.dispose()
})

// 注册节点类型
const registerNodes = () => {
  if (!graph) return

  // 注册开始节点
  Graph.registerNode(
    'start',
    {
      inherit: 'rect',
      width: 120,
      height: 60,
      attrs: {
        body: {
          stroke: '#4d53e8',
          fill: '#fff',
          rx: 8,
          ry: 8,
          strokeWidth: 2,
        },
        text: {
          fill: '#333',
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
      ports: {
        groups: {
          output: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 6,
                magnet: true,
                stroke: '#4d53e8',
                strokeWidth: 2,
                fill: '#fff',
              },
            },
          },
        },
        items: [
          {
            group: 'output',
          },
        ],
      },
    },
    true
  )

  // 注册结束节点
  Graph.registerNode(
    'end',
    {
      inherit: 'rect',
      width: 120,
      height: 60,
      attrs: {
        body: {
          stroke: '#4d53e8',
          fill: '#fff',
          rx: 8,
          ry: 8,
          strokeWidth: 2,
        },
        text: {
          fill: '#333',
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
      ports: {
        groups: {
          input: {
            position: 'top',
            attrs: {
              circle: {
                r: 6,
                magnet: true,
                stroke: '#4d53e8',
                strokeWidth: 2,
                fill: '#fff',
              },
            },
          },
        },
        items: [
          {
            group: 'input',
          },
        ],
      },
    },
    true
  )

  // 注册条件节点
  Graph.registerNode(
    'condition',
    {
      inherit: 'polygon',
      width: 120,
      height: 60,
      attrs: {
        body: {
          stroke: '#4d53e8',
          fill: '#fff',
          strokeWidth: 2,
          refPoints: '0,10 10,0 20,10 10,20',
        },
        text: {
          fill: '#333',
          fontSize: 14,
        },
      },
      ports: {
        groups: {
          input: {
            position: 'top',
            attrs: {
              circle: {
                r: 6,
                magnet: true,
                stroke: '#4d53e8',
                strokeWidth: 2,
                fill: '#fff',
              },
            },
          },
          output: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 6,
                magnet: true,
                stroke: '#4d53e8',
                strokeWidth: 2,
                fill: '#fff',
              },
            },
          },
        },
        items: [
          { group: 'input' },
          { group: 'output' },
        ],
      },
    },
    true
  )
}

// 配置快捷键
const setupShortcuts = () => {
  if (!graph) return

  graph.bindKey(['meta+c', 'ctrl+c'], () => {
    const cells = graph!.getSelectedCells()
    if (cells.length) {
      graph!.copy(cells)
    }
    return false
  })

  graph.bindKey(['meta+v', 'ctrl+v'], () => {
    if (!graph!.isClipboardEmpty()) {
      const cells = graph!.paste({ offset: 32 })
      graph!.cleanSelection()
      graph!.select(cells)
    }
    return false
  })

  graph.bindKey(['meta+z', 'ctrl+z'], () => {
    if (graph!.canUndo()) {
      graph!.undo()
    }
    return false
  })

  graph.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
    if (graph!.canRedo()) {
      graph!.redo()
    }
    return false
  })

  graph.bindKey(['delete', 'backspace'], () => {
    const cells = graph!.getSelectedCells()
    if (cells.length) {
      graph!.removeCells(cells)
    }
    return false
  })

  graph.bindKey(['meta+a', 'ctrl+a'], () => {
    const cells = graph!.getCells()
    graph!.select(cells)
    return false
  })

  graph.bindKey(['meta+g', 'ctrl+g'], () => {
    const cells = graph!.getSelectedCells()
    if (cells.length > 1) {
      const group = graph!.groupCells(cells)
      if (group) {
        graph!.cleanSelection()
        graph!.select(group)
      }
    }
    return false
  })
}

// 配置右键菜单
const setupContextMenu = () => {
  if (!graph) return

  graph.on('node:contextmenu', ({ e, node }) => {
    e.preventDefault()
    e.stopPropagation()

    console.log('右键菜单')

    // const menu = new ContextMenu({
    //   items: [
    //     {
    //       label: '复制',
    //       onClick: () => {
    //         graph!.copy([node])
    //       },
    //     },
    //     {
    //       label: '删除',
    //       onClick: () => {
    //         graph!.removeCells([node])
    //       },
    //     },
    //     { divider: true },
    //     {
    //       label: '分组',
    //       onClick: () => {
    //         const cells = graph!.getSelectedCells()
    //         if (cells.length > 1) {
    //           graph!.groupCells(cells)
    //         }
    //       },
    //     },
    //   ],
    // })
    // menu.show(e.clientX, e.clientY)
  })
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
      label: nodeData.data.title || nodeData.type,
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
          strokeWidth: 2,
          targetMarker: {
            name: 'block',
            width: 12,
            height: 8,
          },
        },
      },
    })
  })

  // 居中显示
  graph.centerContent()
}

// 工具栏方法
const undo = () => {
  if (graph?.canUndo()) {
    graph.undo()
  }
}

const redo = () => {
  if (graph?.canRedo()) {
    graph.redo()
  }
}

const clear = () => {
  if (graph) {
    graph.clearCells()
  }
}

const addStartNode = () => {
  if (!graph) return
  const node = graph.addNode({
    shape: 'start',
    x: 100,
    y: 100,
    label: 'Start',
  })
  graph.select([node])
}

const addEndNode = () => {
  if (!graph) return
  const node = graph.addNode({
    shape: 'end',
    x: 300,
    y: 100,
    label: 'End',
  })
  graph.select([node])
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

.minimap {
  position: absolute;
  right: 20px;
  bottom: 80px;
  width: 200px;
  height: 160px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: white;
  z-index: 10;
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

