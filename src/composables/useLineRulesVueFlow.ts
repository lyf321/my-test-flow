import { computed } from 'vue'
import { useVueFlow, type Connection } from '@vue-flow/core'

export function useLineRulesVueFlow() {
  const { getNodes, getEdges } = useVueFlow()

  const canAddLine = (connection: Connection): boolean => {
    const { source, target } = connection

    // 1. 不能自连接
    if (source === target) {
      return false
    }

    // 2. 检查是否已存在连线
    const existingEdge = getEdges.value.find(
      e => e.source === source && e.target === target
    )
    if (existingEdge) {
      return false
    }

    // 3. 检查是否会形成循环
    if (wouldCreateCycle(source, target)) {
      return false
    }

    return true
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
  }
}

