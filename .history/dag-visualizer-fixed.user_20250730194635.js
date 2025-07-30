// ==UserScript==
// @name         DAG工作流可视化器
// @version      1.0.0
// @description  DAG工作流可视化工具
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // === 常量配置 ===
    const CONFIG = {
        CONTAINER_ID: 'dag-visualizer-container',
        APP_VERSION: '1.0.0'
    };

    // === 核心DAG可视化类 ===
    class DAGVisualizer {
        constructor() {
            this.nodes = [];
            this.edges = [];
            this.container = null;
            console.log('🚀 DAG工作流可视化器初始化');
            this.init();
        }

        init() {
            if (this.checkExisting()) return;
            this.createInterface();
            console.log('✅ DAG可视化器就绪');
        }

        checkExisting() {
            const existing = document.getElementById(CONFIG.CONTAINER_ID);
            if (existing) {
                console.log('⚠️ DAG可视化器已存在');
                return true;
            }
            return false;
        }

        createInterface() {
            this.container = document.createElement('div');
            this.container.id = CONFIG.CONTAINER_ID;
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                width: 300px;
                height: 200px;
                background: #1890ff;
                color: white;
                border-radius: 8px;
                padding: 20px;
                z-index: 999999;
                font-family: Arial, sans-serif;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;

            this.container.innerHTML = `
                <h3>🔗 DAG可视化器</h3>
                <p>版本: ${CONFIG.APP_VERSION}</p>
                <p>状态: ✅ 运行正常</p>
                <p>时间: ${new Date().toLocaleTimeString()}</p>
                <button id="dag-close" style="
                    background: white;
                    color: #1890ff;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 10px;
                ">关闭</button>
            `;

            document.body.appendChild(this.container);

            // 绑定关闭事件
            document.getElementById('dag-close').addEventListener('click', () => {
                this.close();
            });
        }

        close() {
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
                console.log('👋 DAG可视化器已关闭');
            }
        }
    }

    // === 快捷键启动 ===
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.shiftKey && event.key === 'D') {
            event.preventDefault();
            console.log('🎯 检测到快捷键 Ctrl+Shift+D');
            new DAGVisualizer();
        }
    });

    // === 初始化提示 ===
    console.log(`
🚀 DAG工作流可视化器已加载！

📖 使用方法：
• 快捷键：Ctrl+Shift+D 启动界面
• 控制台：new DAGVisualizer()

✨ 版本：v${CONFIG.APP_VERSION}
🔧 状态：就绪
    `);

    // 暴露到全局作用域以便控制台调用
    window.DAGVisualizer = DAGVisualizer;

})(); 