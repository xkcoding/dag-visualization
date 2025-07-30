# 🔗 DAG可视化器 - 安装和故障排除指南

## 📦 安装步骤

### 1️⃣ 安装Tampermonkey扩展

**Chrome浏览器：**
1. 访问 [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
2. 点击"添加至Chrome"
3. 确认安装

**Firefox浏览器：**
1. 访问 [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
2. 点击"添加到Firefox"
3. 确认安装

**Edge浏览器：**
1. 访问 [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
2. 点击"获取"
3. 确认安装

### 2️⃣ 安装DAG可视化器脚本

**方法一：直接安装**
1. 打开 `dag-visualizer.user.js` 文件
2. 全选内容并复制 (Ctrl+A, Ctrl+C)
3. 点击浏览器工具栏的Tampermonkey图标
4. 选择"创建新脚本"
5. 删除默认内容，粘贴复制的脚本
6. 按 Ctrl+S 保存

**方法二：拖拽安装**
1. 打开浏览器
2. 直接拖拽 `dag-visualizer.user.js` 文件到浏览器窗口
3. Tampermonkey会自动识别并提示安装
4. 点击"安装"

## 🔧 故障排除

### ❌ 问题1：油猴脚本无法启用

**可能原因：**
- 浏览器权限限制
- 脚本格式错误
- Tampermonkey配置问题

**解决方案：**

#### 解决方案A：检查脚本状态
1. 点击Tampermonkey图标
2. 选择"管理面板"
3. 查看"DAG工作流可视化器"脚本状态
4. 确保开关是"已启用"状态（绿色）

#### 解决方案B：重新安装脚本
1. 在管理面板中删除现有脚本
2. 重新按照安装步骤操作
3. 确保复制完整的脚本内容

#### 解决方案C：检查浏览器权限
1. 右键点击Tampermonkey图标
2. 选择"选项"
3. 在"安全"选项卡中，确保权限设置正确
4. 重启浏览器

#### 解决方案D：使用简化版本
如果上述方法都无效，可以使用这个简化的脚本头：

```javascript
// ==UserScript==
// @name         DAG可视化器
// @namespace    dag-visualizer
// @version      1.0
// @description  DAG工作流可视化工具
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==
```

### ❌ 问题2：快捷键Ctrl+Shift+D无响应

**解决方案：**

#### 方案A：检查页面加载
1. 确保页面完全加载
2. 打开F12开发者工具
3. 查看控制台是否有脚本加载信息

#### 方案B：手动启动
```javascript
// 在控制台中输入：
new DAGVisualizer()
```

#### 方案C：检查键盘冲突
1. 尝试其他页面
2. 检查是否有其他扩展占用相同快捷键
3. 临时禁用其他扩展测试

### ❌ 问题3：脚本运行但界面不显示

**解决方案：**

#### 检查CSS冲突
1. 打开F12开发者工具
2. 检查是否有CSS样式冲突
3. 查看控制台错误信息

#### 检查DOM注入
```javascript
// 在控制台检查容器是否存在：
document.getElementById('dag-visualizer-container')
```

### ❌ 问题4：无法上传JSON文件

**解决方案：**
1. 确保文件是有效的JSON格式
2. 检查文件大小（建议<10MB）
3. 尝试简单的测试JSON：

```json
[
  {
    "@type": "test",
    "taskId": "test1",
    "taskType": "PROMPT_BUILD",
    "dependencies": []
  }
]
```

## ✅ 验证安装成功

### 检查列表：
- [ ] Tampermonkey扩展已安装并启用
- [ ] DAG可视化器脚本已安装并启用
- [ ] 在任意网页按Ctrl+Shift+D能启动界面
- [ ] 能够上传JSON文件并显示节点
- [ ] 节点点击和交互功能正常

### 成功标志：
1. 控制台显示欢迎信息：
```
🚀 DAG工作流可视化器已加载！
```

2. 快捷键启动后显示蓝色界面

3. 工具栏显示版本号 "v1.0.0"

## 🆘 获取帮助

如果问题仍然存在，请尝试：

1. **重启浏览器** - 最简单有效的方法
2. **检查浏览器版本** - 确保使用现代浏览器
3. **禁用其他扩展** - 排除冲突可能
4. **使用隐身模式** - 排除缓存问题

## 📱 浏览器兼容性

| 浏览器 | 支持状态 | 注意事项 |
|--------|----------|----------|
| Chrome | ✅ 完全支持 | 推荐使用 |
| Firefox | ✅ 完全支持 | 需要允许脚本权限 |
| Edge | ✅ 完全支持 | 需要手动启用扩展 |
| Safari | ⚠️ 部分支持 | 需要额外配置 |

## 🔄 更新脚本

当需要更新脚本时：
1. 删除旧版本脚本
2. 安装新版本
3. 刷新页面测试

---

**🎯 快速测试：**
打开 `test-demo.html` 页面，按 `Ctrl+Shift+D`，如果看到蓝色界面出现，说明安装成功！ 