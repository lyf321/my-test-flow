# 可配置的连线规则系统

## 📋 概述

重构了连线规则系统，使其完全可配置，支持灵活的节点连接约束和特殊规则处理。

## 🎯 需求实现

### 要求1：特定节点间只能连接一条线
✅ 开始、结束、大场景、入戏引导、出戏引导节点之间只能连接一条线

### 要求2：2D场景连线规则
✅ 2D描述节点可以被多个子场景连线
✅ 一个子场景只能有一条线连接到2D描述节点
✅ 子场景到2D的连线上没有操作（纯连接关系）

## 🏗️ 架构设计

### 1. 连线规则配置接口

```typescript
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
```

### 2. 默认连线规则配置

#### 开始节点 (start)
```typescript
'start': {
  allowedTargets: ['big-scene', 'enter-guide'],  // 只能连接到大场景或入戏引导
  maxOutgoingEdges: 1,                           // 只能有1条出线
  maxIncomingEdges: 0,                           // 不能有入线
  allowCycle: false,                             // 不允许循环
  allowSelfConnection: false,                    // 不允许自连接
  allowDuplicateConnection: false,               // 不允许重复连线
}
```

#### 结束节点 (end)
```typescript
'end': {
  allowedTargets: [],                            // 不能有出线
  maxOutgoingEdges: 0,                           // 不能有出线
  maxIncomingEdges: undefined,                   // 入线无限制
  allowCycle: false,
  allowSelfConnection: false,
  allowDuplicateConnection: false,
}
```

#### 大场景节点 (big-scene)
```typescript
'big-scene': {
  allowedTargets: ['big-scene', 'enter-guide', 'exit-guide', 'end'],
  maxOutgoingEdges: undefined,                   // 出线无限制
  maxIncomingEdges: undefined,                   // 入线无限制
  allowCycle: false,
  allowSelfConnection: false,
  allowDuplicateConnection: false,               // ⭐ 节点间只能一条线
}
```

#### 入戏引导 (enter-guide)
```typescript
'enter-guide': {
  allowedTargets: ['big-scene'],                 // 只能连接到大场景
  maxOutgoingEdges: 1,                           // 只能有1条出线
  maxIncomingEdges: undefined,                   // 可以有多条入线
  allowCycle: false,
  allowSelfConnection: false,
  allowDuplicateConnection: false,
}
```

#### 出戏引导 (exit-guide)
```typescript
'exit-guide': {
  allowedTargets: ['big-scene', 'end'],          // 可以连接到大场景或结束
  maxOutgoingEdges: 1,                           // 只能有1条出线
  maxIncomingEdges: undefined,                   // 可以有多条入线
  allowCycle: false,
  allowSelfConnection: false,
  allowDuplicateConnection: false,
}
```

#### 2D描述节点 (2d-description)
```typescript
'2d-description': {
  allowedTargets: [],                            // 不能有出线
  maxOutgoingEdges: 0,                           // 不能有出线
  maxIncomingEdges: undefined,                   // ⭐ 可以有多条入线
  allowCycle: false,
  allowSelfConnection: false,
  allowDuplicateConnection: false,               // ⭐ 同一子场景只能连一条
}
```

## 🔧 核心功能

### 1. 基础连线验证

```typescript
const canAddLine = (connection: Connection): boolean => {
  // 1. 检查自连接
  // 2. 检查特殊处理（子场景到2D）
  // 3. 检查重复连线
  // 4. 检查循环
  // 5. 检查节点类型规则
  // 6. 检查出线数量限制
  // 7. 检查入线数量限制
}
```

### 2. 子场景到2D描述的特殊处理

```typescript
const canConnectSubSceneTo2D = (
  bigSceneNodeId: string, 
  subSceneHandleId: string, 
  twoDNodeId: string
): boolean => {
  // 检查该子场景是否已经连接到其他2D节点
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
```

**关键点**：
- ✅ 使用 `sourceHandle` 识别具体的子场景（`sub-scene-${subScene.id}`）
- ✅ 一个子场景只能连接到一个2D节点
- ✅ 不允许重复连线到同一个2D节点

### 3. 节点类型连接验证

```typescript
const isValidConnection = (
  sourceType: string | undefined, 
  targetType: string | undefined
): boolean => {
  if (!sourceType || !targetType) return true

  const sourceRule = rules[sourceType]
  if (!sourceRule || !sourceRule.allowedTargets) return true

  return sourceRule.allowedTargets.includes(targetType)
}
```

### 4. 循环检测

```typescript
const wouldCreateCycle = (source: string, target: string): boolean => {
  const visited = new Set<string>()
  const stack = [target]

  while (stack.length > 0) {
    const current = stack.pop()!
    if (current === source) {
      return true  // 检测到循环
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
```

## 💡 使用方式

### 基础使用（使用默认规则）

```typescript
import { useLineRulesVueFlow } from '@/composables/useLineRulesVueFlow'

const lineRules = useLineRulesVueFlow()

// 在连线时验证
const onConnect = (connection: Connection) => {
  if (lineRules.canAddLine(connection)) {
    addEdges([connection])
  }
}
```

### 自定义规则

```typescript
import { useLineRulesVueFlow, type ConnectionRuleConfig } from '@/composables/useLineRulesVueFlow'

// 定义自定义规则
const customRules: Record<string, ConnectionRuleConfig> = {
  'custom-node': {
    allowedTargets: ['big-scene'],
    maxOutgoingEdges: 3,
    maxIncomingEdges: 5,
    allowCycle: true,  // 允许循环
    allowSelfConnection: false,
    allowDuplicateConnection: true,  // 允许重复连线
  }
}

// 使用自定义规则（会与默认规则合并）
const lineRules = useLineRulesVueFlow(customRules)
```

