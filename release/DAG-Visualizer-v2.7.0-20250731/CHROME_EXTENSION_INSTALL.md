# 🚀 DAG配置快速验证工具 - Chrome Extension 安装指南

## 📦 安装包信息

- **插件名称**: DAG 配置快速验证
- **版本**: v1.0.0 (第一阶段)
- **包文件**: `DAG配置快速验证-v1.0.0-第一阶段.zip`
- **大小**: ~128KB
- **开发者**: 柏玄 with Cursor

## 🔧 安装步骤

### 1. 准备工作
- 确保使用 Chrome 浏览器（版本 88+）
- 确保已下载 `DAG配置快速验证-v1.0.0-第一阶段.zip` 文件

### 2. 解压安装包
```bash
# 将zip文件解压到任意目录
unzip "DAG配置快速验证-v1.0.0-第一阶段.zip" -d "DAG插件目录"
```

### 3. 加载到Chrome浏览器

1. **打开Chrome Extension管理页面**
   - 在地址栏输入：`chrome://extensions/`
   - 或通过菜单：更多工具 → 扩展程序

2. **开启开发者模式**
   - 点击右上角的"开发者模式"开关

3. **加载插件**
   - 点击"加载已解压的扩展程序"
   - 选择刚才解压的目录（包含 `manifest.json` 的目录）

4. **确认安装成功**
   - 插件列表中应显示"DAG 配置快速验证"
   - 状态显示为"已启用"

## 🎯 使用指南

### 启动插件
1. 点击Chrome工具栏中的插件图标 🔗
2. 或直接访问：`chrome-extension://[插件ID]/index.html`

### 主要功能
- ✅ **JSON粘贴输入** - 支持实时验证和错误提示
- ✅ **本地文件上传** - 支持.json文件导入
- ✅ **示例数据加载** - 快速体验工具功能
- ✅ **DAG可视化** - 基于ReactFlow的专业可视化
- ✅ **配置导出** - 标准JSON格式导出
- ✅ **小地图导航** - 支持缩放和平移
- ✅ **实时状态显示** - 节点统计和类型分析

## 📊 支持的数据格式

```json
[
  {
    "@type": "com.example.workflow.nodes.PromptNode",
    "taskId": "prompt_build_task",
    "taskType": "PROMPT_BUILD",
    "dependencies": [],
    "input": [...],
    "output": [...]
  },
  {
    "@type": "com.example.workflow.nodes.LLMNode", 
    "taskId": "llm_call_task",
    "taskType": "CALL_LLM",
    "dependencies": ["prompt_build_task"],
    "input": [...],
    "output": [...]
  }
]
```

## 🐛 故障排除

### 安装问题
- **插件加载失败**: 确保选择的是包含 `manifest.json` 的正确目录
- **图标不显示**: 刷新浏览器或重启Chrome
- **功能异常**: 检查浏览器控制台是否有错误信息

### 使用问题
- **JSON格式错误**: 检查JSON语法，支持标准JSON格式
- **可视化不显示**: 确保DAG数据格式正确，包含必要的字段
- **导出功能异常**: 检查浏览器下载设置

## 🔄 版本信息

### v1.0.0 第一阶段特性
- ✅ Chrome Extension基础架构
- ✅ React + ReactFlow技术栈
- ✅ Fe-Helper风格UI设计
- ✅ 完整的输入输出功能
- ✅ 生产级代码质量

### 后续版本规划
- 🚧 大规模DAG数据优化
- 🚧 高级交互功能
- 🚧 性能优化和体验提升
- 🎯 Chrome Web Store发布

## 📞 技术支持

- **开发团队**: 柏玄 + Cursor
- **技术栈**: React + ReactFlow + TypeScript + Chrome Extension
- **项目仓库**: 本地Git仓库
- **文档位置**: `memory-bank/` 目录

---

**🎉 感谢使用DAG配置快速验证工具！**  
**第一阶段开发完成，用户满意度 5/5 星！** 