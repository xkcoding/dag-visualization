# 🎯 DAG Visualizer Extension

> React + ReactFlow + Monaco Editor + Chrome Extension

专业的DAG工作流可视化Chrome扩展，基于现代化React技术栈构建。

## 📖 概述

这是DAG Visualizer项目的Chrome扩展实现，提供专业级的有向无环图可视化功能。采用React 18 + ReactFlow 11 + Monaco Editor技术栈，为用户提供流畅的可视化编辑体验。

## ✨ 核心特性

### 🧠 智能可视化
- **ReactFlow引擎** - 专业级图形渲染
- **智能布局算法** - 自动优化连线避免穿越
- **多种布局模式** - 纵向/横向布局切换
- **实时交互** - 缩放、平移、节点拖拽

### 🎨 专业编辑
- **Monaco Editor** - VS Code级JSON编辑体验
- **实时验证** - JSON格式检查和错误提示
- **智能节点创建** - 右键创建，支持多种节点类型
- **可视化编辑** - 双击编辑节点属性

### 🔧 强大功能
- **多格式导出** - PNG/JPG/SVG高质量图片导出
- **颜色管理** - 批量颜色控制和持久化存储
- **连线管理** - 智能连线删除和依赖同步
- **历史管理** - 操作历史和文件管理

## 🏗️ 技术架构

### 技术栈
```yaml
Frontend: React 18 + TypeScript 5.3
Visualization: ReactFlow 11.11.4
Editor: Monaco Editor (@monaco-editor/react)
Platform: Chrome Extension Manifest V3
Build: Vite 7.0 + ESLint
State: React Context + useReducer
Storage: localStorage + Chrome Storage API
```

### 项目结构
```
src/
├── components/                 # React组件
│   ├── DAGVisualizer.tsx      # 主可视化组件
│   ├── JSONInputArea.tsx      # Monaco编辑器组件
│   ├── NodeCreationDialog.tsx # 节点创建对话框
│   ├── ImageExportDialog.tsx  # 图片导出配置
│   ├── ConfirmDialog.tsx      # 自定义确认对话框
│   ├── Toolbar.tsx            # 主工具栏
│   └── StatusBar.tsx          # 状态栏
├── context/                   # 状态管理
│   └── AppContext.tsx         # 全局状态管理
├── utils/                     # 工具函数
│   ├── layoutUtils.ts         # 智能布局算法
│   ├── dagDataProcessor.ts    # DAG数据处理
│   ├── nodeTypeManager.ts     # 节点类型管理
│   └── textUtils.ts           # 文本处理工具
├── types/                     # TypeScript类型
│   └── index.ts               # 核心类型定义
└── styles/                    # 样式系统
    └── App.css                # 主样式文件
```

## 🚀 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 开发模式 (带热重载)
npm run dev

# 构建扩展
npm run build

# 类型检查
npm run type-check

# 代码格式化
npm run format
```

### Chrome扩展安装

1. 构建项目: `npm run build`
2. 打开Chrome: `chrome://extensions/`
3. 开启开发者模式
4. 加载 `dist/` 目录

## 📋 开发指南

### 组件开发

#### 核心组件说明

**DAGVisualizer.tsx**
- ReactFlow主渲染组件
- 负责节点和边的可视化
- 处理用户交互事件
- 集成智能布局算法

**JSONInputArea.tsx**
- Monaco Editor集成组件
- JSON实时验证和语法高亮
- 支持格式化和错误提示
- 集成文件导入功能

**NodeCreationDialog.tsx**
- 节点创建界面组件
- 支持预设和自定义节点类型
- 颜色选择和属性配置
- 实时预览功能

### 状态管理

使用React Context + useReducer模式：

```typescript
// 全局状态结构
interface AppState {
  dagData: DAGData | null;
  jsonText: string;
  isLoading: boolean;
  error: string | null;
  fileHistory: FileHistoryItem[];
  isExporting: boolean;
}

// Action类型
type AppAction = 
  | { type: 'SET_DAG_DATA'; payload: DAGData }
  | { type: 'SET_JSON_TEXT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ALL' };
```

