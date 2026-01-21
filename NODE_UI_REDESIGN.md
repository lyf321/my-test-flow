# 节点UI重新设计

## 📋 概述

根据Figma设计稿重新设计了开始、结束、入戏引导和出戏引导节点的UI，使其更加现代、美观和符合设计规范。

## 🎨 设计要点

### 1. 开始节点（Start Node）

**设计特点**：
- 🟢 **绿色圆形图标**：32px圆形，内含"开"字
- **横向布局**：图标在左，"开始"文字在右
- **简洁风格**：白色背景，圆角矩形卡片
- **连接点位置**：右侧（输出）

**视觉效果**：
```
┌────────────┐
│ ⭕ 开始    │
│ 开         │
└────────────┘
```

**样式**：
- 背景：`#ffffff`
- 阴影：`0 1px 3px rgba(0, 0, 0, 0.1)`
- 圆角：`24px`
- 图标颜色：`#10b981`（绿色）

### 2. 结束节点（End Node）

**设计特点**：
- 🟠 **橙色圆形图标**：32px圆形，内含"U"字
- **横向布局**：图标在左，"结束"文字在右
- **简洁风格**：白色背景，圆角矩形卡片
- **连接点位置**：左侧（输入）

**视觉效果**：
```
┌────────────┐
│ ⭕ 结束    │
│ U          │
└────────────┘
```

**样式**：
- 背景：`#ffffff`
- 阴影：`0 1px 3px rgba(0, 0, 0, 0.1)`
- 圆角：`24px`
- 图标颜色：`#f97316`（橙色）

### 3. 入戏引导节点（Enter Guide Node）

**设计特点**：
- 🟣 **紫色方形图标**：24px方形，内含"→"符号
- **卡片式布局**：包含头部和内容区
- **头部**：左侧图标+标题，右侧"更新生成"标签
- **内容区**：显示引导文本
- **固定宽度**：320px
- **连接点位置**：左侧（输入）+ 右侧（输出）

**视觉效果**：
```
┌──────────────────────────────┐
│ 🟣→ 入戏引导      [更新生成]  │
├──────────────────────────────┤
│ 此刻，你并不在地球。你正位于  │
│ 一艘正在遥航的虚拟船上，眼皮  │
│ 之外，是微末险名的星域。恒星  │
│ 的光在这处弧霾，宇宙安眠而流  │
│ 逝。                         │
└──────────────────────────────┘
```

**样式**：
- 背景：`#ffffff`
- 边框：`1px solid #e5e7eb`
- 阴影：`0 1px 3px rgba(0, 0, 0, 0.1)`
- 圆角：`12px`
- 图标颜色：`#8b5cf6`（紫色）
- 标签背景：`#f3e8ff`（浅紫色）

### 4. 出戏引导节点（Exit Guide Node）

**设计特点**：
- 🌸 **粉色方形图标**：24px方形，内含"←"符号
- **卡片式布局**：与入戏引导相似
- **头部**：左侧图标+标题，右侧"更新生成"标签
- **内容区**：显示引导文本
- **固定宽度**：320px
- **连接点位置**：左侧（输入）+ 右侧（输出）

**视觉效果**：
```
┌──────────────────────────────┐
│ 🌸← 出戏引导      [更新生成]  │
├──────────────────────────────┤
│ 船舱的灯光渐渐熄灭，星空的壮  │
│ 丽画面在你的视野中慢慢褪去。  │
│ 你感到身体逐渐回到现实，意识  │
│ 重新回归地球。                │
└──────────────────────────────┘
```

**样式**：
- 背景：`#ffffff`
- 边框：`1px solid #e5e7eb`
- 阴影：`0 1px 3px rgba(0, 0, 0, 0.1)`
- 圆角：`12px`
- 图标颜色：`#ec4899`（粉色）
- 标签背景：`#fce7f3`（浅粉色）

## 🔧 技术实现

### 1. 开始和结束节点

**组件结构**：
```vue
<template>
  <BaseNode :custom-style="customStyle">
    <div class="node-content">
      <div class="node-icon">开/U</div>
      <div class="node-label">开始/结束</div>
    </div>
  </BaseNode>
</template>
```

**关键CSS**：
```css
.node-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #10b981 / #f97316;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 2. 入戏和出戏引导节点

**组件结构**（不使用BaseNode，完全自定义）：
```vue
<template>
  <div class="guide-wrapper">
    <div class="guide-card">
      <div class="card-header">
        <div class="header-left">
          <div class="guide-icon">→/←</div>
          <span class="guide-title">入戏引导/出戏引导</span>
        </div>
        <div class="header-right">
          <span class="generate-badge">更新生成</span>
        </div>
      </div>
      <div class="card-content">
        <div class="content-text">{{ data.content }}</div>
      </div>
    </div>
    
    <!-- Vue Flow 连接点 -->
    <Handle type="target" :position="Position.Left" />
    <Handle type="source" :position="Position.Right" />
  </div>
</template>
```

**关键CSS**：
```css
.guide-card {
  width: 320px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #e5e7eb;
}

