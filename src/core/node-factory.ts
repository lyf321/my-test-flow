/**
 * 节点工厂
 */

import { nanoid } from 'nanoid'
import type { Node } from '@vue-flow/core'
import type { WorkflowNode, NodeDefinition, NodeData } from '@/types/node'
import { nodeRegistry } from './node-registry'

/**
 * 节点工厂类
 */
export class NodeFactory {
  /**
   * 创建节点实例
   */
  static createNode(
    type: string,
    position: { x: number; y: number },
    data?: Partial<NodeData>
  ): Node {
    const definition = nodeRegistry.getNodeDefinition(type)
    if (!definition) {
      throw new Error(`Node type "${type}" is not registered`)
    }

    // 合并默认数据和用户数据
    const nodeData: NodeData = {
      title: definition.name,
      ...definition.metadata,
      ...data,
    }

    // 创建节点实例
    const node: Node = {
      id: data?.id || `${type}_${nanoid()}`,
      type: definition.type,
      position,
      data: nodeData,
      style: {
        width: definition.defaultSize?.width || 140,
        height: definition.defaultSize?.height || 70,
        ...definition.defaultStyle,
      },
      selected: false,
    }

    return node
  }

  /**
   * 从定义创建节点
   */
  static createNodeFromDefinition(
    definition: NodeDefinition,
    position: { x: number; y: number },
    data?: Partial<NodeData>
  ): Node {
    return this.createNode(definition.type, position, data)
  }

  /**
   * 批量创建节点
   */
  static createNodes(
    nodes: Array<{
      type: string
      position: { x: number; y: number }
      data?: Partial<NodeData>
    }>
  ): Node[] {
    return nodes.map(node => this.createNode(node.type, node.position, node.data))
  }

  /**
   * 验证节点类型
   */
  static validateNodeType(type: string): boolean {
    return nodeRegistry.hasNodeType(type)
  }

  /**
   * 获取节点默认配置
   */
  static getNodeDefaultConfig(type: string): Partial<NodeData> {
    const definition = nodeRegistry.getNodeDefinition(type)
    if (!definition) {
      return {}
    }

    return {
      title: definition.name,
      ...definition.metadata,
    }
  }
}

