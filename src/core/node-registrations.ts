/**
 * 节点类型注册
 * 在这里注册所有可用的节点类型
 */

import { nodeRegistry } from './node-registry'
import type { NodeDefinition } from '@/types/node'
import { PortPosition, PortType, NodeType } from '@/types/node'

// 导入节点组件
import StartNode from '@/components/vueflow/nodes/StartNode.vue'
import EndNode from '@/components/vueflow/nodes/EndNode.vue'
import ConditionNode from '@/components/vueflow/nodes/ConditionNode.vue'
import BigSceneNode from '@/components/vueflow/nodes/BigSceneNode.vue'
import EnterGuideNode from '@/components/vueflow/nodes/EnterGuideNode.vue'
import ExitGuideNode from '@/components/vueflow/nodes/ExitGuideNode.vue'
import GroupNode from '@/components/vueflow/nodes/GroupNode.vue'

/**
 * 注册所有内置节点类型
 */
export function registerBuiltInNodes() {
  // 开始节点
  const startNodeDef: NodeDefinition = {
    type: NodeType.Start,
    name: '开始',
    description: '工作流的起始节点',
    icon: '▶',
    category: 'control',
    component: StartNode,
    defaultSize: { width: 140, height: 70 },
    connectionRules: {
      inputs: [],
      outputs: [
        {
          id: 'output',
          name: '输出',
          type: PortType.Output,
          position: PortPosition.Bottom,
        },
      ],
    },
    metadata: {
      version: '1.0.0',
    },
  }

  // 结束节点
  const endNodeDef: NodeDefinition = {
    type: NodeType.End,
    name: '结束',
    description: '工作流的结束节点',
    icon: '■',
    category: 'control',
    component: EndNode,
    defaultSize: { width: 140, height: 70 },
    connectionRules: {
      inputs: [
        {
          id: 'input',
          name: '输入',
          type: PortType.Input,
          position: PortPosition.Top,
        },
      ],
      outputs: [],
    },
    metadata: {
      version: '1.0.0',
    },
  }

  // 条件节点
  const conditionNodeDef: NodeDefinition = {
    type: NodeType.Condition,
    name: '条件',
    description: '条件判断节点',
    icon: '◇',
    category: 'control',
    component: ConditionNode,
    defaultSize: { width: 140, height: 70 },
    connectionRules: {
      inputs: [
        {
          id: 'input',
          name: '输入',
          type: PortType.Input,
          position: PortPosition.Top,
        },
      ],
      outputs: [
        {
          id: 'output',
          name: '输出',
          type: PortType.Output,
          position: PortPosition.Bottom,
        },
      ],
    },
    metadata: {
      version: '1.0.0',
    },
  }

  // 大场景节点
  const bigSceneNodeDef: NodeDefinition = {
    type: NodeType.BigScene,
    name: '大场景',
    description: '大场景节点，可以包含多个小场景',
    icon: '🎬',
    category: 'business',
    component: BigSceneNode,
    defaultSize: { width: 160, height: 80 },
    connectionRules: {
      inputs: [
        {
          id: 'input',
          name: '输入',
          type: PortType.Input,
          position: PortPosition.Top,
        },
      ],
      outputs: [
        {
          id: 'output',
          name: '输出',
          type: PortType.Output,
          position: PortPosition.Bottom,
        },
      ],
    },
    metadata: {
      version: '1.0.0',
    },
  }

  // 入戏引导节点
  const enterGuideNodeDef: NodeDefinition = {
    type: NodeType.EnterGuide,
    name: '入戏引导',
    description: '入戏引导节点',
    icon: '→',
    category: 'business',
    component: EnterGuideNode,
    defaultSize: { width: 140, height: 70 },
    connectionRules: {
      inputs: [
        {
          id: 'input',
          name: '输入',
          type: PortType.Input,
          position: PortPosition.Left,
        },
      ],
      outputs: [
        {
          id: 'output',
          name: '输出',
          type: PortType.Output,
          position: PortPosition.Right,
        },
      ],
    },
    metadata: {
      version: '1.0.0',
    },
  }

  // 出戏引导节点
  const exitGuideNodeDef: NodeDefinition = {
    type: NodeType.ExitGuide,
    name: '出戏引导',
    description: '出戏引导节点',
    icon: '←',
    category: 'business',
    component: ExitGuideNode,
    defaultSize: { width: 140, height: 70 },
    connectionRules: {
      inputs: [
        {
          id: 'input',
          name: '输入',
          type: PortType.Input,
          position: PortPosition.Left,
        },
      ],
      outputs: [
        {
          id: 'output',
          name: '输出',
          type: PortType.Output,
          position: PortPosition.Right,
        },
      ],
    },
    metadata: {
      version: '1.0.0',
    },
  }

  // 分组节点
  const groupNodeDef: NodeDefinition = {
    type: NodeType.Group,
    name: '分组',
    description: '节点分组容器',
    icon: '📦',
    category: 'container',
    component: GroupNode,
    defaultSize: { width: 200, height: 150 },
    connectionRules: {
      inputs: [],
      outputs: [],
    },
    metadata: {
      version: '1.0.0',
    },
  }

  // 注册所有节点
  nodeRegistry.registerNodeType(startNodeDef)
  nodeRegistry.registerNodeType(endNodeDef)
  nodeRegistry.registerNodeType(conditionNodeDef)
  nodeRegistry.registerNodeType(bigSceneNodeDef)
  nodeRegistry.registerNodeType(enterGuideNodeDef)
  nodeRegistry.registerNodeType(exitGuideNodeDef)
  nodeRegistry.registerNodeType(groupNodeDef)
}

/**
 * 为未来功能预留的接口
 */

// 为模板系统预留的接口（暂时不实现）
export const templateSystem = {
  // TODO: 实现模板保存功能
  saveTemplate: () => {
    console.warn('模板系统尚未实现')
  },
  // TODO: 实现模板加载功能
  loadTemplate: () => {
    console.warn('模板系统尚未实现')
  },
}

// 为执行引擎预留的接口（暂时不实现）
export const executionEngine = {
  // TODO: 实现工作流执行功能
  execute: () => {
    console.warn('执行引擎尚未实现')
  },
  // TODO: 实现执行状态查询
  getExecutionStatus: () => {
    console.warn('执行引擎尚未实现')
  },
}

// 为版本管理预留的接口（暂时不实现）
export const versionManager = {
  // TODO: 实现版本保存功能
  saveVersion: () => {
    console.warn('版本管理系统尚未实现')
  },
  // TODO: 实现版本回滚功能
  rollbackVersion: () => {
    console.warn('版本管理系统尚未实现')
  },
}

// 为配置系统预留的接口（暂时不实现）
export const configSystem = {
  // TODO: 实现配置Schema验证
  validateConfig: () => {
    console.warn('配置系统尚未实现')
  },
  // TODO: 实现配置UI生成
  generateConfigUI: () => {
    console.warn('配置系统尚未实现')
  },
}

