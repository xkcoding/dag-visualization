# 🎨 创意阶段：DAG可视化浏览器插件

**项目**: DAG可视化浏览器插件  
**复杂度**: Level 3 (Intermediate Feature)  
**创意开始时间**: 轻量化技术验证完成后  
**技术基础**: 原生JavaScript + SVG已验证 ✅

---

## 📌 创意阶段总体概览

### 🎯 创意目标
基于已验证的轻量化技术栈，进行架构和UI/UX设计决策，确保最终产品的用户体验和技术实现的最佳结合。

### 🔍 创意范围
1. **技术架构决策**：浏览器插件 vs 油猴脚本（高优先级）
2. **UI/UX设计**：节点样式、颜色方案、交互模式（中优先级）  
3. **布局算法选择**：分层布局 vs 网格布局（低优先级）
4. **配置导出功能**：画布到配置转换设计（高优先级）

### 📊 设计约束
- **技术基础**: 原生JavaScript + SVG（已验证）
- **数据源**: dag-question-rewrite-rerank.json（29个节点）
- **目标用户**: 工作流配置开发人员
- **浏览器兼容性**: Chrome, Firefox, Safari
- **性能要求**: 轻量级、快速加载

---

## 📋 创意决策进展

### ✅ 完成的决策
- 技术栈选择：原生JavaScript + SVG
- 数据解析方案：JSON解析器（已验证）
- **架构决策**：油猴脚本优先部署 ✅
- **UI/UX设计**：极简工具面板 + 全屏画布 ✅
- **布局算法**：分层布局 (Hierarchical Layout) ✅
- **配置导出功能**：简化配置增强方案（input/output置空）✅

### 🎨 创意设计组件
✅ **所有四个核心创意决策已完成！**

---

## 🚀 创意阶段执行计划

### 第一步：技术架构决策（高优先级）
✅ **已完成** - 浏览器插件 vs 油猴脚本选择

### 第二步：UI/UX设计（中优先级）
✅ **已完成** - 节点样式、颜色方案、交互模式

### 第三步：布局算法选择（低优先级）
✅ **已完成** - 分层布局 vs 网格布局

### 第四步：配置导出功能（高优先级）
✅ **已完成** - 画布到配置转换设计

---

## 🎊 创意阶段完成总结

**所有四个核心创意决策已完成！** 项目已准备好进入实施阶段。

### 📋 创意成果汇总
1. **技术架构**：油猴脚本优先部署
2. **UI/UX设计**：极简工具面板 + 全屏画布，严格遵循样式指南
3. **布局算法**：分层布局算法，最适合DAG特性
4. **配置导出功能**：简化配置增强方案，input/output置空，专注DAG结构

### 🎯 下一阶段：IMPLEMENT
准备根据创意决策开始代码实现。

---

*创意阶段文档将随着每个决策的完成而更新*

---

# 📌 创意决策 #1：技术架构 - 部署方式选择

📌 **CREATIVE PHASE START**: 部署方式架构决策
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1️⃣ PROBLEM
**Description**: 确定DAG可视化工具的最佳部署方式
**Requirements**: 
- 易于安装和使用
- 支持跨浏览器
- 开发维护简单
- 用户体验流畅
- 支持文件上传/本地JSON读取

**Constraints**: 
- 必须支持原生JavaScript + SVG技术栈
- 需要访问本地文件系统或用户上传文件
- 目标用户为技术开发人员
- 开发资源有限（个人项目）

## 2️⃣ OPTIONS
**Option A**: 油猴脚本 (Tampermonkey) - 用户脚本管理器部署
**Option B**: 浏览器插件 (Chrome Extension) - 官方扩展商店分发  
**Option C**: 混合方案 - 同时支持油猴脚本和浏览器插件

## 3️⃣ ANALYSIS
| 评估标准 | 油猴脚本 | 浏览器插件 | 混合方案 |
|--------|---------|-----------|----------|
| 开发复杂度 | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 安装便利性 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 跨浏览器支持 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 文件访问能力 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 分发便利性 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| 维护成本 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| 权限管理 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**Key Insights**:
- 油猴脚本开发最简单，单文件即可，但文件访问受限
- 浏览器插件提供最佳的文件访问和权限管理，但开发复杂度高
- 混合方案覆盖面最广，但维护工作量加倍
- 目标用户为技术人员，对油猴脚本接受度较高

