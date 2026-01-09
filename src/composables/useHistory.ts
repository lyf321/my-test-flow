import { ref } from 'vue'
import type { Node, Edge } from '@vue-flow/core'

interface HistoryState {
  nodes: Node[]
  edges: Edge[]
}

export function useHistory(maxHistorySize = 50) {
  const history = ref<HistoryState[]>([])
  const currentIndex = ref(-1)

  const push = (state: HistoryState) => {
    history.value = history.value.slice(0, currentIndex.value + 1)

    const newState: HistoryState = {
      nodes: JSON.parse(JSON.stringify(state.nodes)),
      edges: JSON.parse(JSON.stringify(state.edges)),
    }

    history.value.push(newState)
    currentIndex.value = history.value.length - 1

    if (history.value.length > maxHistorySize) {
      history.value.shift()
      currentIndex.value--
    }
  }

  const undo = (): HistoryState | null => {
    if (currentIndex.value > 0) {
      currentIndex.value--
      return history.value[currentIndex.value]
    }
    return null
  }

  const redo = (): HistoryState | null => {
    if (currentIndex.value < history.value.length - 1) {
      currentIndex.value++
      return history.value[currentIndex.value]
    }
    return null
  }

  const canUndo = () => currentIndex.value > 0
  const canRedo = () => currentIndex.value < history.value.length - 1

  const clear = () => {
    history.value = []
    currentIndex.value = -1
  }

  return {
    push,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
  }
}

