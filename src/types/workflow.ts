export enum WorkflowNodeType {
  Start = 'start',
  End = 'end',
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
  [key: string]: any
}

export interface WorkflowDefinition {
  nodes: any[]
  edges: any[]
  globalVariable?: Record<string, any>
}

