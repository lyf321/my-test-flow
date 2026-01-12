import { computed } from 'vue'
import { useVueFlow, type Connection } from '@vue-flow/core'

export function useLineRulesVueFlow() {
  const { getNodes, getEdges, getNode } = useVueFlow()

  const canAddLine = (connection: Connection): boolean => {
    const { source, target } = connection

    // 1. 不能自连接
    if (source === target) {
      console.log('连线失败：不能自连接')
      return false
    }

    // 2. 检查是否已存在连线
    const existingEdge = getEdges.value.find(
      e => e.source === source && e.target === target
    )
    if (existingEdge) {
      console.log('连线失败：已存在相同连线')
      return false
    }

    // 3. 检查是否会形成循环
    if (wouldCreateCycle(source, target)) {
      console.log('连线失败：会形成循环')
      return false
    }

    // 4. 检查节点类型连线规则
    const sourceNode = getNode.value(source)
    const targetNode = getNode.value(target)
    
    if (sourceNode && targetNode) {
      if (!isValidConnection(sourceNode.type, targetNode.type)) {
        console.log(`连线失败：${sourceNode.type} 不能连接到 ${targetNode.type}`)
        return false
      }
    }

    // 5. 检查特殊节点的连线数量限制
    if (sourceNode) {
      const outgoingEdges = getEdges.value.filter(e => e.source === source)
      
      // 开始节点只能有一条出线
      if (sourceNode.type === 'start' && outgoingEdges.length >= 1) {
        console.log('连线失败：开始节点只能有一条出线')
        return false
      }
      
      // 结束节点不能有出线
      if (sourceNode.type === 'end') {
        console.log('连线失败：结束节点不能有出线')
        return false
      }
      
      // 入戏引导、出戏引导只能有一条出线
      if (['enter-guide', 'exit-guide'].includes(sourceNode.type || '') && outgoingEdges.length >= 1) {
        console.log('连线失败：引导节点只能有一条出线')
        return false
      }
    }

    if (targetNode) {
      const incomingEdges = getEdges.value.filter(e => e.target === target)
      
      // 开始节点不能有入线
      if (targetNode.type === 'start') {
        console.log('连线失败：开始节点不能有入线')
        return false
      }
      
      // 结束节点、入戏引导、出戏引导可以有多条入线
      // 大场景节点可以有多条入线
    }

    return true
  }

  // 验证节点类型之间的连接是否合法
  const isValidConnection = (sourceType: string | undefined, targetType: string | undefined): boolean => {
    if (!sourceType || !targetType) return true

    const rules: Record<string, string[]> = {
      'start': ['big-scene', 'enter-guide'],
      'big-scene': ['big-scene', 'enter-guide', 'exit-guide', 'end'],
      'enter-guide': ['big-scene'],
      'exit-guide': ['big-scene', 'end'],
      'end': [],
    }

    const allowedTargets = rules[sourceType]
    if (!allowedTargets) return true

    return allowedTargets.includes(targetType)
  }

  const wouldCreateCycle = (source: string, target: string): boolean => {
    const visited = new Set<string>()
    const stack = [target]

    while (stack.length > 0) {
      const current = stack.pop()!
      if (current === source) {
        return true
      }
      if (visited.has(current)) {
        continue
      }
      visited.add(current)

      const outgoingEdges = getEdges.value.filter(e => e.source === current)
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          stack.push(edge.target)
        }
      }
    }

    return false
  }

  return {
    canAddLine,
    wouldCreateCycle,
    isValidConnection,
  }
}

