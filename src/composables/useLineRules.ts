import { computed } from 'vue'
import type { Graph } from '@antv/x6'
import { useEditorStore } from '@/stores/editor'

export function useLineRules() {
  const store = useEditorStore()

  const wouldCreateCycle = (sourceId: string, targetId: string): boolean => {
    if (!store.x6Graph) return false

    const graph = store.x6Graph

    // 使用 DFS 检查从 target 是否能到达 source
    const visited = new Set<string>()
    const stack = [targetId]

    while (stack.length > 0) {
      const current = stack.pop()!
      if (current === sourceId) {
        return true // 形成循环
      }
      if (visited.has(current)) {
        continue
      }
      visited.add(current)

      // 找到所有以 current 为源的边
      const outgoingEdges = graph.getOutgoingEdges(current)
      if (outgoingEdges) {
        for (const edge of outgoingEdges) {
          const target = edge.getTargetCell()
          if (target && !visited.has(target.id as string)) {
            stack.push(target.id as string)
          }
        }
      }
    }

    return false
  }

  return {
    wouldCreateCycle,
  }
}

