import { ref, computed } from 'vue'
import { nodeRegistry } from '@/core/node-registry'
import type { NodeDefinition } from '@/types/node'

export interface NodeType {
  id: string
  label: string
  icon?: string
  type: string
}

export function useNodeSelector() {
  const visible = ref(false)
  const position = ref({ x: 0, y: 0 })
  const context = ref<{
    type: 'node' | 'edge'
    nodeId?: string
    edgeId?: string
    sourceNodeType?: string
  } | null>(null)

  // 从注册表获取所有节点类型
  const nodeTypes = computed(() => {
    return nodeRegistry.getAllNodeTypes().map(def => ({
      id: def.type,
      label: def.name,
      icon: def.icon,
      type: def.type,
    }))
  })

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
    const allTypes = nodeTypes.value

    if (!sourceNodeType) {
      return allTypes
    }

    // 根据源节点类型过滤可添加的节点类型
    switch (sourceNodeType) {
      case 'start':
        // 开始节点后面可以接：大场景、入戏引导
        return allTypes.filter(t => ['big-scene', 'enter-guide'].includes(t.type))
      case 'big-scene':
        // 大场景后面可以接：大场景、入戏引导、出戏引导、结束
        return allTypes.filter(t => ['big-scene', 'enter-guide', 'exit-guide', 'end'].includes(t.type))
      case 'enter-guide':
        // 入戏引导后面可以接：大场景
        return allTypes.filter(t => t.type === 'big-scene')
      case 'exit-guide':
        // 出戏引导后面可以接：大场景、结束
        return allTypes.filter(t => ['big-scene', 'end'].includes(t.type))
      case 'end':
        // 结束节点后面不能接任何节点
        return []
      default:
        return allTypes
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