.guide-icon {
  width: 24px;
  height: 24px;
  background: #8b5cf6 / #ec4899;
  border-radius: 4px;
  color: white;
}

.generate-badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background: #f3e8ff / #fce7f3;
  color: #8b5cf6 / #ec4899;
}
```

## 📊 节点对比

| 节点类型 | 布局方式 | 主色调 | 图标形状 | 宽度 | 连接点 |
|---------|---------|--------|---------|------|--------|
| **开始** | 横向 | 绿色 #10b981 | 圆形 | 自适应 | 右侧输出 |
| **结束** | 横向 | 橙色 #f97316 | 圆形 | 自适应 | 左侧输入 |
| **入戏引导** | 卡片式 | 紫色 #8b5cf6 | 方形 | 320px | 左右双向 |
| **出戏引导** | 卡片式 | 粉色 #ec4899 | 方形 | 320px | 左右双向 |

## 🎯 设计决策

### 1. 为什么不使用BaseNode？

**入戏引导和出戏引导节点**：
- ✅ 需要完全自定义的卡片布局
- ✅ 包含头部、内容区等复杂结构
- ✅ 固定宽度（320px）
- ✅ BaseNode的通用结构难以满足需求

**开始和结束节点**：
- ✅ 仍使用BaseNode，只自定义内容区
- ✅ 利用BaseNode的连接点管理
- ✅ 保持代码复用性

### 2. 颜色选择

- **开始节点**：绿色 - 代表开始、生长、活力
- **结束节点**：橙色 - 代表完成、收获、终点
- **入戏引导**：紫色 - 代表神秘、沉浸、进入
- **出戏引导**：粉色 - 代表温和、退出、回归

### 3. 布局方式

- **开始/结束**：横向简洁布局，适合流程起止点
- **引导节点**：卡片式布局，承载更多文本内容

## 📝 数据结构

### 开始节点
```typescript
{
  id: 'start_0',
  type: 'start',
  position: { x: 100, y: 200 },
  data: {
    title: '开始',
  },
}
```

### 结束节点
```typescript
{
  id: 'end_0',
  type: 'end',
  position: { x: 850, y: 260 },
  data: {
    title: '结束',
  },
}
```

### 入戏引导节点
```typescript
{
  id: 'enter_guide_1',
  type: 'enter-guide',
  position: { x: 350, y: 180 },
  data: {
    title: '入戏引导',
    content: '此刻，你并不在地球。你正位于一艘正在遥航的虚拟船上...',
  },
}
```

### 出戏引导节点
```typescript
{
  id: 'exit_guide_1',
  type: 'exit-guide',
  position: { x: 600, y: 280 },
  data: {
    title: '出戏引导',
    content: '船舱的灯光渐渐熄灭，星空的壮丽画面在你的视野中慢慢褪去...',
  },
}
```

## 🔄 连接点位置调整

### 修改前
- 开始节点：底部输出
- 结束节点：顶部输入
- 引导节点：左右双向

### 修改后
- 开始节点：**右侧输出**（更符合横向流程）
- 结束节点：**左侧输入**（更符合横向流程）
- 引导节点：左右双向（保持不变）

## 📂 修改的文件

1. **`src/components/vueflow/nodes/StartNode.vue`**
   - 重新设计为横向布局
   - 绿色圆形图标 + 文字
   - 连接点改为右侧

2. **`src/components/vueflow/nodes/EndNode.vue`**
   - 重新设计为横向布局
   - 橙色圆形图标 + 文字
   - 连接点改为左侧

3. **`src/components/vueflow/nodes/EnterGuideNode.vue`**
   - 完全重写为卡片式布局
   - 紫色主题 + 方形图标
   - 固定320px宽度
   - 包含头部和内容区

4. **`src/components/vueflow/nodes/ExitGuideNode.vue`**
   - 完全重写为卡片式布局
   - 粉色主题 + 方形图标
   - 固定320px宽度
   - 包含头部和内容区

5. **`src/data/initial-data.ts`**
   - 为引导节点添加`content`字段
   - 添加示例文本内容

## ✨ 视觉改进

### 1. 更清晰的层次
- 使用卡片式布局分隔头部和内容
- 头部使用浅灰背景区分

### 2. 更好的可读性
- 合适的字体大小（12-14px）
- 充足的行高（1.6）
- 合理的内边距

### 3. 更强的视觉引导
- 彩色图标突出节点类型
- "更新生成"标签提示可操作性
- 圆角和阴影增加立体感

### 4. 一致的设计语言
- 统一的圆角规范（12px/24px）
- 一致的阴影效果
- 协调的颜色系统

## 🎉 总结

通过这次重新设计，节点UI更加：
- ✅ **美观** - 现代化的卡片设计
- ✅ **清晰** - 明确的视觉层次
- ✅ **专业** - 符合设计规范
- ✅ **实用** - 更好的信息承载能力

特别是引导节点从简单的横向布局升级为卡片式布局，可以展示更丰富的引导文本内容，大大提升了用户体验！