## 4️⃣ DECISION
**Selected**: Option A: 油猴脚本优先，后期考虑浏览器插件
**Rationale**: 
- 开发速度快，符合轻量级项目定位
- 技术用户对油猴脚本熟悉，安装门槛低
- 单文件分发，维护简单
- 可通过文件上传API解决文件访问限制
- 符合"先验证后完善"的开发策略

## 5️⃣ IMPLEMENTATION NOTES
- 使用 `@grant` 指令申请必要权限
- 实现文件上传界面替代直接文件系统访问
- 添加拖拽上传功能提升用户体验
- 设计简单的配置界面（注入到页面）
- 预留插件转换的架构设计（模块化代码）
- 考虑使用 `@match` 或 `@include` 指定运行页面

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 **CREATIVE PHASE END**: 部署方式决策完成 ✅

---

# 📌 创意决策 #2：UI/UX设计 - 视觉和交互设计

📌 **CREATIVE PHASE START**: UI/UX设计决策
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1️⃣ PROBLEM
**Description**: 设计DAG可视化工具的用户界面和交互体验
**Requirements**: 
- 严格遵循样式指南 (`memory-bank/style-guide.md`)
- 清晰显示29个节点和依赖关系
- 直观的节点类型区分和信息展示
- 流畅的交互体验（悬停、点击、拖拽）
- 易用的文件上传和配置界面

**Constraints**: 
- 基于SVG渲染，需要纯CSS样式
- 单页面应用，界面简洁
- 无障碍访问支持
- 响应式设计适配不同屏幕

## 2️⃣ OPTIONS
**Option A**: 极简工具面板 + 全屏画布 - 注重可视化纯度
**Option B**: 分屏布局 + 属性面板 - 提供详细信息展示
**Option C**: 模态工具箱 + 浮动控制 - 灵活的界面切换

## 3️⃣ ANALYSIS
| 评估标准 | 极简全屏 | 分屏布局 | 模态浮动 |
|--------|---------|----------|----------|
| 视觉专注度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 信息展示能力 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 开发复杂度 | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 用户操作效率 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 响应式适配 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 无障碍友好 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**Key Insights**:
- 极简全屏最适合可视化工具，减少干扰，符合项目定位
- 分屏布局信息展示最全面，但增加复杂度
- 模态浮动灵活性高但开发复杂，可能造成交互混乱
- 目标用户为技术人员，优先考虑实用性而非复杂功能

## 4️⃣ DECISION
**Selected**: Option A: 极简工具面板 + 全屏画布
**Rationale**: 
- 最符合轻量级项目定位和开发资源约束
- 让用户专注于DAG结构分析，减少界面干扰
- 开发实现最简单，符合油猴脚本单文件特性
- 易于实现响应式设计和无障碍访问
- 符合样式指南的简洁设计原则

## 5️⃣ IMPLEMENTATION NOTES

### 🎨 界面布局设计
- **顶部工具栏**：固定高度60px，包含文件上传、重置、缩放控制
- **主画布区域**：占据剩余全部空间，SVG全屏渲染
- **状态提示**：浮动在右上角，显示加载状态和错误信息
- **节点信息提示**：悬停时显示浮动tooltip，点击高亮路径

### 🔲 节点样式规范（严格遵循样式指南）
- **尺寸**：最小宽度120px，内边距12px，圆角8px
- **颜色方案**：
  - PROMPT_BUILD: `#52c41a` 绿色系
  - CALL_LLM: `#faad14` 金黄系  
  - HTTP_REQUEST: `#ff4d4f` 红色系
  - CODE_EXEC: `#722ed1` 紫色系
- **字体**：标签12px粗体，ID 10px正常
- **阴影**：`0 2px 8px [对应颜色透明度0.3]`

### 🖱️ 交互状态设计
- **悬停状态**：颜色加深10%，阴影增强至4px
- **选中状态**：增加蓝色边框 `#1890ff`，宽度3px
- **路径高亮**：选中节点时，相关依赖路径加粗显示
- **拖拽反馈**：拖拽时节点半透明，实时更新位置

### 📱 响应式设计
- **桌面端**：全功能界面，支持所有交互
- **平板端**：简化工具栏，触摸友好的按钮尺寸
- **移动端**：仅展示模式，关闭拖拽功能

