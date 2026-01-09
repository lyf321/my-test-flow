# Vue Flow 快速开始指南

## 1. 项目初始化

### 基础项目结构

```
src/
├── components/
│   ├── editor/
│   │   ├── WorkflowEditor.vue      # 主编辑器组件
│   │   ├── NodeRenderer.vue        # 节点渲染器
│   │   └── EdgeRenderer.vue         # 连线渲染器
│   ├── nodes/
│   │   ├── StartNode.vue           # 开始节点
│   │   ├── EndNode.vue             # 结束节点
│   │   ├── ConditionNode.vue      # 条件节点
│   │   └── ...                     # 其他节点类型
│   └── plugins/
│       ├── SnapPlugin.vue          # 自动对齐插件
│       ├── GroupPlugin.vue         # 分组插件
│       └── ContextMenu.vue         # 右键菜单
├── composables/
│   ├── useEditor.ts                # 编辑器核心逻辑
│   ├── useHistory.ts               # 撤销/重做
│   ├── useNodeRegistry.ts          # 节点注册
│   └── useLineRules.ts             # 连线规则
├── stores/
│   └── editor.ts                   # Pinia store
├── types/
│   ├── node.ts                     # 节点类型定义
│   ├── edge.ts                     # 连线类型定义
│   └── workflow.ts                 # 工作流类型定义
└── utils/
    ├── node-utils.ts               # 节点工具函数
    └── graph-utils.ts              # 图算法工具
```

## 2. 基础编辑器实现
核心功能：
1. ✅ **自动对齐** - 节点拖拽时的对齐辅助线
2. ✅ **节点分组** - 节点分组和取消分组
3. ✅ **右键菜单** - 节点和画布的右键菜单
4. 点击节点选中节点
   1. 选中节点，如果有详细内容，可以唤起右侧边栏，展示细节
   2. 如果节点没有后续节点，则在右侧的边上添加一个加号，点击加号可以选择弹出的列表，选择并添加一个节点
5. 连线，点击连线会出现加号，点击加号可以选择弹出的列表，选择并添加一个节点
6. ✅ **快捷键系统** - 复制、粘贴、删除、全选、撤销、重做等
7. ✅ **连线规则验证**  