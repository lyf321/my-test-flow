# 2D画面连线逻辑更新

## 🔄 变更说明

### 之前的逻辑
连线从**大场景节点的主连接点**出发 → 2D描述节点

```
大场景节点 (主连接点)
  ├─ 小场景1
  ├─ 小场景2
  └─ 小场景3
         ↓
    2D描述节点
```

### 现在的逻辑
连线从**每个小场景的独立连接点**出发 → 2D描述节点

```
大场景节点
  ├─ 小场景1 (独立连接点) ──→ 2D描述节点1
  ├─ 小场景2 (独立连接点) ──→ 2D描述节点2
  └─ 小场景3 (独立连接点) ──→ 共享2D描述节点
         ↑
  ├─ 小场景4 (独立连接点) ──┘
```

## 📝 技术实现

### 1. 小场景连接点ID
每个小场景都有独立的Handle，ID格式为：
```typescript
const subSceneHandleId = `sub-scene-${subScene.id}`
```

### 2. 创建连线时指定sourceHandle
```typescript
const newEdge = {
  id: `edge_${bigSceneNode.id}_${subSceneHandleId}_${twoDNode.id}_${Date.now()}`,
  source: bigSceneNode.id,              // 源节点是大场景
  sourceHandle: subSceneHandleId,        // 但从小场景的Handle出发
  target: twoDNode.id,                   // 目标是2D节点
  type: 'smoothstep',
  style: {
    stroke: '#8b5cf6',
    strokeWidth: 2,
  },
  data: {
    subSceneId: subScene.id,
    isShared: false,
  }
}
```

### 3. 删除连线时使用sourceHandle匹配
```typescript
const edgesToRemove = getEdges.value.filter(
  edge => edge.source === bigSceneNode.id && 
          edge.sourceHandle === subSceneHandleId &&  // 匹配具体的Handle
          edge.target === twoDNodeId
)
```

## 🎯 改动的函数

### `generate2DForSubScene()`
为单个子场景生成2D描述时：
- ✅ 使用`sourceHandle: subSceneHandleId`指定连线起点
- ✅ 删除旧连线时匹配`sourceHandle`

### `generateShared2D()`
为所有子场景生成共享2D时：
- ✅ 每条连线都指定对应的`sourceHandle`
- ✅ 多条连线从不同的小场景Handle出发，连接到同一个2D节点

### `remove2DFromSubScene()`
删除子场景的2D描述时：
- ✅ 使用`sourceHandle`精确匹配要删除的连线

### `removeShared2D()`
删除共享2D描述时：
- ✅ 遍历所有子场景，匹配每个子场景的`sourceHandle`
- ✅ 删除所有相关连线

## 📊 视觉效果

### 独立2D连线
```
小场景1 ━━━━━━━━━━→ 2D描述1
  (实线，紫色)
```

### 共享2D连线
```
小场景1 ┄┄┄┄┄┄┄┄┄┐
小场景2 ┄┄┄┄┄┄┄┄┄┤→ 共享2D描述
小场景3 ┄┄┄┄┄┄┄┄┄┘
  (虚线，紫色)
```

## ✅ 优势

1. **精确连接**：每条连线都从正确的小场景出发，视觉上更清晰
2. **易于追踪**：可以直观看到哪个小场景连接到哪个2D节点
3. **便于管理**：删除和更新连线时更准确，不会误删其他连线
4. **符合语义**：连线真实反映了"小场景 → 2D描述"的关系

## 🔍 测试验证

### 测试场景1：创建独立2D
1. 点击小场景的"添加2D画面"
2. ✅ 验证：连线从小场景的Handle（右侧）出发
3. ✅ 验证：连线到达2D节点的Input handle（左侧）

### 测试场景2：创建共享2D
1. 点击"生成共享2D描述"
2. ✅ 验证：每个小场景都有一条虚线连接到共享2D
3. ✅ 验证：每条连线都从对应小场景的Handle出发

### 测试场景3：替换2D
1. 小场景1已有独立2D
2. 生成共享2D
3. ✅ 验证：小场景1的旧连线被删除
4. ✅ 验证：新的虚线连接到共享2D

### 测试场景4：删除2D
1. 删除小场景的独立2D
2. ✅ 验证：只删除该小场景的连线
3. ✅ 验证：不影响其他小场景的连线

## 📂 修改的文件

- `src/composables/use2DDescriptionManager.ts` - 所有2D连线管理逻辑

## 🎉 总结

现在2D画面的连线正确地从**小场景的独立连接点**出发，而不是从大场景节点的主连接点出发。这使得连线关系更加清晰、精确和易于管理。
