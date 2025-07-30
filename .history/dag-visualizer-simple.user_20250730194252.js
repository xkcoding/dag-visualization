// ==UserScript==
// @name         DAG可视化器-测试版
// @namespace    dag-visualizer
// @version      1.0
// @description  DAG工作流可视化工具-简化测试版
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    console.log('🚀 DAG可视化器简化版已加载！按 Ctrl+Alt+D 测试启动');
    
    // 简化的测试启动函数
    function testLaunch() {
        // 检查是否已存在
        if (document.getElementById('test-dag-container')) {
            console.log('⚠️ 测试界面已存在');
            return;
        }
        
        // 创建测试界面
        const container = document.createElement('div');
        container.id = 'test-dag-container';
        container.style.cssText = `
            position: fixed;
            top: 50px;
            left: 50px;
            width: 400px;
            height: 300px;
            background: #1890ff;
            color: white;
            border-radius: 8px;
            padding: 20px;
            z-index: 999999;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        container.innerHTML = `
            <h2>🔗 DAG可视化器测试</h2>
            <p>✅ 油猴脚本启动成功！</p>
            <p>📍 位置：简化测试版本</p>
            <p>⌚ 时间：${new Date().toLocaleTimeString()}</p>
            <br>
            <button id="test-close-btn" style="
                background: white;
                color: #1890ff;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            ">关闭测试</button>
            <button id="test-full-btn" style="
                background: #52c41a;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                margin-left: 10px;
            ">启动完整版</button>
        `;
        
        // 添加到页面
        document.body.appendChild(container);
        
        // 绑定关闭事件
        document.getElementById('test-close-btn').addEventListener('click', function() {
            container.remove();
            console.log('🗑️ 测试界面已关闭');
        });
        
        // 绑定完整版启动事件
        document.getElementById('test-full-btn').addEventListener('click', function() {
            container.remove();
            console.log('🚀 启动完整版可视化器...');
            
            // 尝试启动完整版
            if (typeof DAGVisualizer !== 'undefined') {
                new DAGVisualizer();
            } else {
                alert('完整版脚本未加载，请安装完整的 dag-visualizer.user.js');
            }
        });
        
        console.log('✅ 测试界面已显示');
    }
    
    // 添加简化的启动快捷键
    document.addEventListener('keydown', function(event) {
        // Ctrl+Alt+D 启动测试版
        if (event.ctrlKey && event.altKey && event.key === 'D') {
            event.preventDefault();
            console.log('🎯 检测到测试快捷键：Ctrl+Alt+D');
            testLaunch();
        }
        
        // Ctrl+Shift+D 提示完整版
        if (event.ctrlKey && event.shiftKey && event.key === 'D') {
            event.preventDefault();
            console.log('🎯 检测到完整版快捷键：Ctrl+Shift+D');
            
            if (typeof DAGVisualizer !== 'undefined') {
                console.log('✅ 启动完整版可视化器');
                new DAGVisualizer();
            } else {
                console.log('⚠️ 完整版未加载，显示测试版');
                testLaunch();
            }
        }
    });
    
    // 页面加载完成后的提示
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('📄 页面加载完成，DAG可视化器测试版就绪');
        });
    } else {
        console.log('📄 DAG可视化器测试版就绪');
    }
    
    // 在控制台显示使用提示
    setTimeout(function() {
        console.log(`
🔗 DAG可视化器 - 简化测试版

📖 测试方法：
• 按 Ctrl+Alt+D 启动测试界面
• 按 Ctrl+Shift+D 尝试启动完整版
• 检查控制台是否有错误信息

✨ 如果看到蓝色测试界面，说明油猴脚本工作正常！
        `);
    }, 1000);
    
})(); 