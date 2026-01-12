export enum WorkflowNodeType {
  Start = 'start',
  End = 'end',
  BigScene = 'big-scene',
  EnterGuide = 'enter-guide',
  ExitGuide = 'exit-guide',
  LLM = 'llm',
  HTTP = 'http',
  Code = 'code',
  Variable = 'variable',
  Condition = 'condition',
  Loop = 'loop',
  BlockStart = 'block-start',
  BlockEnd = 'block-end',
  Comment = 'comment',
  Continue = 'continue',
  Break = 'break',
  Group = 'group',
}

export interface WorkflowNodeData {
  title?: string
  inputs?: Record<string, any>
  outputs?: Record<string, any>
  hasDetails?: boolean
  subScenes?: SubScene[]
  [key: string]: any
}

export interface SubScene {
  id: string
  name: string
  description?: string
  config?: Record<string, any>
}

export interface WorkflowDefinition {
  nodes: any[]
  edges: any[]
  globalVariable?: Record<string, any>
}

