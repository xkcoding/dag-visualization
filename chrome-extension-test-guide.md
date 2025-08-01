# 🧪 Chrome Extension 完整测试指南

## 📱 Chrome浏览器加载测试

### 步骤一：启用开发者模式
1. 打开Chrome浏览器
2. 在地址栏输入: `chrome://extensions/`
3. 在页面右上角启用 **"开发者模式"** 开关

### 步骤二：加载扩展程序
1. 点击 **"加载已解压的扩展程序"** 按钮
2. 导航到项目目录: `/Users/yangkai.shen/code/dag_visualization/dag-visualizer-extension/dist/`
3. 选择 `dist` 目录并确认
4. 确认扩展程序出现在扩展程序列表中

### 步骤三：验证扩展程序信息
- **名称**: DAG可视化器
- **版本**: 1.0.0  
- **描述**: 用于可视化有向无环图(DAG)的专业工具
- **图标**: 蓝色圆角矩形，内含白色DAG节点图案
- **状态**: 已启用

---

## 🎯 功能测试清单

### ✅ 基础功能测试

#### 1. 扩展程序启动测试
- [x] 在Chrome工具栏中找到DAG可视化器图标
- [x] 点击图标，验证是否打开新的独立页面
- [x] 确认页面标题显示为 "DAG可视化器"
- [x] 验证页面地址格式: `chrome-extension://[extension-id]/index.html`

#### 2. 页面布局测试  
- [x] **顶部工具栏**: 显示4个操作按钮
  - [x] "加载本地文件" 按钮
  - [x] "加载示例数据" 按钮  
  - [x] "导出配置" 按钮
  - [x] "清空画布" 按钮
- [x] **左侧输入区**: 占屏幕宽度30%
  - [x] JSON输入文本框正常显示
  - [x] "粘贴" 和 "文件" 按钮正常显示
  - [x] 输入区域标题显示 "JSON输入区域"
- [x] **右侧可视化区**: 占屏幕宽度70%  
  - [x] ReactFlow画布正常加载
  - [x] 控制面板(缩放、适应画布)正常显示
  - [x] 小地图(MiniMap)正常显示
  - [x] 背景网格正常显示
- [x] **底部状态栏**: 显示当前状态信息

### ✅ 交互功能测试

#### 3. JSON输入功能测试
- [x] **手动输入测试**
  - [x] 在文本框中输入有效JSON，验证实时验证
  - [x] 输入无效JSON，验证错误提示显示
  - [x] 清空输入，验证错误信息清除

- [x] **粘贴功能测试**  
  - [x] 复制示例JSON到剪贴板
  - [x] 点击"粘贴"按钮，验证内容正确粘贴
  - [x] 验证粘贴后自动进行JSON验证

- [x] **文件上传功能测试**
  - [x] 点击"文件"按钮，验证文件选择器打开
  - [x] 选择 `dag-question-rewrite-rerank.json` 文件
  - [x] 验证文件内容正确加载到输入框

#### 4. 可视化功能测试
- [x] **空状态显示**
  - [x] 确认空画布显示提示信息
  - [x] 验证"等待JSON数据输入"消息正确显示

- [ ] **数据渲染测试** (使用示例数据)
  - [ ] 输入有效的DAG JSON数据
  - [ ] 验证节点正确渲染为圆形
  - [ ] 验证连接线正确显示节点间关系
  - [ ] 验证节点标签正确显示

- [ ] **ReactFlow控件测试**
  - [ ] 验证鼠标拖拽平移画布功能
  - [ ] 验证鼠标滚轮缩放功能  
  - [ ] 验证"适应画布"按钮功能
  - [ ] 验证"居中"按钮功能
  - [ ] 验证小地图导航功能

#### 5. 工具栏功能测试
- [ ] **"加载示例数据"按钮**
  - [ ] 点击按钮验证示例数据加载
  - [ ] 确认可视化区域正确渲染示例DAG

- [x] **"清空画布"按钮**  
  - [x] 点击按钮验证输入框清空
  - [x] 确认可视化区域恢复空状态
  - [x] 验证状态栏信息重置

- [ ] **"导出配置"和"加载本地文件"** (功能占位)
  - [ ] 确认按钮可点击但显示开发中提示

#### 6. 状态栏功能测试
- [ ] **状态信息显示**
  - [ ] 验证节点数量统计正确
  - [ ] 验证连接数量统计正确  
  - [x] 验证最后更新时间显示
  - [x] 验证错误信息正确显示

---

## 🔧 开发模式测试

### 热重载测试
1. 确保 `npm run dev` 在运行
2. 访问 `http://localhost:5173`  
3. 修改源代码文件，验证页面自动刷新
4. 检查浏览器控制台无错误信息

### React DevTools测试
1. 安装React Developer Tools扩展
2. 打开开发者工具，切换到React标签
3. 验证组件树正确显示:
   - App → ErrorBoundary → [Toolbar, JSONInputArea, DAGVisualizer, StatusBar]
4. 验证Context状态正确管理

---

## 📊 性能测试

### 加载性能
- [ ] 扩展程序图标点击到页面打开 < 1秒
- [ ] 大型JSON文件(1000+节点)处理时间 < 3秒
- [ ] 画布缩放和平移操作流畅无卡顿

### 内存使用  
- [ ] 打开开发者工具Memory标签
- [ ] 验证内存使用稳定，无明显泄漏
- [ ] 重复加载数据无异常内存增长

---

## 🐛 错误处理测试

### 边界情况测试
- [ ] **空JSON输入**: 显示友好提示
- [ ] **格式错误JSON**: 显示具体错误位置  
- [ ] **超大文件上传**: 显示文件大小限制提示
- [ ] **网络断开**: 离线状态正常工作
- [ ] **浏览器窗口调整**: 布局响应式适配

### 恢复测试
- [ ] 刷新页面后状态保持
- [ ] 重新打开扩展程序后历史记录保留
- [ ] 错误状态下可通过清空画布恢复

---

## ✨ 用户体验验证

### 专业工具感
- [ ] 界面设计符合Fe-Helper风格
- [ ] 配色方案专业统一
- [ ] 字体大小和间距合理
- [ ] 按钮和控件响应及时

### 易用性
- [ ] 功能布局符合直觉
- [ ] 操作流程清晰明确  
- [ ] 错误提示信息有帮助
- [ ] 快捷键支持(如Ctrl+V粘贴)

---

## 📋 测试数据

### 示例JSON文件
```bash
# 测试文件位置
dag-visualizer-extension/public/dag-question-rewrite-rerank.json

# 测试数据特征
- 节点数量: ~20个
- 连接数量: ~30个  
- 层级深度: 4层
- 复杂度: 中等
```

### 边界测试数据
- **最小数据**: 单个节点，无连接
- **中等数据**: 50个节点，100个连接
- **大型数据**: 500+节点，1000+连接

---

**📝 测试完成标准**: 所有 ✅ 项目全部通过  
**📅 预期测试时间**: 15-20分钟  
**🎯 测试目标**: 验证Chrome Extension基础功能完整可用 