### ♿ 无障碍访问
- 所有交互元素支持键盘导航
- 提供屏幕阅读器友好的节点标签
- 颜色之外的视觉区分（形状、图标）
- 高对比度模式支持

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 **CREATIVE PHASE END**: UI/UX设计决策完成 ✅

---

# 📌 创意决策 #3：布局算法 - 节点自动排列策略

📌 **CREATIVE PHASE START**: 布局算法决策
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1️⃣ PROBLEM
**Description**: 选择最适合DAG可视化的节点自动布局算法
**Requirements**: 
- 清晰展示29个节点的层次关系和依赖关系
- 避免节点重叠和连线交叉
- 算法简单高效，适合JavaScript实现
- 支持手动调整节点位置
- 布局结果美观且易于理解

**Constraints**: 
- 基于SVG坐标系统
- 需要考虑节点尺寸差异
- 必须处理复杂的依赖关系网络
- 算法执行时间 < 500ms（用户体验要求）

## 2️⃣ OPTIONS
**Option A**: 分层布局 (Hierarchical Layout) - 按依赖层级垂直排列
**Option B**: 网格布局 (Grid Layout) - 规则网格中自动排列
**Option C**: 力导向布局 (Force-Directed) - 物理模拟自然排列

## 3️⃣ ANALYSIS
| 评估标准 | 分层布局 | 网格布局 | 力导向布局 |
|--------|---------|----------|-----------|
| 依赖关系清晰度 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| 算法复杂度 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 执行性能 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 视觉美观度 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 空间利用率 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 实现难度 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| DAG特性适配 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

**Key Insights**:
- 分层布局最符合DAG的有向无环特性，依赖关系最清晰
- 网格布局实现最简单，但无法体现依赖层次关系
- 力导向布局视觉效果最佳，但算法复杂度高且结果不稳定
- 轻量化项目需要平衡功能性和实现复杂度

## 4️⃣ DECISION
**Selected**: Option A: 分层布局 (Hierarchical Layout)
**Rationale**: 
- 最适合DAG的有向依赖特性，层次清晰
- 算法相对简单，性能可控
- 用户易于理解工作流的执行顺序
- 可以基于已验证的代码进行优化
- 符合技术人员的思维习惯（流程图式布局）

## 5️⃣ IMPLEMENTATION NOTES

### 🔄 分层算法设计
- **第一步**：拓扑排序确定节点层级（深度优先搜索）
- **第二步**：计算每层节点数量和最大宽度
- **第三步**：垂直分层，水平居中对齐
- **第四步**：层间距优化，避免连线重叠

### 📏 布局参数配置
- **层间距**：垂直间距150px，确保连线清晰
- **节点间距**：同层水平间距160px，避免重叠
- **画布边距**：四周预留40px边距
- **起始位置**：顶层居中，向下分层展开

### 🎯 布局优化策略
- **依赖计算**：统计每个节点的入度，确定层级
- **宽度均衡**：同层节点数量过多时自动调整间距
- **连线优化**：使用贝塞尔曲线，减少交叉
- **手动调整**：支持拖拽后保持相对位置关系

### 🔧 算法实现要点
```javascript
// 伪代码示例
function hierarchicalLayout(nodes, edges) {
    // 1. 拓扑排序分层
    const layers = topologicalSort(nodes, edges);
    
    // 2. 计算层布局
    layers.forEach((layer, level) => {
        const yPosition = level * LAYER_SPACING;
        layer.forEach((node, index) => {
            node.x = calculateXPosition(index, layer.length);
            node.y = yPosition;
        });
    });
    
    return { nodes, calculatedEdges };
}
```

### ⚡ 性能优化
- 预计算节点位置，避免实时计算
- 使用简化的连线绘制减少SVG复杂度
- 大数据集时采用视窗裁剪技术
- 布局结果缓存，避免重复计算

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 **CREATIVE PHASE END**: 布局算法决策完成 ✅ 

---

# 📌 创意决策 #4：配置导出功能 - 画布到配置转换

📌 **CREATIVE PHASE START**: 配置导出功能决策
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1️⃣ PROBLEM
**Description**: 设计画布状态到JSON配置的导出转换功能
**Requirements**: 
- 支持画布状态（节点位置、布局）导出为JSON配置
- 保持原始DAG逻辑结构不变
- 支持用户手动调整后的节点位置保存
- 提供多种导出格式选项
- 确保导出配置可重新导入渲染

