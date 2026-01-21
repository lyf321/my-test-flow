# 连线规则使用示例

## 📚 目录
1. [基础使用](#基础使用)
2. [特定场景示例](#特定场景示例)
3. [错误处理](#错误处理)
4. [自定义规则](#自定义规则)

## 基础使用

### 在 WorkflowEditor 中使用

```typescript
import { useLineRulesVueFlow } from '@/composables/useLineRulesVueFlow'

// 初始化连线规则
const { canAddLine } = useLineRulesVueFlow()

// 在连接事件中验证
const onConnect = (connection: Connection) => {
  if (canAddLine(connection)) {
    addEdges([connection])
    // 保存到历史记录
    pushHistory({ nodes, edges })
  }
  // 如果验证失败，canAddLine内部会打印错误信息到控制台
}
```

## 特定场景示例

### 场景 1：开始节点连接

```
✅ 允许的连接：
开始 ──→ 大场景
开始 ──→ 入戏引导

❌ 不允许的连接：
开始 ──→ 结束       (不在allowedTargets中)
开始 ──→ 大场景1     (第一条线，允许)
开始 ──→ 大场景2     (第二条线，超过maxOutgoingEdges=1)
大场景 ──→ 开始      (开始节点maxIncomingEdges=0)
```

**规则**：
```typescript
'start': {
  allowedTargets: ['big-scene', 'enter-guide'],
  maxOutgoingEdges: 1,
  maxIncomingEdges: 0,
}
```

### 场景 2：大场景之间连接

```
✅ 允许的连接：
大场景A ──→ 大场景B   (第一条线)

❌ 不允许的连接：
大场景A ──→ 大场景B   (第二条线，allowDuplicateConnection=false)
大场景B ──→ 大场景A ──→ 大场景B  (形成循环)
```

**规则**：
```typescript
'big-scene': {
  allowedTargets: ['big-scene', 'enter-guide', 'exit-guide', 'end'],
  maxOutgoingEdges: undefined,     // 可以有多条出线
  maxIncomingEdges: undefined,     // 可以有多条入线
  allowDuplicateConnection: false, // 但节点间只能一条
  allowCycle: false,
}
```

**实际效果**：
```
大场景A ──→ 大场景B   ✅
大场景A ──→ 大场景C   ✅
大场景A ──→ 结束      ✅
大场景A ──→ 大场景B   ❌ (重复连线)
```

### 场景 3：子场景到 2D 描述

```
大场景A
  ├─ 子场景1 ──→ 2D描述X  ✅ (第一条连接)
  ├─ 子场景2 ──→ 2D描述X  ✅ (不同子场景，允许)
  ├─ 子场景3 ──→ 2D描述Y  ✅ (连接到不同的2D)
  ├─ 子场景1 ──→ 2D描述Y  ❌ (子场景1已连接到X)
  └─ 子场景1 ──→ 2D描述X  ❌ (重复连接)
```

**特殊处理**：
```typescript
const canConnectSubSceneTo2D = (
  bigSceneNodeId: string, 
  subSceneHandleId: string,  // 'sub-scene-xxx'
  twoDNodeId: string
): boolean => {
  // 检查该子场景是否已连接到其他2D节点
  const existingEdge = getEdges.value.find(
    e => e.source === bigSceneNodeId && 
         e.sourceHandle === subSceneHandleId &&
         e.target !== twoDNodeId
  )
  
  if (existingEdge) return false
  
  // 检查是否已存在相同连接
  const duplicateEdge = getEdges.value.find(
    e => e.source === bigSceneNodeId && 
         e.sourceHandle === subSceneHandleId &&
         e.target === twoDNodeId
  )
  
  return !duplicateEdge
}
```

**关键点**：
- ✅ 使用 `sourceHandle` 识别具体子场景
- ✅ 一个子场景只能连一个2D描述
- ✅ 多个子场景可以连同一个2D描述（共享2D）

### 场景 4：引导节点限制

```
✅ 入戏引导节点：
入戏引导 ──→ 大场景    (1条出线，允许)

❌ 入戏引导节点：
入戏引导 ──→ 大场景1   (第1条)
入戏引导 ──→ 大场景2   (第2条，超过maxOutgoingEdges=1)

✅ 出戏引导节点：
出戏引导 ──→ 大场景    (允许)
出戏引导 ──→ 结束      (允许)

❌ 出戏引导节点：
出戏引导 ──→ 大场景    (第1条)
出戏引导 ──→ 结束      (第2条，超过maxOutgoingEdges=1)
```

**规则**：
```typescript
'enter-guide': {
  allowedTargets: ['big-scene'],
  maxOutgoingEdges: 1,
}

'exit-guide': {
  allowedTargets: ['big-scene', 'end'],
  maxOutgoingEdges: 1,
}
```

### 场景 5：结束节点

```
✅ 允许的连接：
大场景A ──→ 结束
大场景B ──→ 结束
大场景C ──→ 结束
...（无限制）

❌ 不允许的连接：
结束 ──→ 任何节点   (maxOutgoingEdges=0)
```

**规则**：
```typescript
'end': {
  allowedTargets: [],
  maxOutgoingEdges: 0,
  maxIncomingEdges: undefined,  // 无限制
}
```

## 错误处理

### 控制台输出示例

```javascript
// 1. 自连接
console.log('连线失败：不能自连接')

// 2. 节点不存在
console.log('连线失败：节点不存在')

// 3. 子场景已连接到其他2D
console.log('连线失败：该子场景已经连接到另一个2D描述节点')

// 4. 重复连接
console.log('连线失败：该子场景已经连接到此2D描述节点')
console.log('连线失败：已存在相同连线（节点间只能一条线）')

// 5. 循环检测
console.log('连线失败：会形成循环')

// 6. 节点类型不匹配
console.log('连线失败：start 不能连接到 end')

// 7. 出线数量限制
console.log('连线失败：start 最多只能有 1 条出线')

// 8. 入线数量限制
console.log('连线失败：start 最多只能有 0 条入线')
```

### 调试技巧

```typescript
// 1. 查看当前规则配置
const { rules } = useLineRulesVueFlow()
console.log('当前规则:', rules)

// 2. 单独测试节点类型连接
const { isValidConnection } = useLineRulesVueFlow()
console.log('start -> big-scene:', isValidConnection('start', 'big-scene'))  // true
console.log('start -> end:', isValidConnection('start', 'end'))              // false

// 3. 测试循环检测
const { wouldCreateCycle } = useLineRulesVueFlow()
console.log('会形成循环:', wouldCreateCycle('node1', 'node2'))

// 4. 测试子场景到2D
const { canConnectSubSceneTo2D } = useLineRulesVueFlow()
console.log('可以连接:', canConnectSubSceneTo2D('big-scene-1', 'sub-scene-1', '2d-1'))
```

## 自定义规则

### 示例 1：修改大场景的出线限制

```typescript
import { useLineRulesVueFlow, defaultConnectionRules } from '@/composables/useLineRulesVueFlow'

// 限制大场景最多只能有3条出线
const customRules = {
  'big-scene': {
    ...defaultConnectionRules['big-scene'],
    maxOutgoingEdges: 3,  // 覆盖默认的 undefined
  }
}

const { canAddLine } = useLineRulesVueFlow(customRules)
```

**效果**：
```
大场景A ──→ 大场景B   ✅ (第1条)
大场景A ──→ 大场景C   ✅ (第2条)
大场景A ──→ 结束      ✅ (第3条)
大场景A ──→ 大场景D   ❌ (第4条，超过限制)
```

### 示例 2：允许特定节点循环

```typescript
// 允许特殊节点类型形成循环
const customRules = {
  'special-node': {
    allowedTargets: ['special-node', 'big-scene'],
    maxOutgoingEdges: undefined,
    maxIncomingEdges: undefined,
    allowCycle: true,        // 允许循环
    allowSelfConnection: true, // 允许自连接
    allowDuplicateConnection: false,
  }
}

const { canAddLine } = useLineRulesVueFlow(customRules)
```

**效果**：
```
特殊节点A ──→ 特殊节点B ──→ 特殊节点A  ✅ (允许循环)
特殊节点A ──→ 特殊节点A               ✅ (允许自连接)
```

### 示例 3：添加新节点类型

```typescript
import { defaultConnectionRules } from '@/composables/useLineRulesVueFlow'

// 添加新的"检查点"节点类型
const customRules = {
  ...defaultConnectionRules,
  'checkpoint': {
    allowedTargets: ['big-scene', 'end'],
    maxOutgoingEdges: 2,      // 最多2条出线
    maxIncomingEdges: 1,      // 最多1条入线
    allowCycle: false,
    allowSelfConnection: false,
    allowDuplicateConnection: false,
  }
}

const { canAddLine } = useLineRulesVueFlow(customRules)
```

### 示例 4：完全自定义验证

```typescript
// 自定义验证函数
const onConnect = (connection: Connection) => {
  // 1. 先使用默认规则验证
  if (!canAddLine(connection)) {
    return
  }
  
  // 2. 添加自定义业务逻辑
  const sourceNode = getNode.value(connection.source)
  const targetNode = getNode.value(connection.target)
  
  // 示例：检查节点的自定义属性
  if (sourceNode?.data?.locked || targetNode?.data?.locked) {
    console.log('连线失败：节点已锁定')
    return
  }
  
  // 示例：检查用户权限
  if (!userHasPermission('create-connection')) {
    console.log('连线失败：无权限')
    return
  }
  
  // 3. 验证通过，创建连线
  addEdges([connection])
  pushHistory({ nodes, edges })
}
```

## 完整工作流示例

### 典型的工作流结构

```
开始
  ↓
入戏引导
  ↓
大场景1
  ├─ 子场景1-1 ──→ 2D描述A
  ├─ 子场景1-2 ──→ 2D描述A (共享)
  └─ 子场景1-3 ──→ 2D描述B
  ↓
大场景2
  ├─ 子场景2-1 ──→ 2D描述C
  └─ 子场景2-2 ──→ 2D描述D
  ↓
出戏引导
  ↓
结束
```

**连线规则验证**：

1. ✅ `开始 → 入戏引导`（允许）
2. ✅ `入戏引导 → 大场景1`（允许，1条出线）
3. ✅ `大场景1 → 大场景2`（允许，节点间第一条线）
4. ✅ `子场景1-1 → 2D描述A`（允许）
5. ✅ `子场景1-2 → 2D描述A`（允许，不同子场景）
6. ✅ `子场景1-3 → 2D描述B`（允许）
7. ✅ `大场景2 → 出戏引导`（允许）
8. ✅ `出戏引导 → 结束`（允许，1条出线）

### 不允许的连接

```
❌ 开始 → 大场景1 → 入戏引导
   (开始已有出线，maxOutgoingEdges=1)

❌ 开始 → 结束
   (结束不在开始的allowedTargets中)

❌ 大场景1 → 大场景2 → 大场景1
   (形成循环)

❌ 大场景1 → 大场景2 (再次连接)
   (重复连线，allowDuplicateConnection=false)

❌ 子场景1-1 → 2D描述A → 2D描述B
   (子场景1-1已连接到2D描述A)

❌ 结束 → 任何节点
   (结束节点不能有出线)
```

## 🎯 最佳实践

1. **始终使用 canAddLine 验证**
   ```typescript
   if (canAddLine(connection)) {
     // 创建连线
   }
   ```

2. **查看控制台日志**
   - 所有验证失败都会输出详细信息
   - 帮助快速定位问题

3. **测试边界情况**
   - 自连接
   - 循环
   - 数量限制
   - 类型限制

4. **自定义规则时保留默认规则**
   ```typescript
   const customRules = {
     ...defaultConnectionRules,
     'new-type': { ... }
   }
   ```

5. **根据业务需求调整规则**
   - 不是所有场景都需要严格限制
   - 可以针对特定节点类型放宽规则

## 📊 性能考虑

- **边查找**：使用 `filter`
- **循环检测**：使用深度优先搜索（DFS）
- **缓存**：规则配置在初始化时合并，避免重复计算
- **早期返回**：验证失败时立即返回，避免不必要的检查

## 🔗 相关文档

- [连线规则配置详解](./CONNECTION_RULES_CONFIG.md)
- [节点系统设计](./NODE_SYSTEM_DESIGN.md)
- [工作流编辑器](./src/components/vueflow/WorkflowEditor.vue)
