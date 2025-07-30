# 📋 Level 3 Chrome插件技术架构规划

## 🎯 需求定义

### 功能需求
1. **核心可视化功能**
   - [x] JSON文件解析和DAG数据提取
   - [x] SVG节点渲染和连线绘制  
   - [x] 分层布局算法实现
   - [x] 节点交互选择和路径高亮
   - [x] 配置导出功能（简化版本）

2. **Chrome插件特有功能**
   - [ ] **Popup界面** - 快速启动和状态展示
   - [ ] **右键菜单** - 网页中快速调用可视化器
   - [ ] **Content Script注入** - 在网页中显示可视化界面
   - [ ] **本地文件访问** - 通过Chrome API读取本地文件
   - [ ] **数据存储** - 保存用户偏好设置

3. **用户体验功能**
   - [ ] **一键启动** - 点击插件图标即可启动
   - [ ] **多标签支持** - 在不同网页中独立使用
   - [ ] **状态保持** - 记住上次使用的配置
   - [ ] **快捷操作** - 右键菜单快速访问

### 非功能需求
- **性能**: 插件启动时间 < 500ms
- **内存**: 占用内存 < 50MB
- **兼容性**: Chrome 88+ 版本支持
- **安全性**: 符合Chrome插件安全规范
- **可维护性**: 模块化代码结构

## 🔍 组件分析

### 新建组件

#### 1. **Manifest配置** (`manifest.json`)
- **职责**: 插件基本信息、权限配置、入口定义
- **依赖**: Chrome Extension API v3
- **关键配置**:
  - 权限: `activeTab`, `storage`, `contextMenus`
  - 入口: popup.html, background.js, content_script.js

#### 2. **Background Service Worker** (`background.js`)
- **职责**: 插件生命周期管理、右键菜单、消息传递
- **依赖**: Chrome Extension API
- **功能**:
  - 右键菜单注册
  - 插件图标状态管理
  - Content Script与Popup通信中转

#### 3. **Popup界面** (`popup.html + popup.js`)
- **职责**: 插件快速操作界面
- **依赖**: Chrome Storage API
- **功能**:
  - 快速启动可视化器
  - 最近使用文件列表
  - 基本设置选项

#### 4. **Content Script** (`content.js`)
- **职责**: 在网页中注入可视化界面
- **依赖**: 独立HTML版本的代码
- **功能**:
  - 动态创建可视化界面
  - 与Background通信
  - 页面DOM操作

#### 5. **核心可视化模块** (`dag-visualizer-core.js`)
- **职责**: DAG可视化核心逻辑（复用现有代码）
- **依赖**: 无外部依赖
- **来源**: 基于`dag-visualizer-standalone.html`重构

### 受影响的现有组件
- **独立HTML版本** → 拆分为模块化组件
- **CSS样式** → 适配Chrome插件环境
- **文件操作** → 改用Chrome File API

## ⚙️ 实施策略

### 第一阶段：插件框架搭建 🏗️
1. **创建基础插件结构**
   - manifest.json配置
   - 基础目录结构
   - 权限和API配置

2. **实现Background Service**
   - 右键菜单注册
   - 消息传递框架
   - 生命周期管理

3. **开发Popup界面**
   - 简洁的启动界面
   - 基本设置选项
   - 状态展示

### 第二阶段：核心功能移植 🔄
1. **重构可视化核心**
   - 从HTML版本提取JavaScript代码
   - 模块化DAG渲染逻辑
   - 适配Chrome插件环境

2. **实现Content Script**
   - 界面注入逻辑
   - 样式隔离处理
   - 消息通信机制

3. **文件操作适配**
   - Chrome File API集成
   - 本地存储功能
   - 配置导入导出

### 第三阶段：用户体验优化 ✨
1. **交互体验优化**
   - 快捷键支持
   - 右键菜单集成
   - 多标签状态管理

2. **性能优化**
   - 代码分割和懒加载
   - 内存使用优化
   - 启动时间优化

3. **错误处理和反馈**
   - 完善的错误提示
   - 用户操作反馈
   - 调试信息收集

## 🔗 依赖关系

### 技术依赖
- **Chrome Extension API v3** - 插件基础框架
- **Chrome Storage API** - 数据存储
- **Chrome Tabs API** - 标签页操作
- **Chrome ContextMenus API** - 右键菜单

### 代码依赖
- **现有可视化逻辑** ✅ 来自`dag-visualizer-standalone.html`
- **样式系统** ✅ 复用现有CSS，需要适配
- **布局算法** ✅ 复用现有分层布局代码

