/**
 * 节点系统核心类型定义
 */

import type { Component } from 'vue'

/**
 * 节点类型枚举
 */
export enum NodeType {
  Start = 'start',
  End = 'end',
  BigScene = 'big-scene',
  EnterGuide = 'enter-guide',
  ExitGuide = 'exit-guide',
  Condition = 'condition',
  Group = 'group',
}

/**
 * 端口位置
 */
export enum PortPosition {
  Top = 'top',
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right',
}

/**
 * 端口类型
 */
export enum PortType {
  Input = 'input',
  Output = 'output',
}

/**
 * 端口定义
 */
export interface PortDefinition {
  id: string
  name: string
  type: PortType
  position: PortPosition
  dataType?: string
  required?: boolean
  multiple?: boolean
  // 端口样式定制
  style?: {
    color?: string
    size?: number
    shape?: 'circle' | 'square' | 'diamond'
  }
  label?: string
  showLabel?: boolean
}

/**
 * 连接规则
 */
export interface ConnectionRule {
  sourceType: string
  targetType: string
  allowed: boolean
  description?: string
}

/**
 * 节点样式定义
 */
export interface NodeStyle {
  width?: number | string
  height?: number | string
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  [key: string]: any
}

/**
 * 节点配置Schema（JSON Schema格式）
 */
export interface NodeConfigSchema {
  type: 'object'
  properties: Record<string, any>
  required?: string[]
  [key: string]: any
}

/**
 * 节点执行状态
 */
export enum ExecutionStatus {
  Pending = 'pending',
  Running = 'running',
  Success = 'success',
  Error = 'error',
  Skipped = 'skipped',
}

/**
 * 节点执行结果
 */
export interface NodeExecutionResult {
  success: boolean
  data?: any
  error?: Error
  message?: string
  duration?: number
}

/**
 * 执行上下文（为未来执行引擎预留）
 */
export interface ExecutionContext {
  workflowId: string
  executionId: string
  nodeId: string
  inputs: Record<string, any>
  globalVariables: Record<string, any>
  previousResults: Record<string, any>
  state: ExecutionStatus
  [key: string]: any
}

/**
 * 节点执行器接口（为未来执行引擎预留）
 */
export interface INodeExecutor {
  execute(node: any, context: ExecutionContext): Promise<NodeExecutionResult>
  validate(node: any, context: ExecutionContext): boolean
  getRequiredInputs(node: any): string[]
  getOutputs(node: any): string[]
}

/**
 * 节点验证器接口（为未来验证系统预留）
 */
export interface INodeValidator {
  validate(node: any): { valid: boolean; errors: string[] }
  validateConfig(config: any, schema: NodeConfigSchema): { valid: boolean; errors: string[] }
  validateConnection(source: any, target: any): boolean
}

/**
 * 节点元数据
 */
export interface NodeMetadata {
  version: string
  author?: string
  tags?: string[]
  description?: string
  [key: string]: any
}

/**
 * 节点定义
 */
export interface NodeDefinition {
  // 基本信息
  type: string
  name: string
  description?: string
  icon?: string
  category: string

  // UI相关
  component: Component | string
  defaultStyle?: NodeStyle
  defaultSize?: { width: number; height: number }

  // 连接规则
  connectionRules: {
    inputs: PortDefinition[]
    outputs: PortDefinition[]
    rules?: ConnectionRule[]
  }

  // 配置Schema（为未来配置系统预留）
  configSchema?: NodeConfigSchema

  // 执行器（为未来执行引擎预留）
  executor?: INodeExecutor

  // 验证器（为未来验证系统预留）
  validator?: INodeValidator

  // 元数据
  metadata?: NodeMetadata
}

/**
 * 节点数据
 */
export interface NodeData {
  title?: string
  config?: Record<string, any>
  inputs?: Record<string, any>
  outputs?: Record<string, any>
  hasDetails?: boolean
  subScenes?: SubScene[]
  [key: string]: any
}

/**
 * 子场景
 */
export interface SubScene {
  id: string
  name: string
  description?: string
  config?: Record<string, any>
}

/**
 * 节点实例（Vue Flow Node扩展）
 */
export interface WorkflowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: NodeData
  style?: NodeStyle
  selected?: boolean
  dragging?: boolean
  executing?: boolean
  error?: boolean
  [key: string]: any
}

