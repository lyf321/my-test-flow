import { useVueFlow, type Connection } from '@vue-flow/core'

/**
 * 连线规则配置
 */
export interface ConnectionRuleConfig {
  // 允许的目标节点类型
  allowedTargets?: string[]
  // 最大出线数量（undefined表示无限制）
  maxOutgoingEdges?: number
  // 最大入线数量（undefined表示无限制）
  maxIncomingEdges?: number
  // 是否允许循环
  allowCycle?: boolean
  // 是否允许自连接
  allowSelfConnection?: boolean
  // 是否允许重复连线（同一source到同一target的多条线）
  allowDuplicateConnection?: boolean
}

/**
 * 节点类型连线规则配置
 */
export const defaultConnectionRules: Record<string, ConnectionRuleConfig> = {
  // 开始节点：只能连接到大场景或入戏引导，只能有1条出线，不能有入线
  'start': {
    allowedTargets: ['big-scene', 'enter-guide'],
    maxOutgoingEdges: 1,
    maxIncomingEdges: 0,
    allowCycle: false,
    allowSelfConnection: false,
    allowDuplicateConnection: false,
  },
  // 结束节点：不能有出线，可以有多条入线
  'end': {
    allowedTargets: [],
    maxOutgoingEdges: 0,
    maxIncomingEdges: undefined, // 无限制
    allowCycle: false,
    allowSelfConnection: false,
    allowDuplicateConnection: false,
  },
  // 大场景节点：可以连接到大场景、引导、结束，节点间只能一条线
  'big-scene': {
    allowedTargets: ['big-scene', 'enter-guide', 'exit-guide', 'end'],
    maxOutgoingEdges: undefined, // 无限制（但节点间只能一条）
    maxIncomingEdges: undefined, // 无限制
    allowCycle: false,
    allowSelfConnection: false,
    allowDuplicateConnection: false, // 节点间只能一条线
  },
  // 入戏引导：只能连接到大场景，只能有1条出线
  'enter-guide': {
    allowedTargets: ['big-scene'],
    maxOutgoingEdges: 1,
    maxIncomingEdges: undefined, // 可以有多条入线
    allowCycle: false,
    allowSelfConnection: false,
    allowDuplicateConnection: false,
  },
  // 出戏引导：可以连接到大场景或结束，只能有1条出线
  'exit-guide': {
    allowedTargets: ['big-scene', 'end'],
    maxOutgoingEdges: 1,
    maxIncomingEdges: undefined, // 可以有多条入线
    allowCycle: false,
    allowSelfConnection: false,
    allowDuplicateConnection: false,
  },
  // 2D描述节点：不能有出线，可以被多个子场景连接
  '2d-description': {
    allowedTargets: [],
    maxOutgoingEdges: 0,
    maxIncomingEdges: undefined, // 可以有多条入线（来自多个子场景）
    allowCycle: false,
    allowSelfConnection: false,
    allowDuplicateConnection: false, // 同一个子场景只能连一条线
  },
}

export function useLineRulesVueFlow(customRules?: Record<string, ConnectionRuleConfig>) {
  const { getEdges, getNode } = useVueFlow()
  
  // 合并自定义规则和默认规则
  const rules = { ...defaultConnectionRules, ...customRules }

  const canAddLine = (connection: Connection): boolean => {
    const { source, target, sourceHandle, targetHandle } = connection

    // 1. 不能自连接（除非规则允许）
    if (source === target) {
      const sourceNode = getNode.value(source)
      const sourceRule = sourceNode?.type ? rules[sourceNode.type] : undefined
      if (!sourceRule?.allowSelfConnection) {
        console.log('连线失败：不能自连接')
        return false
      }
    }

    // 获取源节点和目标节点
    const sourceNode = getNode.value(source)
    const targetNode = getNode.value(target)
    
    if (!sourceNode || !targetNode) {
      console.log('连线失败：节点不存在')
      return false
    }

    // 2. 特殊处理：子场景到2D描述的连线
    if (sourceHandle && sourceHandle.startsWith('sub-scene-') && targetNode.type === '2d-description') {
      return canConnectSubSceneTo2D(source, sourceHandle, target)
    }

    // 3. 检查是否已存在相同连线（根据规则配置）
    const sourceRule = sourceNode.type ? rules[sourceNode.type] : undefined
    if (!sourceRule?.allowDuplicateConnection) {
      const existingEdge = getEdges.value.find(
        e => e.source === source && e.target === target && 
             e.sourceHandle === sourceHandle && e.targetHandle === targetHandle
      )
      if (existingEdge) {
        console.log('连线失败：已存在相同连线（节点间只能一条线）')
        return false
      }
    }

    // 4. 检查是否会形成循环
    if (!sourceRule?.allowCycle) {
      if (wouldCreateCycle(source, target)) {
        console.log('连线失败：会形成循环')
        return false
      }
    }

    // 5. 检查节点类型连线规则
    if (!isValidConnection(sourceNode.type, targetNode.type)) {
      console.log(`连线失败：${sourceNode.type} 不能连接到 ${targetNode.type}`)
      return false
    }

    // 6. 检查出线数量限制
    const outgoingEdges = getEdges.value.filter(e => e.source === source && e.sourceHandle === sourceHandle)
    if (sourceRule?.maxOutgoingEdges !== undefined && outgoingEdges.length >= sourceRule.maxOutgoingEdges) {
      console.log(`连线失败：${sourceNode.type} 最多只能有 ${sourceRule.maxOutgoingEdges} 条出线`)
      return false
    }

    // 7. 检查入线数量限制
    const targetRule = targetNode.type ? rules[targetNode.type] : undefined
    const incomingEdges = getEdges.value.filter(e => e.target === target && e.targetHandle === targetHandle)
    if (targetRule?.maxIncomingEdges !== undefined && incomingEdges.length >= targetRule.maxIncomingEdges) {
      console.log(`连线失败：${targetNode.type} 最多只能有 ${targetRule.maxIncomingEdges} 条入线`)
      return false
    }

    return true
  }

  /**
   * 检查子场景到2D描述的连线是否合法
   * 要求：一个子场景只能连接到一个2D描述节点
   */
  const canConnectSubSceneTo2D = (bigSceneNodeId: string, subSceneHandleId: string, twoDNodeId: string): boolean => {
    // 检查该子场景是否已经有连线到其他2D节点
    const existingEdge = getEdges.value.find(
      e => e.source === bigSceneNodeId && 
           e.sourceHandle === subSceneHandleId &&
           e.target !== twoDNodeId
    )
    
    if (existingEdge) {
      console.log('连线失败：该子场景已经连接到另一个2D描述节点')
      return false
    }

    // 检查是否已存在到同一个2D节点的连线
    const duplicateEdge = getEdges.value.find(
      e => e.source === bigSceneNodeId && 
           e.sourceHandle === subSceneHandleId &&
           e.target === twoDNodeId
    )
    
    if (duplicateEdge) {
      console.log('连线失败：该子场景已经连接到此2D描述节点')
      return false
    }

    return true
  }

  // 验证节点类型之间的连接是否合法
  const isValidConnection = (sourceType: string | undefined, targetType: string | undefined): boolean => {
    if (!sourceType || !targetType) return true

    const sourceRule = rules[sourceType]
    if (!sourceRule || !sourceRule.allowedTargets) return true

    return sourceRule.allowedTargets.includes(targetType)
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
    canConnectSubSceneTo2D,
    rules, // 导出规则配置，方便外部查看
  }
}
