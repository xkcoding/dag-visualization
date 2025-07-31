# 💻 技术上下文

## 🖥️ 开发环境
- **操作系统**: macOS (darwin 24.5.0)
- **Shell**: zsh
- **开发工具**: Cursor 编辑器
- **工作目录**: `/Users/yangkai.shen/code/dag_visualization`

## 🛠️ 现有技术资产
- **测试数据**: `test.json`, `dag-question-rewrite-rerank.json` - DAG工作流配置
- **Chrome扩展**: `dag-visualizer-extension/` - 完整的ReactFlow应用
- **核心组件**: DAGVisualizer, JSONInputArea, StatusBar等
- **布局算法**: `layoutUtils.ts`, `edgeOptimization.ts` - 自定义智能布局

## ✅ 实际技术栈 (Phase 2完成)
### 📋 核心技术架构
- **前端框架**: React 18 + TypeScript
- **图形渲染**: ReactFlow v11.x
- **构建工具**: Vite + TypeScript编译
- **Chrome扩展**: Manifest V3架构
- **代码编辑**: Monaco Editor

### 🎨 UI/UX技术实现
- **渲染引擎**: ReactFlow专业图形库
- **样式系统**: CSS模块化 + 内联样式
- **布局算法**: 自定义智能布局 + 层级感知
- **交互处理**: ReactFlow事件系统 + React Hooks

### 🔄 数据处理技术
- **JSON解析**: `dagDataProcessor.ts` - 支持复杂工作流解析
- **类型系统**: TypeScript类型定义，完整类型安全
- **文件操作**: HTML5 File API + JSON导入导出
- **状态管理**: React Hooks + Context API

## 🧠 智能布局系统 (Phase 2.5)
### 当前实现特点
- **层级感知**: 基于拓扑排序的节点层级计算
- **穿越检测**: 线段相交算法，精确识别连线与节点碰撞
- **智能绕行**: 动态偏移量计算，强制定位策略
- **自适应优化**: 简单DAG用基础算法，复杂DAG用增强算法

### 技术评估与优化方向
#### 当前算法优缺点
**优势**:
- ✅ 针对性强，完全定制，效果优良
- ✅ 用户反馈"完美，符合预期"
- ✅ 层级感知，保持正常流程直接连线

**挑战**:
- ⚠️ 代码复杂度较高，维护成本大
- ⚠️ 算法相对简单，可能不如专业布局库稳定

#### 未来技术选型 (Phase 3+ 考虑)
**ELKjs迁移评估**:
- **技术优势**: Eclipse Layout Kernel，业界成熟方案
- **ReactFlow生态**: 官方推荐，完整集成支持
- **核心功能**: 内置POLYLINE边路由，自动避免节点穿越
- **维护收益**: 降低代码复杂度，提升算法稳定性

**迁移策略**:
1. 保持现有实现稳定运行
2. Phase 3期间并行测试ELKjs
3. 效果对比和性能评估
4. 逐步迁移或保持现状

## 🔧 技术约束
- **浏览器兼容性**: Chrome Extension环境
- **性能要求**: 复杂DAG渲染 < 2s，流畅交互
- **扩展限制**: Chrome Extension权限范围
- **维护要求**: TypeScript类型安全，模块化架构

## 📚 技术债务管控
- **当前状态**: 自定义布局算法复杂度较高
- **风险评估**: 中等风险，功能稳定但维护成本大
- **缓解策略**: ELKjs评估作为中长期技术演进方向
- **决策原则**: 保持稳定性优先，技术演进为辅

---
*技术上下文更新时间: Phase 2.5完成，技术栈确认为React+ReactFlow* 