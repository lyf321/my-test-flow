/**
 * 2D描述节点连线管理器
 * 管理大场景与2D描述节点之间的连线关系
 */

import { useVueFlow } from '@vue-flow/core'
import { NodeFactory } from '@/core/node-factory'
import type { Node } from '@vue-flow/core'
import type { SubScene } from '@/types/node'

export function use2DDescriptionManager() {
  const { 
    addNodes, 
    addEdges, 
    removeEdges, 
    removeNodes,
    getNode, 
    getEdges 
  } = useVueFlow()

  /**
   * 为单个子场景生成2D描述节点
   * @param bigSceneNode 大场景节点
   * @param subSceneIndex 子场景索引
   */
  const generate2DForSubScene = (
    bigSceneNode: Node,
    subSceneIndex: number
  ) => {
    const subScenes = bigSceneNode.data.subScenes
    if (!subScenes || subSceneIndex >= subScenes.length) {
      console.error('子场景不存在')
      return null
    }

    const subScene = subScenes[subSceneIndex]
    
    // 1. 创建2D描述节点
    const twoDNode = NodeFactory.createNode(
      '2d-description',
      {
        x: bigSceneNode.position.x + 300,
        y: bigSceneNode.position.y + (subSceneIndex * 120)
      },
      {
        title: `${subScene.name} - 2D描述`,
        description: '',
        parentSceneId: bigSceneNode.id,
        linkedSubScenes: [subScene.id],
        isShared: false
      }
    )
    
    addNodes([twoDNode])
    
    // 2. 如果子场景之前有2D连线，删除旧连线和旧节点
    if (subScene.linkedTo2DNode) {
      const oldNodeId = subScene.linkedTo2DNode
      const subSceneHandleId = `sub-scene-${subScene.id}`
      
      // 删除相关的边（使用sourceHandle匹配）
      const oldEdges = getEdges.value.filter(
        edge => edge.source === bigSceneNode.id && 
                edge.sourceHandle === subSceneHandleId &&
                edge.target === oldNodeId
      )
      
      if (oldEdges.length > 0) {
        removeEdges(oldEdges.map(e => e.id))
      }
      
      // 检查旧2D节点是否还有其他连线，如果没有则删除节点
      const remainingEdges = getEdges.value.filter(
        edge => edge.target === oldNodeId
      )
      
      if (remainingEdges.length === 0) {
        removeNodes([oldNodeId])
      }
    }
    
    // 3. 创建新连线（小场景Handle → 2D节点）
    const subSceneHandleId = `sub-scene-${subScene.id}`
    const newEdge = {
      id: `edge_${bigSceneNode.id}_${subSceneHandleId}_${twoDNode.id}_${Date.now()}`,
      source: bigSceneNode.id,
      sourceHandle: subSceneHandleId,  // 指定从小场景的Handle出发
      target: twoDNode.id,
      type: 'smoothstep',
      style: {
        stroke: '#8b5cf6',
        strokeWidth: 1,
      },
      data: {
        subSceneId: subScene.id,  // 标记这条边关联的子场景
        isShared: false,
      }
    }
    
    addEdges([newEdge])
    
    // 4. 更新子场景数据
    subScene.has2DDescription = true
    subScene.linkedTo2DNode = twoDNode.id
    subScene.is2DNodeShared = false
    
    console.log(`✅ 为子场景 "${subScene.name}" 创建了独立2D描述节点`)
    return twoDNode
  }

  /**
   * 为所有子场景生成共享2D描述节点
   * @param bigSceneNode 大场景节点
   */
  const generateShared2D = (bigSceneNode: Node) => {
    const subScenes = bigSceneNode.data.subScenes || []
    
    if (subScenes.length === 0) {
      alert('请先添加子场景')
      return null
    }
    
    // 1. 创建共享2D描述节点
    const twoDNode = NodeFactory.createNode(
      '2d-description',
      {
        x: bigSceneNode.position.x + 300,
        y: bigSceneNode.position.y
      },
      {
        title: `${bigSceneNode.data.title || '大场景'} - 共享2D描述`,
        description: '',
        parentSceneId: bigSceneNode.id,
        linkedSubScenes: subScenes.map((s: SubScene) => s.id),
        isShared: true
      }
    )
    
    addNodes([twoDNode])
    
    // 2. 为所有子场景创建连线
    const newEdges = subScenes.map((subScene: SubScene, index: number) => {
      const subSceneHandleId = `sub-scene-${subScene.id}`
      
      // 删除子场景之前的独立2D连线
      if (subScene.linkedTo2DNode && !subScene.is2DNodeShared) {
        const oldNodeId = subScene.linkedTo2DNode
        
        // 删除旧边（使用sourceHandle匹配）
        const oldEdges = getEdges.value.filter(
          edge => edge.source === bigSceneNode.id &&
                  edge.sourceHandle === subSceneHandleId &&
                  edge.target === oldNodeId
        )
        
        if (oldEdges.length > 0) {
          removeEdges(oldEdges.map(e => e.id))
        }
        
        // 检查是否需要删除旧节点
        const remainingEdges = getEdges.value.filter(
          edge => edge.target === oldNodeId
        )
        
        if (remainingEdges.length === 0) {
          removeNodes([oldNodeId])
        }
      }
      
      // 更新子场景数据
      subScene.has2DDescription = true
      subScene.linkedTo2DNode = twoDNode.id
      subScene.is2DNodeShared = true
      
      return {
        id: `edge_${bigSceneNode.id}_${subSceneHandleId}_${twoDNode.id}_${index}_${Date.now()}`,
        source: bigSceneNode.id,
        sourceHandle: subSceneHandleId,  // 指定从小场景的Handle出发
        target: twoDNode.id,
        type: 'smoothstep',
        style: {
          stroke: '#8b5cf6',
          strokeWidth: 1,
          strokeDasharray: '5,5', // 虚线表示共享连线
        },
        data: {
          subSceneId: subScene.id,
          isShared: true
        }
      }
    })
    
    addEdges(newEdges)
    
    // 3. 更新大场景数据
    bigSceneNode.data.hasShared2D = true
    bigSceneNode.data.shared2DNode = twoDNode.id
    
    console.log(`✅ 为大场景 "${bigSceneNode.data.title}" 创建了共享2D描述节点，连接了 ${subScenes.length} 个子场景`)
    return twoDNode
  }

  /**
   * 删除子场景的2D描述
   * @param bigSceneNode 大场景节点
   * @param subSceneIndex 子场景索引
   */
  const remove2DFromSubScene = (
    bigSceneNode: Node,
    subSceneIndex: number
  ) => {
    const subScenes = bigSceneNode.data.subScenes
    if (!subScenes || subSceneIndex >= subScenes.length) {
      console.error('子场景不存在')
      return
    }

    const subScene = subScenes[subSceneIndex]
    
    if (!subScene.linkedTo2DNode) {
      console.warn('子场景没有关联的2D描述')
      return
    }
    
    const twoDNodeId = subScene.linkedTo2DNode
    const subSceneHandleId = `sub-scene-${subScene.id}`
    
    // 1. 删除连线（使用sourceHandle匹配）
    const edgesToRemove = getEdges.value.filter(
      edge => edge.source === bigSceneNode.id && 
              edge.sourceHandle === subSceneHandleId &&
              edge.target === twoDNodeId
    )
    
    if (edgesToRemove.length > 0) {
      removeEdges(edgesToRemove.map(e => e.id))
    }
    
    // 2. 检查2D节点是否还有其他连线，如果没有则删除节点
    const remaining2DEdges = getEdges.value.filter(
      edge => edge.target === twoDNodeId
    )
    
    if (remaining2DEdges.length === 0) {
      // 删除2D节点
      removeNodes([twoDNodeId])
      console.log(`🗑️ 删除了2D描述节点`)
    }
    
    // 3. 更新子场景数据
    subScene.has2DDescription = false
    subScene.linkedTo2DNode = undefined
    subScene.is2DNodeShared = false
    
    console.log(`✅ 删除了子场景 "${subScene.name}" 的2D描述`)
  }

  /**
   * 删除共享2D描述
   * @param bigSceneNode 大场景节点
   */
  const removeShared2D = (bigSceneNode: Node) => {
    const shared2DNodeId = bigSceneNode.data.shared2DNode
    
    if (!shared2DNodeId) {
      console.warn('大场景没有共享2D描述')
      return
    }
    
    // 1. 删除所有相关连线（共享2D的所有连线）
    const subScenes = bigSceneNode.data.subScenes || []
    const edgesToRemove = getEdges.value.filter(edge => {
      if (edge.target !== shared2DNodeId) return false
      
      // 检查是否是从任一子场景Handle出发的连线
      return subScenes.some((subScene: SubScene) => 
        edge.sourceHandle === `sub-scene-${subScene.id}` &&
        edge.source === bigSceneNode.id
      )
    })
    
    if (edgesToRemove.length > 0) {
      removeEdges(edgesToRemove.map(e => e.id))
    }
    
    // 2. 删除2D节点
    removeNodes([shared2DNodeId])
    
    // 3. 更新所有子场景数据
    // const subScenes = bigSceneNode.data.subScenes || []
    subScenes.forEach((subScene: SubScene) => {
      if (subScene.linkedTo2DNode === shared2DNodeId) {
        subScene.has2DDescription = false
        subScene.linkedTo2DNode = undefined
        subScene.is2DNodeShared = false
      }
    })
    
    // 4. 更新大场景数据
    bigSceneNode.data.hasShared2D = false
    bigSceneNode.data.shared2DNode = undefined
    
    console.log(`✅ 删除了大场景 "${bigSceneNode.data.title}" 的共享2D描述`)
  }

  /**
   * 查看2D描述节点（聚焦到节点）
   * @param nodeId 2D描述节点ID
   */
  const view2DNode = (nodeId: string) => {
    const node = getNode.value(nodeId)
    if (node) {
      // 这里可以添加聚焦到节点的逻辑
      console.log('查看2D描述节点:', node)
      // TODO: 实现节点聚焦功能
    }
  }

  /**
   * 清理删除连线后的关联关系
   * @param removedEdgeId 被删除的边ID
   * @returns 需要删除的2D节点ID（如果有的话）
   */
  const cleanupConnectionData = (removedEdgeId: string): string | null => {
    // 从所有边中找到被删除的边的信息
    // 注意：这个函数在边删除之前调用，所以仍能找到边的信息
    const allEdges = getEdges.value
    const removedEdge = allEdges.find(e => e.id === removedEdgeId)
    
    if (!removedEdge) {
      return null
    }

    const { source, sourceHandle, target } = removedEdge
    
    // 检查是否是子场景到2D描述的连线
    if (sourceHandle && sourceHandle.startsWith('sub-scene-')) {
      const bigSceneNode = getNode.value(source)
      const twoDNode = getNode.value(target)
      
      if (!bigSceneNode || !twoDNode || twoDNode.type !== '2d-description') {
        return null
      }

      // 提取子场景ID
      const subSceneId = sourceHandle.replace('sub-scene-', '')
      const subScenes = bigSceneNode.data.subScenes || []
      const subScene = subScenes.find((s: any) => s.id === subSceneId)
      
      if (!subScene) {
        return null
      }

      // 检查这是独立2D还是共享2D
      const isShared = removedEdge.data?.isShared || subScene.is2DNodeShared
      
      if (isShared) {
        // 共享2D：只清理这个子场景的关联
        subScene.has2DDescription = false
        subScene.linkedTo2DNode = undefined
        subScene.is2DNodeShared = false
        
        // 检查是否还有其他子场景连接到这个2D节点
        const remainingConnections = allEdges.filter(
          e => e.id !== removedEdgeId && 
               e.target === target && 
               e.source === source &&
               e.sourceHandle?.startsWith('sub-scene-')
        )
        
        // 如果没有其他子场景连接，清理大场景的共享2D标记
        if (remainingConnections.length === 0) {
          bigSceneNode.data.hasShared2D = false
          bigSceneNode.data.shared2DNode = undefined
          
          // 检查2D节点是否还有其他连接
          const allConnectionsTo2D = allEdges.filter(
            e => e.id !== removedEdgeId && e.target === target
          )
          
          if (allConnectionsTo2D.length === 0) {
            console.log(`✅ 清理了子场景 "${subScene.name}" 到共享2D的关联，准备删除2D节点`)
            return target  // 返回需要删除的节点ID
          }
        }
        
        console.log(`✅ 清理了子场景 "${subScene.name}" 到共享2D的关联`)
      } else {
        // 独立2D：清理子场景关联
        subScene.has2DDescription = false
        subScene.linkedTo2DNode = undefined
        subScene.is2DNodeShared = false
        
        // 检查这个2D节点是否还有其他连接
        const otherConnections = allEdges.filter(
          e => e.id !== removedEdgeId && e.target === target
        )
        
        if (otherConnections.length === 0) {
          console.log(`✅ 清理了子场景 "${subScene.name}" 到独立2D的关联，准备删除2D节点`)
          // 更新2D节点的linkedSubScenes
          if (twoDNode.data.linkedSubScenes) {
            twoDNode.data.linkedSubScenes = twoDNode.data.linkedSubScenes.filter(
              (id: string) => id !== subSceneId
            )
          }
          return target  // 返回需要删除的节点ID
        } else {
          console.log(`✅ 清理了子场景 "${subScene.name}" 到独立2D的关联`)
        }
      }
      
      // 更新2D节点的linkedSubScenes
      if (twoDNode.data.linkedSubScenes) {
        twoDNode.data.linkedSubScenes = twoDNode.data.linkedSubScenes.filter(
          (id: string) => id !== subSceneId
        )
      }
    }
    
    return null
  }

  /**
   * 批量清理删除的连线
   * @param removedEdgeIds 被删除的边ID数组
   * @returns 需要删除的2D节点ID数组
   */
  const cleanupMultipleConnections = (removedEdgeIds: string[]): string[] => {
    const nodesToRemove: string[] = []
    removedEdgeIds.forEach(edgeId => {
      const nodeToRemove = cleanupConnectionData(edgeId)
      if (nodeToRemove && !nodesToRemove.includes(nodeToRemove)) {
        nodesToRemove.push(nodeToRemove)
      }
    })
    return nodesToRemove
  }

  return {
    generate2DForSubScene,
    generateShared2D,
    remove2DFromSubScene,
    removeShared2D,
    view2DNode,
    cleanupConnectionData,
    cleanupMultipleConnections,
  }
}
