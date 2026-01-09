# 快速启动指南

## 📦 安装步骤

### 1. 进入项目目录

```bash
cd vue-editors
```

### 2. 安装依赖

```bash
npm install
```

或者使用 yarn：

```bash
yarn install
```

### 3. 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3001 启动

## 🎯 使用说明

1. **切换编辑器**：点击页面顶部的 "AntV X6" 或 "Vue Flow" 标签切换编辑器

2. **测试功能**：
   - 拖拽节点
   - 创建连线（从节点的连接点拖拽到另一个节点）
   - 使用工具栏按钮
   - 使用快捷键（见下方）

3. **对比功能**：
   - AntV X6：自动对齐、节点分组、右键菜单都是内置的
   - Vue Flow：需要自己实现这些功能（当前版本已实现基础功能）

## ⌨️ 快捷键

两个编辑器都支持：

- `Ctrl/Cmd + Z` - 撤销
- `Ctrl/Cmd + Shift + Z` - 重做
- `Ctrl/Cmd + C` - 复制
- `Ctrl/Cmd + V` - 粘贴
- `Ctrl/Cmd + A` - 全选
- `Delete/Backspace` - 删除选中节点
- `Ctrl/Cmd + G` - 节点分组（仅 AntV X6）

## 🔍 功能对比

| 功能 | AntV X6 | Vue Flow |
|------|---------|----------|
| 自动对齐 | ✅ 内置 | ⚠️ 需实现 |
| 节点分组 | ✅ 内置 | ⚠️ 需实现 |
| 右键菜单 | ✅ 插件 | ⚠️ 需实现 |
| 快捷键 | ✅ 插件 | ✅ 已实现 |
| 连线规则 | ✅ 内置 | ✅ 已实现 |
| 撤销/重做 | ✅ 插件 | ✅ 已实现 |

## 📝 注意事项

1. 如果遇到依赖安装问题，请确保 Node.js 版本 >= 16
2. 如果端口 3001 被占用，Vite 会自动使用下一个可用端口
3. 首次启动可能需要一些时间来编译

## 🐛 常见问题

### 问题：依赖安装失败

**解决方案**：
```bash
# 清除缓存
npm cache clean --force
# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json
# 重新安装
npm install
```

### 问题：端口被占用

**解决方案**：
修改 `vite.config.ts` 中的端口号：
```typescript
server: {
  port: 3002, // 改为其他端口
}
```

### 问题：样式不显示

**解决方案**：
确保已正确导入 CSS 文件，检查组件中的 import 语句。

