# 🎯 DAG Visualizer Chrome Extension - Release 发布包

> **项目**: DAG Visualizer - 专业的工作流可视化工具  
> **作者**: xkcoding（Yangkai.Shen）  
> **GitHub**: https://github.com/xkcoding/dag-visualization

## 📦 版本发布

### 🚀 **v2.7.0 - 第二阶段完整版纯净版** (推荐)

**📁 文件**: `DAG-Visualizer-v2.7.0-20250731.zip`  
**📅 发布日期**: 2025年07月31日  
**📏 文件大小**: 156KB  
**🎯 推荐用户**: 所有用户

#### **✨ 主要特性**
- 🧠 **智能布局系统** - 自动连线优化，避免穿越问题
- 🎨 **Monaco Editor** - VS Code级别的JSON编辑体验
- 🎛️ **高级功能集** - 图片导出、颜色管理、节点创建
- 🔧 **用户体验优化** - 自定义确认对话框、品牌统一
- 📸 **多格式导出** - PNG/JPG/SVG高质量图片导出
- 🗜️ **纯净版** - 移除测试数据，体积减小，加载更快

#### **🏆 技术亮点**
- **自研智能布局算法** - 解决连线穿越的核心技术突破
- **专业级用户界面** - React + ReactFlow + Monaco Editor
- **完整的颜色管理** - 批量控制 + localStorage持久化
- **高质量图片导出** - 支持自定义尺寸和格式

---

### 📚 **v1.0.0 - 第一阶段基础版**

**📁 文件**: `DAG-Visualizer-v1.0.0-20250730.zip`  
**📅 发布日期**: 2025年07月30日  
**📏 文件大小**: 133KB  
**🎯 适合用户**: 基础功能需求、学习参考

#### **✨ 基础特性**
- 🎨 **基础可视化** - ReactFlow引擎的DAG渲染
- 📊 **数据输入支持** - JSON输入、文件上传、示例数据
- 🔧 **基础工具功能** - 导出配置、格式化、画布操作
- 📱 **响应式设计** - 适配不同屏幕尺寸

#### **📈 里程碑意义**
- **技术基础** - 为后续功能开发奠定坚实基础
- **架构验证** - Chrome Extension + React技术栈验证
- **用户验收** - 5/5星满意度的第一阶段成果

---

## 🔽 下载与安装

### **💡 版本选择建议**

| 用户类型 | 推荐版本 | 原因 |
|---------|---------|------|
| **一般用户** | v2.7.0 | 功能完整、体验优秀 |
| **企业用户** | v2.7.0 | 专业功能、高质量导出 |
| **开发学习** | v1.0.0 → v2.7.0 | 了解技术演进过程 |
| **功能测试** | v2.7.0 | 包含所有最新功能 |

### **🚀 安装步骤**

1. **下载对应版本的zip文件**
2. **解压到本地目录**
3. **打开Chrome浏览器**
4. **访问** `chrome://extensions/`
5. **开启"开发者模式"**
6. **点击"加载已解压的扩展程序"**
7. **选择解压后的文件夹**
8. **开始使用！**

### **📖 详细说明**

每个版本包都包含：
- ✅ **完整的Chrome扩展文件**
- ✅ **安装说明文档** (`CHROME_EXTENSION_INSTALL.md`)
- ✅ **版本发布说明** (`README-RELEASE.md`)
- ✅ **示例数据文件** (`dag-question-rewrite-rerank.json`)

## 📊 版本对比

| 功能特性 | v1.0.0 | v2.7.0 |
|---------|--------|--------|
| **基础可视化** | ✅ | ✅ |
| **JSON编辑器** | 基础 | Monaco Editor |
| **智能布局** | ❌ | ✅ 自研算法 |
| **节点创建** | ❌ | ✅ 右键创建 |
| **图片导出** | ❌ | ✅ PNG/JPG/SVG |
| **颜色管理** | ❌ | ✅ 批量控制 |
| **用户界面** | 基础 | ✅ 专业优化 |
| **性能优化** | 基础 | ✅ 大幅提升 |

## 🛠️ 技术规格

### **运行环境要求**
- **浏览器**: Chrome 88+ 或基于Chromium的浏览器
- **内存**: 最低 512MB 可用内存
- **分辨率**: 最低 1024x768 像素

### **技术架构**
- **前端**: React 18 + TypeScript 5.3 + ReactFlow 11
- **编辑器**: Monaco Editor (v2.7.0)
- **构建**: Vite 7.0 + ESLint
- **扩展**: Chrome Extension Manifest V3

## 🐛 问题与支持

### **常见问题**
1. **安装失败**: 确保开启了"开发者模式"
2. **功能异常**: 检查Chrome版本是否符合要求
3. **性能问题**: 关闭其他扩展程序测试

### **技术支持**
- **GitHub Issues**: https://github.com/xkcoding/dag-visualization/issues
- **项目主页**: https://github.com/xkcoding/dag-visualization
- **文档中心**: https://github.com/xkcoding/dag-visualization/tree/main/memory-bank

## 📈 更新计划

### **第三阶段开发 (规划中)**
- 🔄 **性能优化** - 大型DAG支持和Web Worker
- 📤 **导出功能完善** - 更多格式和批量处理
- 🧠 **ELKjs技术评估** - 布局引擎迁移
- 👤 **用户偏好系统** - 个性化设置

### **未来发布**
- **Chrome Web Store发布** - 官方商店上架
- **企业版功能** - 团队协作和高级分析
- **API集成** - 与其他工具系统集成

---

## 📄 许可与版权

**许可证**: MIT License  
**版权**: © 2025 xkcoding（Yangkai.Shen）  
**开源项目**: https://github.com/xkcoding/dag-visualization

---

<div align="center">

**🎉 感谢使用 DAG Visualizer！**

**⚡ 让工作流可视化更简单、更专业！**

[![GitHub](https://img.shields.io/badge/GitHub-xkcoding%2Fdag--visualization-blue)](https://github.com/xkcoding/dag-visualization)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/xkcoding/dag-visualization/blob/main/LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-orange.svg)](https://github.com/xkcoding/dag-visualization)

*🚀 专业的工作流可视化工具，让复杂的DAG变得简单直观*

</div>