### 导出的API

```typescript
const {
  canAddLine,                 // 主要验证函数
  wouldCreateCycle,           // 循环检测
  isValidConnection,          // 节点类型验证
  canConnectSubSceneTo2D,     // 子场景到2D的特殊验证
  rules,                      // 当前使用的规则配置
} = useLineRulesVueFlow()
```

## 📊 连线规则矩阵

| 源节点 → 目标节点 | 开始 | 结束 | 大场景 | 入戏引导 | 出戏引导 | 2D描述 |
|-------------------|------|------|--------|----------|----------|--------|
| **开始**          | ❌   | ❌   | ✅ (1条) | ✅ (1条)  | ❌       | ❌     |
| **结束**          | ❌   | ❌   | ❌     | ❌       | ❌       | ❌     |
| **大场景**        | ❌   | ✅   | ✅ (1条) | ✅ (1条)  | ✅ (1条)  | ❌     |
| **入戏引导**      | ❌   | ❌   | ✅ (1条) | ❌       | ❌       | ❌     |
| **出戏引导**      | ❌   | ✅ (1条) | ✅ (1条) | ❌    | ❌       | ❌     |
| **子场景 (Handle)** | ❌ | ❌   | ❌     | ❌       | ❌       | ✅ (1条) |

**图例**：
- ✅ 允许连接
- ❌ 不允许连接
- (1条) 节点间只能一条线
- (无限) 可以有多条线

## 🎯 特殊场景处理

### 场景1：大场景节点之间的连线
```
大场景A ──→ 大场景B  ✅ 允许
大场景A ──→ 大场景B  ❌ 不允许（已存在一条线）
```

**规则**：`allowDuplicateConnection: false`

### 场景2：子场景到2D描述的连线
```
大场景A
  └─ 子场景1 ──→ 2D描述X  ✅ 允许
  └─ 子场景2 ──→ 2D描述X  ✅ 允许（不同子场景）
  └─ 子场景1 ──→ 2D描述Y  ❌ 不允许（子场景1已连接到X）
  └─ 子场景1 ──→ 2D描述X  ❌ 不允许（重复连线）
```

**规则**：
- 使用 `sourceHandle` 区分不同子场景
- 每个子场景只能连接到一个2D描述节点
- 不允许重复连线

### 场景3：开始节点的出线限制
```
开始 ──→ 大场景A  ✅ 允许
开始 ──→ 大场景B  ❌ 不允许（只能有1条出线）
```

**规则**：`maxOutgoingEdges: 1`

### 场景4：结束节点的入线
```
大场景A ──→ 结束  ✅ 允许
大场景B ──→ 结束  ✅ 允许
大场景C ──→ 结束  ✅ 允许
...（无限制）
```

**规则**：`maxIncomingEdges: undefined`

### 场景5：引导节点的限制
```
入戏引导 ──→ 大场景A  ✅ 允许
入戏引导 ──→ 大场景B  ❌ 不允许（只能有1条出线）

出戏引导 ──→ 结束     ✅ 允许
出戏引导 ──→ 大场景A   ❌ 不允许（只能有1条出线）
```

**规则**：`maxOutgoingEdges: 1`

## 🔍 调试与日志

所有连线验证失败都会在控制台输出详细的错误信息：

```javascript
// 示例输出
console.log('连线失败：不能自连接')
console.log('连线失败：已存在相同连线（节点间只能一条线）')
console.log('连线失败：会形成循环')
console.log('连线失败：big-scene 不能连接到 start')
console.log('连线失败：start 最多只能有 1 条出线')
console.log('连线失败：该子场景已经连接到另一个2D描述节点')
console.log('连线失败：该子场景已经连接到此2D描述节点')
```

## 🚀 扩展性

### 添加新节点类型的连线规则

```typescript
// 在 defaultConnectionRules 中添加
'custom-node-type': {
  allowedTargets: ['big-scene', 'end'],
  maxOutgoingEdges: 2,
  maxIncomingEdges: undefined,
  allowCycle: false,
  allowSelfConnection: false,
  allowDuplicateConnection: false,
}
```

### 运行时修改规则

```typescript
// 使用自定义规则覆盖默认规则
const customRules = {
  'big-scene': {
    ...defaultConnectionRules['big-scene'],
    maxOutgoingEdges: 5,  // 限制大场景最多5条出线
  }
}

const lineRules = useLineRulesVueFlow(customRules)
```

## 📂 修改的文件

- `src/composables/useLineRulesVueFlow.ts` - 完全重构

## ✅ 优势

1. **高度可配置** - 所有规则都可以通过配置对象定制
2. **类型安全** - 完整的 TypeScript 类型定义
3. **易于扩展** - 新增节点类型只需添加配置
4. **清晰的约束** - 每个节点的连线规则一目了然
5. **特殊场景支持** - 子场景到2D的特殊逻辑独立处理
6. **调试友好** - 详细的错误日志
7. **性能优化** - 高效的边查找和验证逻辑

## 🎉 总结

新的连线规则系统完全满足当前需求，同时提供了强大的扩展能力：

✅ **要求1实现**：开始、结束、大场景、入戏引导、出戏引导节点间只能连接一条线
✅ **要求2实现**：2D描述可被多个子场景连接，但每个子场景只能连一条线

系统架构清晰、易于维护、高度灵活！
