/**
 * 节点注册表系统
 */

import type { Component } from 'vue'
import type { NodeDefinition, INodeExecutor, INodeValidator } from '@/types/node'

/**
 * 节点注册表类
 */
export class NodeRegistry {
  private nodeDefinitions: Map<string, NodeDefinition> = new Map()
  private components: Map<string, Component> = new Map()
  private executors: Map<string, INodeExecutor> = new Map()
  private validators: Map<string, INodeValidator> = new Map()

  /**
   * 注册节点类型
   */
  registerNodeType(definition: NodeDefinition): void {
    // 验证定义完整性
    this.validateDefinition(definition)

    // 存储节点定义
    this.nodeDefinitions.set(definition.type, definition)

    // 如果提供了组件，存储组件
    if (typeof definition.component === 'object') {
      this.components.set(definition.type, definition.component)
    }

    // 如果提供了执行器，存储执行器
    if (definition.executor) {
      this.executors.set(definition.type, definition.executor)
    }

    // 如果提供了验证器，存储验证器
    if (definition.validator) {
      this.validators.set(definition.type, definition.validator)
    }
  }

  /**
   * 获取节点定义
   */
  getNodeDefinition(type: string): NodeDefinition | null {
    return this.nodeDefinitions.get(type) || null
  }

  /**
   * 获取所有节点类型
   */
  getAllNodeTypes(): NodeDefinition[] {
    return Array.from(this.nodeDefinitions.values())
  }

  /**
   * 根据分类获取节点类型
   */
  getNodeTypesByCategory(category: string): NodeDefinition[] {
    return Array.from(this.nodeDefinitions.values()).filter(
      def => def.category === category
    )
  }

  /**
   * 获取节点组件
   */
  getNodeComponent(type: string): Component | null {
    const definition = this.nodeDefinitions.get(type)
    if (!definition) return null

    if (typeof definition.component === 'object') {
      return definition.component
    }

    // 如果是字符串路径，尝试从组件映射中获取
    return this.components.get(type) || null
  }

  /**
   * 获取节点执行器（为未来执行引擎预留）
   */
  getNodeExecutor(type: string): INodeExecutor | null {
    return this.executors.get(type) || null
  }

  /**
   * 获取节点验证器（为未来验证系统预留）
   */
  getNodeValidator(type: string): INodeValidator | null {
    return this.validators.get(type) || null
  }

  /**
   * 检查节点类型是否已注册
   */
  hasNodeType(type: string): boolean {
    return this.nodeDefinitions.has(type)
  }

  /**
   * 验证节点定义
   */
  private validateDefinition(definition: NodeDefinition): void {
    if (!definition.type) {
      throw new Error('Node definition must have a type')
    }
    if (!definition.name) {
      throw new Error('Node definition must have a name')
    }
    if (!definition.category) {
      throw new Error('Node definition must have a category')
    }
    if (!definition.component) {
      throw new Error('Node definition must have a component')
    }
    if (!definition.connectionRules) {
      throw new Error('Node definition must have connectionRules')
    }
  }

  /**
   * 注销节点类型
   */
  unregisterNodeType(type: string): void {
    this.nodeDefinitions.delete(type)
    this.components.delete(type)
    this.executors.delete(type)
    this.validators.delete(type)
  }

  /**
   * 清空所有注册
   */
  clear(): void {
    this.nodeDefinitions.clear()
    this.components.clear()
    this.executors.clear()
    this.validators.clear()
  }
}

/**
 * 全局节点注册表实例
 */
export const nodeRegistry = new NodeRegistry()

