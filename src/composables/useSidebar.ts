import { ref } from 'vue'
import type { Node } from '@vue-flow/core'

export function useSidebar() {
  const visible = ref(false)
  const selectedNode = ref<Node | null>(null)

  const open = (node: Node) => {
    selectedNode.value = node
    visible.value = true
  }

  const close = () => {
    visible.value = false
    selectedNode.value = null
  }

  const toggle = (node: Node | null) => {
    if (visible.value && selectedNode.value?.id === node?.id) {
      close()
    } else if (node) {
      open(node)
    } else {
      close()
    }
  }

  return {
    visible,
    selectedNode,
    open,
    close,
    toggle,
  }
}

