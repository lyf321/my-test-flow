import { ref } from 'vue'
import type { Node, Edge } from '@vue-flow/core'

export interface NodeType {
  id: string
  label: string
  icon?: string
  type: string
}

export const nodeTypes: NodeType[] = [
  { id: 'start', label: '开始', icon: '▶', type: 'start' },
  { id: 'end', label: '结束', icon: '■', type: 'end' },
  { id: 'big-scene', label: '大场景', icon: '🎬', type: 'big-scene' },
  { id: 'enter-guide', label: '入戏引导', icon: '→', type: 'enter-guide' },
  { id: 'exit-guide', label: '出戏引导', icon: '←', type: 'exit-guide' },
]

export function useNodeSelector() {
  const visible = ref(false)
  const position = ref({ x: 0, y: 0 })
  const context = ref<{
    type: 'node' | 'edge'
    nodeId?: string
    edgeId?: string
    sourceNodeType?: string
  } | null>(null)

  const show = (x: number, y: number, contextData: { type: 'node' | 'edge'; nodeId?: string; edgeId?: string; sourceNodeType?: string }) => {
    position.value = { x, y }
    context.value = contextData
    visible.value = true
  }

  const hide = () => {
    visible.value = false
    context.value = null
  }

  // 根据上下文过滤可用的节点类型
  const getAvailableNodeTypes = (sourceNodeType?: string): NodeType[] => {
    if (!sourceNodeType) {
      return nodeTypes
    }

    // 根据源节点类型过滤可添加的节点类型
    switch (sourceNodeType) {
      case 'start':
        // 开始节点后面可以接：大场景、入戏引导
        return nodeTypes.filter(t => ['big-scene', 'enter-guide'].includes(t.type))
      case 'big-scene':
        // 大场景后面可以接：大场景、入戏引导、出戏引导、结束
        return nodeTypes.filter(t => ['big-scene', 'enter-guide', 'exit-guide', 'end'].includes(t.type))
      case 'enter-guide':
        // 入戏引导后面可以接：大场景
        return nodeTypes.filter(t => t.type === 'big-scene')
      case 'exit-guide':
        // 出戏引导后面可以接：大场景、结束
        return nodeTypes.filter(t => ['big-scene', 'end'].includes(t.type))
      case 'end':
        // 结束节点后面不能接任何节点
        return []
      default:
        return nodeTypes
    }
  }

  return {
    visible,
    position,
    context,
    nodeTypes,
    show,
    hide,
    getAvailableNodeTypes,
  }
}