### 外部依赖
- **零外部库依赖** ✅ 保持轻量级特性

## ⚠️ 风险识别与缓解

### 高风险
1. **Chrome API权限限制**
   - **风险**: 某些文件操作可能受限
   - **缓解**: 使用Chrome File API，提供拖拽上传备选方案

2. **Content Script样式冲突**
   - **风险**: 注入的样式可能与网页冲突
   - **缓解**: 使用Shadow DOM或CSS模块化方案

### 中风险
1. **插件审核问题**
   - **风险**: Chrome Web Store审核标准
   - **缓解**: 严格遵循安全规范，最小权限原则

2. **跨页面状态管理**
   - **风险**: 不同标签页数据同步复杂
   - **缓解**: 使用Chrome Storage API统一管理

### 低风险
1. **性能影响**
   - **风险**: 大型DAG可能影响页面性能
   - **缓解**: 虚拟化渲染，分页加载

## 🎨 需要CREATIVE阶段的方面

### 1. UI/UX设计决策 🎨 **[标记为需要CREATIVE]**
- **问题**: Popup界面布局和交互设计
- **挑战**: 在有限空间内提供完整功能访问
- **需要决策**: 
  - Popup尺寸和布局方案
  - 快速操作的优先级排序
  - 与Content Script界面的一致性

### 2. 架构设计决策 🏗️ **[标记为需要CREATIVE]**
- **问题**: Content Script与Background的通信架构
- **挑战**: 高效的消息传递和状态同步
- **需要决策**:
  - 消息传递协议设计
  - 状态管理架构
  - 错误处理机制

### 3. 文件操作策略 📁 **[标记为需要CREATIVE]**
- **问题**: Chrome环境下的文件访问方案
- **挑战**: 平衡安全性和易用性
- **需要决策**:
  - 文件读取方式选择
  - 本地存储策略
  - 用户数据隐私保护

## 📂 Chrome插件文件结构

```
chrome-extension/
├── manifest.json              # 插件配置文件
├── background.js              # Background Service Worker
├── popup/
│   ├── popup.html            # Popup界面
│   ├── popup.js              # Popup逻辑
│   └── popup.css             # Popup样式
├── content/
│   ├── content.js            # Content Script
│   └── content.css           # 注入样式
├── core/
│   ├── dag-visualizer-core.js # 核心可视化逻辑
│   ├── layout-algorithms.js   # 布局算法
│   └── file-operations.js     # 文件处理
├── assets/
│   ├── icon16.png            # 插件图标 16x16
│   ├── icon48.png            # 插件图标 48x48
│   └── icon128.png           # 插件图标 128x128
└── utils/
    ├── message-handler.js     # 消息传递工具
    └── storage-manager.js     # 存储管理工具
```

## 📊 实施时间线

### 第一阶段（预计1-2天）
- [x] 基础框架验证完成（独立HTML版本）
- [ ] Chrome插件基础结构搭建
- [ ] Manifest.json配置完成
- [ ] Background Service基础功能

### 第二阶段（预计2-3天）
- [ ] 核心可视化功能移植
- [ ] Content Script实现
- [ ] Popup界面开发
- [ ] 基础通信机制

### 第三阶段（预计1-2天）
- [ ] 用户体验优化
- [ ] 错误处理完善
- [ ] 性能调优
- [ ] 测试和发布准备

## ✅ 规划验证清单

- [x] **需求分析完成** - 功能和非功能需求明确定义
- [x] **组件识别完成** - 新建和受影响组件全面分析
- [x] **实施策略制定** - 三阶段渐进式开发计划
- [x] **依赖关系梳理** - 技术栈和代码依赖明确
- [x] **风险评估完成** - 识别高中低风险并制定缓解策略
- [x] **CREATIVE方面标记** - UI/UX、架构、文件操作需要创意设计
- [x] **文件结构设计** - Chrome插件完整目录结构
- [x] **时间线规划** - 分阶段实施计划制定

## 🚀 下一步：进入CREATIVE阶段

根据标记的三个CREATIVE方面，下一阶段需要：

1. **UI/UX设计决策** - Popup界面和交互设计
2. **架构设计决策** - 通信和状态管理架构  
3. **文件操作策略** - Chrome环境文件访问方案

---

**📝 规划文档版本**: v1.0  
**📅 创建时间**: IMPLEMENT阶段完成后  
**🎯 目标**: 基于验证通过的独立HTML版本，转换为完整的Chrome插件 