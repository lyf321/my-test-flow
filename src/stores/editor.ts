import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Graph } from '@antv/x6'
import { initialData } from '@/data/initial-data'

export const useEditorStore = defineStore('editor', () => {
  // X6 Graph 实例
  const x6Graph = ref<Graph | null>(null)
  
  // 数据
  const nodes = ref<any[]>([])
  const edges = ref<any[]>([])
  const selectedNodeIds = ref<string[]>([])
  const readonly = ref(false)

  // Actions
  const setX6Graph = (graph: Graph) => {
    x6Graph.value = graph
  }

  const loadInitialData = () => {
    // 转换初始数据格式
    return initialData
  }

  return {
    // State
    x6Graph,
    nodes,
    edges,
    selectedNodeIds,
    readonly,
    // Actions
    setX6Graph,
    loadInitialData,
  }
})

