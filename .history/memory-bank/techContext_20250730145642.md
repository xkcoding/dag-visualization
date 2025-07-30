# 💻 技术上下文

## 🖥️ 开发环境
- **操作系统**: macOS (darwin 24.5.0)
- **Shell**: zsh
- **开发工具**: Cursor 编辑器

## 🛠️ 现有技术资产
- dag-question-rewrite-rerank.json (36KB, 1410行) - 真实数据源
- 技术验证代码：`native-validation/lightweight-dag.html` - 完整功能验证
- 技术验证代码：`native-validation/real-data-test.html` - 真实数据支持
- JSON解析器实现：`tech-validation/dag-parser.js` - 可复用组件

## ✅ 确定的技术栈
### 📋 核心技术架构（创意阶段确定）
- **前端技术**：原生 JavaScript (ES6+) + SVG + CSS
- **部署方式**：油猴脚本 (.user.js)，单文件分发
- **构建工具**：零构建，直接开发部署
- **依赖管理**：完全无外部依赖

### 🎨 UI/UX技术实现
- **渲染引擎**：SVG原生渲染，4KB核心代码
- **样式系统**：严格遵循`memory-bank/style-guide.md`规范
- **布局算法**：分层布局 (Hierarchical Layout)
- **交互处理**：原生DOM事件，无框架依赖

### 🔄 数据处理技术
- **JSON解析**：原生JavaScript解析器，支持29节点
- **配置导出**：简化策略，input/output置空，添加`_visualization`字段
- **文件操作**：Blob API + FileReader，支持拖拽上传

## 🔧 技术约束
- **浏览器兼容性**：Chrome, Firefox, Safari (现代浏览器)
- **性能要求**：29节点渲染 < 500ms，总文件 < 20KB
- **安全限制**：油猴脚本权限范围内，无服务器依赖
- **维护要求**：单文件架构，易于更新和分发

## 📚 技术债务
- 暂无重大技术债务，架构简洁清晰

---
*此文件已在创意阶段完成技术栈确定* 