**Constraints**: 
- 必须保持原始JSON的数据完整性
- 仅扩展位置和布局信息，不修改核心逻辑
- 导出功能要简单易用
- 支持油猴脚本环境的文件下载

## 2️⃣ OPTIONS
**Option A**: 原始配置增强 - 在原JSON基础上添加位置信息
**Option B**: 独立布局文件 - 分离生成配置文件和布局文件
**Option C**: 自定义格式 - 创建专用的可视化配置格式

## 3️⃣ ANALYSIS
| 评估标准 | 原始增强 | 独立布局 | 自定义格式 |
|--------|---------|----------|-----------|
| 数据完整性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 兼容性 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 实现简单度 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| 文件管理便利性 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| 重新导入便利性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 版本控制友好 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**Key Insights**:
- 原始增强保持单文件简洁，但可能污染原始配置
- 独立布局文件最干净，但增加文件管理复杂度
- 自定义格式灵活性最高，但兼容性最差
- 油猴脚本环境下，单文件操作更简便

## 4️⃣ DECISION
**Selected**: Option A: 原始配置增强 - 添加可选的位置信息字段
**Rationale**: 
- 保持单文件便利性，符合轻量级工具定位
- 扩展字段可选，不影响原始数据使用
- 重新导入时自动识别布局信息
- 实现最简单，用户体验最佳
- 符合JSON标准，工具兼容性好

## 5️⃣ IMPLEMENTATION NOTES

### 📄 导出数据格式设计
```javascript
// 增强后的JSON格式示例（简化版）
{
  "@type": "com.xiaohongshu.data.aimi.workflow.nodes.LLMNode",
  "taskId": "MAIN_CALL_LLM",
  "taskType": "CALL_LLM",
  "dependencies": ["START_PROMPT_BUILD"],
  
  // 🚫 input/output 参数置空 - 专注DAG结构
  "input": [],
  "output": [],
  
  // 新增可选的可视化信息
  "_visualization": {
    "position": { "x": 320, "y": 150 },
    "layout": "hierarchical",
    "userModified": true,
    "lastUpdated": "2024-01-20T10:30:00Z"
  }
}
```

### 🔧 导出功能实现
- **触发方式**：工具栏"导出配置"按钮
- **数据收集**：遍历所有节点，收集当前位置信息
- **数据简化**：将所有节点的 `input` 和 `output` 字段置空 `[]`
- **格式处理**：在简化JSON基础上添加 `_visualization` 字段
- **文件下载**：使用 Blob API 生成下载链接
- **文件命名**：`dag-config-exported-[timestamp].json`

### 🔄 导入识别机制
- **自动检测**：导入时检查是否包含 `_visualization` 字段
- **位置恢复**：有位置信息时直接使用，无则应用默认布局算法
- **向下兼容**：完全兼容原始JSON格式文件

### 📋 导出选项设计
- **简化导出**：input/output置空 + 位置信息的DAG结构配置
- **净化导出**：移除 `_visualization` 字段的纯DAG结构配置  
- **布局快照**：仅导出位置和布局信息（可选功能）

### 🎯 数据简化策略
- **保留字段**：`@type`、`taskId`、`taskType`、`dependencies`
- **置空字段**：`input` → `[]`、`output` → `[]`
- **移除字段**：其他复杂业务逻辑字段（可选）
- **新增字段**：`_visualization` 可视化信息

### 🎯 用户体验优化
- **导出前预览**：显示将要导出的信息摘要（突出简化内容）
- **格式选择**：支持美化JSON和压缩JSON
- **导出状态反馈**：成功/失败提示和进度显示
- **批量操作**：支持多种格式同时导出
- **简化提示**：明确告知用户input/output已被简化，专注DAG结构

### ✅ 简化策略优势
- **文件体积减小**：去除冗余的input/output数据，导出文件更轻量
- **关注核心**：突出DAG工作流结构，符合可视化工具定位
- **隐私保护**：避免导出敏感的业务逻辑和数据配置
- **加载性能**：简化配置重新导入时解析更快速
- **版本控制友好**：去除变动频繁的业务参数，Git diff更清晰

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 **CREATIVE PHASE END**: 配置导出功能决策完成 ✅ 