### 智能布局算法

核心算法位于 `utils/layoutUtils.ts`：

```typescript
/**
 * 智能布局计算
 * 1. 拓扑排序计算节点层级
 * 2. 检测连线穿越问题
 * 3. 应用智能绕行策略
 */
export function calculateSmartLayout(
  nodes: Node[], 
  edges: Edge[]
): Node[] {
  const levels = calculateNodeLevels(nodes, edges);
  const crossings = detectEdgeCrossings(nodes, edges, levels);
  
  if (crossings.length > 0) {
    return optimizeLayoutForEdgeCrossings(nodes, edges, crossings);
  }
  
  return nodes;
}
```

### 样式系统

采用CSS Grid + Flexbox布局：

```css
/* 主应用布局 */
.app-container {
  display: grid;
  grid-template-areas: 
    "toolbar toolbar"
    "json-input visualizer"
    "status status";
  grid-template-columns: 30% 70%;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .app-container {
    grid-template-areas: 
      "toolbar"
      "json-input"
      "visualizer"
      "status";
    grid-template-columns: 1fr;
  }
}
```

## 🧪 测试

### 手动测试流程

1. **基础功能测试**
   - JSON输入和验证
   - 节点创建和编辑
   - 连线删除
   - 布局优化

2. **导出功能测试**
   - PNG/JPG/SVG导出
   - 不同尺寸和质量设置
   - 文件名和时间戳

3. **交互测试**
   - 节点拖拽和对齐
   - 缩放和平移
   - 键盘快捷键

4. **兼容性测试**
   - Chrome不同版本
   - 不同屏幕尺寸
   - 大型DAG性能

### 性能监控

```typescript
// 性能监控示例
function measureLayoutPerformance() {
  const startTime = performance.now();
  const result = calculateSmartLayout(nodes, edges);
  const endTime = performance.now();
  
  console.log(`布局计算耗时: ${endTime - startTime}ms`);
  return result;
}
```

## 📊 性能优化

### 当前优化

- **React.memo** - 组件级缓存
- **useCallback** - 函数缓存
- **useMemo** - 计算结果缓存
- **按需渲染** - 条件渲染优化

### 未来优化方向

- **Web Worker** - 后台布局计算
- **虚拟化** - 大型DAG渲染优化
- **ELKjs迁移** - 成熟的布局引擎

## 🔧 构建配置

### Vite配置

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }
});
```

### TypeScript配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## 📝 版本历史

### v2.7.0 (2025-07-31)
- ✅ 用户界面体验优化
- ✅ 自定义确认对话框
- ✅ 品牌信息统一

### v2.6.0 (2025-07-31)
- ✅ 节点颜色管理系统
- ✅ 批量颜色控制
- ✅ localStorage持久化

### v2.5.0 (2025-07-31)
- ✅ 智能布局连线重叠优化
- ✅ 层级感知绕行策略
- ✅ DAG分析工具

### v2.4.0 (2024-11-30)
- ✅ 智能布局增强功能
- ✅ 拓扑排序算法
- ✅ 节点自动对齐

### v2.3.0 (2024-10-30)
- ✅ 图片导出功能
- ✅ PNG/JPG/SVG支持
- ✅ 导出配置对话框

### v2.2.0 (2024-09-30)
- ✅ 智能节点创建
- ✅ 可视化编辑功能
- ✅ 连线删除支持

### v2.1.0 (2024-08-30)
- ✅ Monaco Editor集成
- ✅ 专业编辑体验
- ✅ JSON实时验证

## 📄 许可证

MIT License - 详见 [LICENSE](../LICENSE) 文件

## 🔗 相关链接

- [项目主页](../)
- [技术文档](../memory-bank/)
- [开发指南](../memory-bank/systemPatterns.md)
- [反思总结](../memory-bank/reflection/)

---

*🚀 专业的DAG可视化工具，让工作流设计更简单*