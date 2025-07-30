# 🔧 Tampermonkey启用按钮无响应 - 诊断指南

## 🎯 问题现象
在Tampermonkey管理界面中，点击脚本的"启用"按钮没有反应，开关保持灰色状态。

## 📋 逐步诊断流程

### 第一步：测试最小版本 🧪

**使用文件：** `dag-visualizer-minimal.user.js`

1. 删除现有的DAG可视化器脚本
2. 安装最小版本脚本（只有10行代码）
3. 查看是否能正常启用

**预期结果：**
- ✅ 能正常启用 → 说明是原脚本太大或有格式问题
- ❌ 仍无法启用 → Tampermonkey或浏览器问题

### 第二步：检查Tampermonkey状态 🔍

#### 检查扩展状态：
1. 浏览器地址栏输入：`chrome://extensions/` (Chrome) 或 `about:addons` (Firefox)
2. 找到Tampermonkey扩展
3. 确保：
   - ✅ 扩展已启用
   - ✅ 有"访问所有网站数据"权限
   - ✅ 允许在隐身模式运行（可选）

#### 检查Tampermonkey设置：
1. 点击Tampermonkey图标 → "管理面板"
2. 点击"设置"选项卡
3. 检查关键设置：
   - **配置模式**: 建议选择"初学者"或"高级"
   - **脚本更新**: 可以关闭避免冲突
   - **Chrome模式**: 如果是Chrome浏览器，尝试切换此选项

### 第三步：清理和重新安装 🧹

#### 完全清理：
1. 在管理面板中删除所有DAG相关脚本
2. 关闭所有浏览器窗口
3. 重新打开浏览器
4. 先安装最小版本测试

#### 重新安装步骤：
1. 复制 `dag-visualizer-minimal.user.js` 的全部内容
2. Tampermonkey → "创建新脚本"
3. 删除默认内容，粘贴新内容
4. Ctrl+S 保存
5. 查看是否能启用

### 第四步：浏览器相关检查 🌐

#### Chrome浏览器：
```bash
# 检查Chrome版本
chrome://version/

# 重置Tampermonkey
chrome://extensions/ → Tampermonkey → 详细信息 → 扩展程序选项 → 重置
```

#### Firefox浏览器：
```bash
# 检查Firefox版本
about:support

# 清除扩展数据
about:addons → Tampermonkey → 首选项 → 重置
```

### 第五步：使用简化版本 ⚡

**使用文件：** `dag-visualizer-fixed.user.js`

如果最小版本能启用，尝试简化版本：
- 保留核心功能
- 去除复杂特性
- 优化脚本大小

## 🔍 具体错误排查

### 错误A：脚本头格式问题
**症状**: 安装后立即变灰色
**解决**: 检查脚本头是否完整：
```javascript
// ==UserScript==
// @name         脚本名称
// @version      1.0
// @description  描述
// @match        *://*/*
// @grant        none
// ==/UserScript==
```

### 错误B：语法错误
**症状**: 安装时有警告
**解决**: 在浏览器控制台测试脚本语法：
```javascript
// 在F12控制台中粘贴脚本内容测试
```

### 错误C：权限冲突
**症状**: 某些网站无法启用
**解决**: 修改@match规则：
```javascript
// 更宽泛的匹配
// @match        *://*/*

// 或者指定具体域名
// @match        https://example.com/*
```

### 错误D：脚本过大
**症状**: 大脚本无法启用，小脚本正常
**解决**: 
1. 使用分块加载
2. 压缩脚本内容
3. 移除调试代码

## 🚀 推荐解决方案

### 方案1：渐进式测试 📈
1. **最小版本** → 验证基础功能
2. **简化版本** → 验证核心特性  
3. **完整版本** → 渐进式功能添加

### 方案2：重置Tampermonkey 🔄
1. 导出现有脚本备份
2. 完全重置Tampermonkey
3. 重新安装测试

### 方案3：更换用户脚本管理器 🔀
如果Tampermonkey问题持续：
- **Chrome**: Violentmonkey
- **Firefox**: Greasemonkey
- **Edge**: Tampermonkey for Edge

## 📞 最终解决步骤

### 立即测试清单：
- [ ] 安装 `dag-visualizer-minimal.user.js`
- [ ] 检查能否启用（开关变绿）
- [ ] 打开任意网页，查看控制台是否有日志
- [ ] 如果成功，再尝试 `dag-visualizer-fixed.user.js`

### 成功标志：
```
✅ 脚本在管理面板显示为"已启用"
✅ 控制台显示：最小版DAG可视化器已加载
✅ 脚本开关为绿色状态
```

### 如果全部失败：
1. **更换浏览器测试** (Chrome → Firefox)
2. **更换脚本管理器** (Tampermonkey → Violentmonkey)  
3. **检查系统权限** (防火墙、杀毒软件)
4. **使用独立HTML版本** (不依赖用户脚本管理器)

---

**🎯 快速测试命令：**
```javascript
// 在控制台中测试脚本是否加载
console.log('测试开始');
```

现在请从最小版本开始测试，逐步排查问题！ 