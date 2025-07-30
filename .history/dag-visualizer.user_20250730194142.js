// ==UserScript==
// @name         DAG工作流可视化器
// @namespace    https://github.com/dag-visualizer
// @version      1.0.0
// @description  基于JSON配置的DAG工作流可视化工具，专注于节点关系和依赖展示
// @author       DAG Visualizer Team
// @match        *://*/*
// @grant        none
// @icon         🔗
// ==/UserScript==

/**
 * DAG工作流可视化器 - 油猴脚本版本
 * 
 * 基于创意阶段设计决策：
 * - 架构：油猴脚本优先部署，单文件分发
 * - UI设计：极简工具面板 + 全屏画布
 * - 布局算法：分层布局 (Hierarchical Layout)
 * - 配置导出：简化配置增强方案（input/output置空）
 * 
 * 技术栈：原生JavaScript + SVG + CSS，零依赖
 */

(function() {
    'use strict';

    // === 常量配置 ===
    const CONFIG = {
        CONTAINER_ID: 'dag-visualizer-container',
        APP_VERSION: '1.0.0',
        CANVAS_WIDTH: 1600,
        CANVAS_HEIGHT: 1000,
        
        // 节点配置
        NODE: {
            WIDTH: 120,
            HEIGHT: 40,
            PADDING: 12,
            BORDER_RADIUS: 8,
            MIN_WIDTH: 120
        },
        
        // 布局配置
        LAYOUT: {
            LAYER_SPACING: 150,  // 层间距
            NODE_SPACING: 160,   // 节点间距
            CANVAS_MARGIN: 40,   // 画布边距
            EDGE_CURVE: 30       // 连线曲率
        },
        
        // 样式配置（严格遵循样式指南）
        COLORS: {
            PROMPT_BUILD: '#52c41a',    // 绿色系
            CALL_LLM: '#faad14',        // 金黄系
            HTTP_REQUEST: '#ff4d4f',    // 红色系
            CODE_EXEC: '#722ed1',       // 紫色系
            UNKNOWN: '#8c8c8c',         // 灰色系
            
            SELECTED_BORDER: '#1890ff', // 选中边框蓝色
            EDGE_DEFAULT: '#595959',    // 默认连线颜色
            EDGE_HIGHLIGHT: '#ff4d4f'   // 高亮连线颜色
        }
    };

    // === 核心DAG可视化类 ===
    class DAGVisualizer {
        constructor() {
            this.nodes = [];
            this.edges = [];
            this.selectedNode = null;
            this.container = null;
            this.svg = null;
            this.nodesGroup = null;
            this.edgesGroup = null;
            
            this.nodeTypes = {
                'PROMPT_BUILD': { 
                    color: CONFIG.COLORS.PROMPT_BUILD, 
                    textColor: '#ffffff',
                    shadowOpacity: 0.3
                },
                'CALL_LLM': { 
                    color: CONFIG.COLORS.CALL_LLM, 
                    textColor: '#000000',
                    shadowOpacity: 0.3
                },
                'HTTP_REQUEST': { 
                    color: CONFIG.COLORS.HTTP_REQUEST, 
                    textColor: '#ffffff',
                    shadowOpacity: 0.3
                },
                'CODE_EXEC': { 
                    color: CONFIG.COLORS.CODE_EXEC, 
                    textColor: '#ffffff',
                    shadowOpacity: 0.3
                },
                'UNKNOWN': { 
                    color: CONFIG.COLORS.UNKNOWN, 
                    textColor: '#ffffff',
                    shadowOpacity: 0.3
                }
            };
            
            this.init();
        }

        // 初始化可视化器
        init() {
            if (this.checkExisting()) return;
            
            this.createContainer();
            this.createToolbar();
            this.createCanvas();
            this.bindEvents();
            
            console.log('🚀 DAG工作流可视化器初始化完成');
        }

        // 检查是否已存在实例
        checkExisting() {
            const existing = document.getElementById(CONFIG.CONTAINER_ID);
            if (existing) {
                console.log('⚠️ DAG可视化器已存在，跳过初始化');
                return true;
            }
            return false;
        }

        // 创建主容器
        createContainer() {
            this.container = document.createElement('div');
            this.container.id = CONFIG.CONTAINER_ID;
            this.container.innerHTML = this.getContainerHTML();
            this.container.style.cssText = this.getContainerCSS();
            
            document.body.appendChild(this.container);
        }

        // 获取容器HTML
        getContainerHTML() {
            return `
                <div class="dag-toolbar">
                    <div class="toolbar-left">
                        <div class="logo">
                            <span class="logo-icon">🔗</span>
                            <span class="logo-text">DAG可视化器</span>
                            <span class="version">v${CONFIG.APP_VERSION}</span>
                        </div>
                    </div>
                    
                    <div class="toolbar-center">
                        <input type="file" id="dag-file-input" accept=".json" style="display: none;">
                        <button id="dag-upload-btn" class="btn btn-primary">
                            📁 上传JSON文件
                        </button>
                        <button id="dag-export-btn" class="btn btn-secondary" disabled>
                            💾 导出配置
                        </button>
                        <button id="dag-layout-btn" class="btn btn-secondary" disabled>
                            📐 重新布局
                        </button>
                        <button id="dag-clear-btn" class="btn btn-secondary" disabled>
                            🗑️ 清空画布
                        </button>
                    </div>
                    
                    <div class="toolbar-right">
                        <button id="dag-close-btn" class="btn btn-close">
                            ✕
                        </button>
                    </div>
                </div>
                
                <div class="dag-canvas-container">
                    <svg id="dag-canvas" width="${CONFIG.CANVAS_WIDTH}" height="${CONFIG.CANVAS_HEIGHT}" 
                         viewBox="0 0 ${CONFIG.CANVAS_WIDTH} ${CONFIG.CANVAS_HEIGHT}">
                        <!-- 定义箭头标记和阴影滤镜 -->
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                                    refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="${CONFIG.COLORS.EDGE_DEFAULT}" />
                            </marker>
                            <marker id="arrowhead-highlight" markerWidth="10" markerHeight="7" 
                                    refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="${CONFIG.COLORS.EDGE_HIGHLIGHT}" />
                            </marker>
                            <filter id="node-shadow" x="-50%" y="-50%" width="200%" height="200%">
                                <dropShadow dx="2" dy="2" stdDeviation="4" flood-opacity="0.3"/>
                            </filter>
                        </defs>
                        
                        <!-- 连线组 -->
                        <g id="dag-edges-group"></g>
                        
                        <!-- 节点组 -->
                        <g id="dag-nodes-group"></g>
                    </svg>
                </div>
                
                <div class="dag-status" id="dag-status">
                    DAG可视化器就绪 - 点击"上传JSON文件"开始使用
                </div>
            `;
        }

        // 获取容器CSS样式
        getContainerCSS() {
            return `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: #f5f7fa;
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                color: #262626;
                display: flex;
                flex-direction: column;
                box-sizing: border-box;
            `;
        }

        // 创建工具栏
        createToolbar() {
            const style = document.createElement('style');
            style.textContent = this.getToolbarCSS();
            document.head.appendChild(style);
        }

        // 获取工具栏CSS
        getToolbarCSS() {
            return `
                #${CONFIG.CONTAINER_ID} .dag-toolbar {
                    height: 60px;
                    background: #ffffff;
                    border-bottom: 1px solid #f0f0f0;
                    display: flex;
                    align-items: center;
                    padding: 0 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    flex-shrink: 0;
                }
                
                #${CONFIG.CONTAINER_ID} .toolbar-left {
                    flex: 1;
                }
                
                #${CONFIG.CONTAINER_ID} .toolbar-center {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }
                
                #${CONFIG.CONTAINER_ID} .toolbar-right {
                    flex: 1;
                    display: flex;
                    justify-content: flex-end;
                }
                
                #${CONFIG.CONTAINER_ID} .logo {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                }
                
                #${CONFIG.CONTAINER_ID} .logo-icon {
                    font-size: 20px;
                }
                
                #${CONFIG.CONTAINER_ID} .logo-text {
                    font-size: 16px;
                    color: #262626;
                }
                
                #${CONFIG.CONTAINER_ID} .version {
                    font-size: 12px;
                    color: #8c8c8c;
                    background: #f5f5f5;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: normal;
                }
                
                #${CONFIG.CONTAINER_ID} .btn {
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                #${CONFIG.CONTAINER_ID} .btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                
                #${CONFIG.CONTAINER_ID} .btn:active {
                    transform: translateY(0);
                }
                
                #${CONFIG.CONTAINER_ID} .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none !important;
                    box-shadow: none !important;
                }
                
                #${CONFIG.CONTAINER_ID} .btn-primary {
                    background: #1890ff;
                    color: white;
                }
                
                #${CONFIG.CONTAINER_ID} .btn-primary:hover:not(:disabled) {
                    background: #40a9ff;
                }
                
                #${CONFIG.CONTAINER_ID} .btn-secondary {
                    background: #f5f5f5;
                    color: #595959;
                    border: 1px solid #d9d9d9;
                }
                
                #${CONFIG.CONTAINER_ID} .btn-secondary:hover:not(:disabled) {
                    background: #ffffff;
                    border-color: #40a9ff;
                    color: #1890ff;
                }
                
                #${CONFIG.CONTAINER_ID} .btn-close {
                    background: #ff4d4f;
                    color: white;
                    width: 32px;
                    height: 32px;
                    padding: 0;
                    border-radius: 50%;
                    justify-content: center;
                }
                
                #${CONFIG.CONTAINER_ID} .btn-close:hover {
                    background: #ff7875;
                }
                
                #${CONFIG.CONTAINER_ID} .dag-canvas-container {
                    flex: 1;
                    overflow: auto;
                    background: #ffffff;
                    position: relative;
                }
                
                #${CONFIG.CONTAINER_ID} .dag-status {
                    height: 40px;
                    background: #fafafa;
                    border-top: 1px solid #f0f0f0;
                    padding: 0 20px;
                    display: flex;
                    align-items: center;
                    font-size: 13px;
                    color: #8c8c8c;
                    flex-shrink: 0;
                }
                
                /* SVG 节点和连线样式 */
                #${CONFIG.CONTAINER_ID} .dag-node {
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                #${CONFIG.CONTAINER_ID} .dag-node:hover .node-rect {
                    filter: brightness(1.1);
                    stroke-width: 3;
                }
                
                #${CONFIG.CONTAINER_ID} .dag-node.selected .node-rect {
                    stroke: ${CONFIG.COLORS.SELECTED_BORDER};
                    stroke-width: 3;
                }
                
                #${CONFIG.CONTAINER_ID} .node-rect {
                    stroke-width: 2;
                    filter: url(#node-shadow);
                }
                
                #${CONFIG.CONTAINER_ID} .node-text {
                    font-size: 12px;
                    font-weight: bold;
                    text-anchor: middle;
                    dominant-baseline: middle;
                    pointer-events: none;
                }
                
                #${CONFIG.CONTAINER_ID} .node-id {
                    font-size: 10px;
                    font-weight: normal;
                    text-anchor: middle;
                    dominant-baseline: middle;
                    pointer-events: none;
                    opacity: 0.8;
                }
                
                #${CONFIG.CONTAINER_ID} .dag-edge {
                    stroke: ${CONFIG.COLORS.EDGE_DEFAULT};
                    stroke-width: 2;
                    fill: none;
                    marker-end: url(#arrowhead);
                    transition: all 0.2s ease;
                }
                
                #${CONFIG.CONTAINER_ID} .dag-edge.highlighted {
                    stroke: ${CONFIG.COLORS.EDGE_HIGHLIGHT};
                    stroke-width: 3;
                    marker-end: url(#arrowhead-highlight);
                }
            `;
        }

        // 创建画布
        createCanvas() {
            this.svg = this.container.querySelector('#dag-canvas');
            this.nodesGroup = this.container.querySelector('#dag-nodes-group');
            this.edgesGroup = this.container.querySelector('#dag-edges-group');
        }

        // 绑定事件
        bindEvents() {
            // 文件上传
            const fileInput = this.container.querySelector('#dag-file-input');
            const uploadBtn = this.container.querySelector('#dag-upload-btn');
            
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
            
            // 工具栏按钮
            this.container.querySelector('#dag-export-btn').addEventListener('click', () => this.exportConfig());
            this.container.querySelector('#dag-layout-btn').addEventListener('click', () => this.relayout());
            this.container.querySelector('#dag-clear-btn').addEventListener('click', () => this.clearCanvas());
            this.container.querySelector('#dag-close-btn').addEventListener('click', () => this.close());
            
            // 画布拖拽上传
            const canvasContainer = this.container.querySelector('.dag-canvas-container');
            canvasContainer.addEventListener('dragover', (e) => this.handleDragOver(e));
            canvasContainer.addEventListener('drop', (e) => this.handleDrop(e));
        }

        // 处理文件上传
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            if (!file.name.endsWith('.json')) {
                this.updateStatus('❌ 请选择JSON格式文件', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    this.loadDAGData(jsonData, file.name);
                } catch (error) {
                    this.updateStatus('❌ JSON文件解析失败: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        }

        // 处理拖拽悬停
        handleDragOver(event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        }

        // 处理拖拽释放
        handleDrop(event) {
            event.preventDefault();
            const files = event.dataTransfer.files;
            if (files.length > 0) {
                const fakeEvent = { target: { files: [files[0]] } };
                this.handleFileUpload(fakeEvent);
            }
        }

        // 加载DAG数据
        loadDAGData(jsonData, filename) {
            this.updateStatus('⏳ 正在解析DAG数据...', 'info');
            
            try {
                const parsedData = this.parseDAGJson(jsonData);
                this.nodes = parsedData.nodes;
                this.edges = parsedData.edges;
                
                if (this.nodes.length === 0) {
                    this.updateStatus('❌ 未找到有效的DAG节点数据', 'error');
                    return;
                }
                
                // 应用分层布局
                this.calculateHierarchicalLayout();
                this.render();
                this.enableButtons();
                
                this.updateStatus(
                    `✅ 成功加载 ${filename} - ${this.nodes.length}个节点，${this.edges.length}条连线`, 
                    'success'
                );
                
            } catch (error) {
                this.updateStatus('❌ 数据处理失败: ' + error.message, 'error');
                console.error('DAG数据加载错误:', error);
            }
        }

        // 解析DAG JSON数据
        parseDAGJson(jsonData) {
            const nodes = [];
            const edges = [];
            
            // 支持数组格式和对象格式
            const tasks = Array.isArray(jsonData) ? jsonData : (jsonData.tasks || []);
            
            tasks.forEach((task, index) => {
                if (!task || typeof task !== 'object') return;
                
                const nodeType = this.extractNodeType(task['@type'] || task.type || 'UNKNOWN');
                const nodeId = task.taskId || `node_${index}`;
                
                nodes.push({
                    id: nodeId,
                    type: nodeType,
                    label: nodeType,
                    taskId: nodeId,
                    originalData: task,
                    x: 0, 
                    y: 0
                });
                
                // 解析依赖关系
                const dependencies = task.dependencies || task.deps || [];
                dependencies.forEach(dep => {
                    if (dep && typeof dep === 'string') {
                        edges.push({
                            source: dep,
                            target: nodeId
                        });
                    }
                });
            });
            
            console.log(`📊 解析完成: ${nodes.length}个节点, ${edges.length}条边`);
            return { nodes, edges };
        }

        // 提取节点类型
        extractNodeType(typeString) {
            if (!typeString) return 'UNKNOWN';
            
            const type = typeString.toLowerCase();
            if (type.includes('templatetransform') || type.includes('prompt_build')) return 'PROMPT_BUILD';
            if (type.includes('llm') || type.includes('call_llm')) return 'CALL_LLM';
            if (type.includes('httprequest') || type.includes('http_request')) return 'HTTP_REQUEST';
            if (type.includes('code') || type.includes('exec')) return 'CODE_EXEC';
            
            return 'UNKNOWN';
        }

        // 分层布局算法（优化版）
        calculateHierarchicalLayout() {
            if (this.nodes.length === 0) return;
            
            // 1. 计算入度
            const inDegree = {};
            this.nodes.forEach(node => inDegree[node.id] = 0);
            this.edges.forEach(edge => {
                if (inDegree.hasOwnProperty(edge.target)) {
                    inDegree[edge.target]++;
                }
            });
            
            // 2. 拓扑排序分层
            const layers = [];
            let currentNodes = this.nodes.filter(node => inDegree[node.id] === 0);
            
            // 如果没有入度为0的节点，选择第一个节点作为起始点
            if (currentNodes.length === 0 && this.nodes.length > 0) {
                currentNodes = [this.nodes[0]];
                inDegree[this.nodes[0].id] = 0;
            }
            
            while (currentNodes.length > 0) {
                layers.push([...currentNodes]);
                const nextNodes = [];
                
                currentNodes.forEach(node => {
                    this.edges.forEach(edge => {
                        if (edge.source === node.id) {
                            inDegree[edge.target]--;
                            if (inDegree[edge.target] === 0) {
                                const targetNode = this.nodes.find(n => n.id === edge.target);
                                if (targetNode && !nextNodes.includes(targetNode)) {
                                    nextNodes.push(targetNode);
                                }
                            }
                        }
                    });
                });
                
                currentNodes = nextNodes;
            }
            
            // 3. 应用层次位置
            const canvasWidth = CONFIG.CANVAS_WIDTH - 2 * CONFIG.LAYOUT.CANVAS_MARGIN;
            const canvasHeight = CONFIG.CANVAS_HEIGHT - 2 * CONFIG.LAYOUT.CANVAS_MARGIN;
            
            layers.forEach((layer, layerIndex) => {
                const layerY = CONFIG.LAYOUT.CANVAS_MARGIN + 
                              (layerIndex * CONFIG.LAYOUT.LAYER_SPACING) + 
                              CONFIG.NODE.HEIGHT / 2;
                
                // 水平居中分布
                const layerWidth = (layer.length - 1) * CONFIG.LAYOUT.NODE_SPACING;
                const startX = CONFIG.LAYOUT.CANVAS_MARGIN + (canvasWidth - layerWidth) / 2;
                
                layer.forEach((node, nodeIndex) => {
                    node.x = Math.max(
                        CONFIG.LAYOUT.CANVAS_MARGIN + CONFIG.NODE.WIDTH / 2,
                        startX + nodeIndex * CONFIG.LAYOUT.NODE_SPACING
                    );
                    node.y = layerY;
                });
            });
            
            console.log(`📐 分层布局完成: ${layers.length}层`);
        }

        // 渲染所有元素
        render() {
            this.renderEdges();
            this.renderNodes();
        }

        // 渲染节点
        renderNodes() {
            this.nodesGroup.innerHTML = '';
            
            this.nodes.forEach(node => {
                const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                nodeGroup.setAttribute('class', 'dag-node');
                nodeGroup.setAttribute('data-id', node.id);
                
                const nodeConfig = this.nodeTypes[node.type] || this.nodeTypes['UNKNOWN'];
                
                // 创建节点矩形
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('class', 'node-rect');
                rect.setAttribute('x', node.x - CONFIG.NODE.WIDTH / 2);
                rect.setAttribute('y', node.y - CONFIG.NODE.HEIGHT / 2);
                rect.setAttribute('width', CONFIG.NODE.WIDTH);
                rect.setAttribute('height', CONFIG.NODE.HEIGHT);
                rect.setAttribute('rx', CONFIG.NODE.BORDER_RADIUS);
                rect.setAttribute('fill', nodeConfig.color);
                rect.setAttribute('stroke', this.darkenColor(nodeConfig.color, 20));
                
                // 创建节点标签文本
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('class', 'node-text');
                text.setAttribute('x', node.x);
                text.setAttribute('y', node.y - 4);
                text.setAttribute('fill', nodeConfig.textColor);
                text.textContent = node.type;
                
                // 创建节点ID文本
                const idText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                idText.setAttribute('class', 'node-id');
                idText.setAttribute('x', node.x);
                idText.setAttribute('y', node.y + 8);
                idText.setAttribute('fill', nodeConfig.textColor);
                idText.textContent = node.taskId.length > 15 ? 
                    node.taskId.substring(0, 12) + '...' : node.taskId;
                
                // 添加点击事件
                nodeGroup.addEventListener('click', () => this.selectNode(node.id));
                
                nodeGroup.appendChild(rect);
                nodeGroup.appendChild(text);
                nodeGroup.appendChild(idText);
                this.nodesGroup.appendChild(nodeGroup);
            });
        }

        // 渲染连线
        renderEdges() {
            this.edgesGroup.innerHTML = '';
            
            this.edges.forEach(edge => {
                const sourceNode = this.nodes.find(n => n.id === edge.source);
                const targetNode = this.nodes.find(n => n.id === edge.target);
                
                if (sourceNode && targetNode) {
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    
                    // 计算连线路径（贝塞尔曲线）
                    const x1 = sourceNode.x + CONFIG.NODE.WIDTH / 2;
                    const y1 = sourceNode.y;
                    const x2 = targetNode.x - CONFIG.NODE.WIDTH / 2;
                    const y2 = targetNode.y;
                    
                    const cx1 = x1 + CONFIG.LAYOUT.EDGE_CURVE;
                    const cy1 = y1;
                    const cx2 = x2 - CONFIG.LAYOUT.EDGE_CURVE;
                    const cy2 = y2;
                    
                    const pathData = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
                    
                    path.setAttribute('d', pathData);
                    path.setAttribute('class', 'dag-edge');
                    path.setAttribute('data-source', edge.source);
                    path.setAttribute('data-target', edge.target);
                    
                    this.edgesGroup.appendChild(path);
                }
            });
        }

        // 选择节点
        selectNode(nodeId) {
            // 清除之前的选择
            this.container.querySelectorAll('.dag-node').forEach(node => {
                node.classList.remove('selected');
            });
            this.container.querySelectorAll('.dag-edge').forEach(edge => {
                edge.classList.remove('highlighted');
            });
            
            // 选择新节点
            const nodeElement = this.container.querySelector(`[data-id="${nodeId}"]`);
            if (nodeElement) {
                nodeElement.classList.add('selected');
                this.selectedNode = nodeId;
                
                // 高亮相关连线
                this.container.querySelectorAll(`[data-source="${nodeId}"], [data-target="${nodeId}"]`).forEach(edge => {
                    edge.classList.add('highlighted');
                });
                
                const selectedNodeData = this.nodes.find(n => n.id === nodeId);
                this.updateStatus(`🎯 已选中节点: ${selectedNodeData.type} - ${nodeId}`, 'info');
            }
        }

        // 导出配置（简化版本）
        exportConfig() {
            if (this.nodes.length === 0) {
                this.updateStatus('❌ 没有可导出的数据', 'error');
                return;
            }
            
            try {
                // 创建简化配置
                const exportData = this.nodes.map(node => {
                    const originalData = node.originalData || {};
                    return {
                        '@type': originalData['@type'] || `unknown.${node.type}`,
                        'taskId': node.taskId,
                        'taskType': node.type,
                        'dependencies': this.edges
                            .filter(edge => edge.target === node.id)
                            .map(edge => edge.source),
                        
                        // 清空复杂字段（专注DAG结构）
                        'input': [],
                        'output': [],
                        
                        // 添加可视化信息
                        '_visualization': {
                            'position': { x: node.x, y: node.y },
                            'layout': 'hierarchical',
                            'userModified': false,
                            'lastUpdated': new Date().toISOString()
                        }
                    };
                });
                
                // 生成下载文件
                const jsonString = JSON.stringify(exportData, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = `dag-config-exported-${new Date().getTime()}.json`;
                link.click();
                
                URL.revokeObjectURL(url);
                
                this.updateStatus(`✅ 配置已导出 - ${this.nodes.length}个节点（简化版本）`, 'success');
                
            } catch (error) {
                this.updateStatus('❌ 导出失败: ' + error.message, 'error');
                console.error('导出错误:', error);
            }
        }

        // 重新布局
        relayout() {
            if (this.nodes.length === 0) {
                this.updateStatus('❌ 没有可重新布局的数据', 'error');
                return;
            }
            
            this.calculateHierarchicalLayout();
            this.render();
            this.updateStatus('✅ 重新布局完成', 'success');
        }

        // 清空画布
        clearCanvas() {
            this.nodes = [];
            this.edges = [];
            this.selectedNode = null;
            this.nodesGroup.innerHTML = '';
            this.edgesGroup.innerHTML = '';
            this.disableButtons();
            this.updateStatus('🗑️ 画布已清空', 'info');
        }

        // 关闭应用
        close() {
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
                console.log('👋 DAG可视化器已关闭');
            }
        }

        // 启用按钮
        enableButtons() {
            this.container.querySelector('#dag-export-btn').disabled = false;
            this.container.querySelector('#dag-layout-btn').disabled = false;
            this.container.querySelector('#dag-clear-btn').disabled = false;
        }

        // 禁用按钮
        disableButtons() {
            this.container.querySelector('#dag-export-btn').disabled = true;
            this.container.querySelector('#dag-layout-btn').disabled = true;
            this.container.querySelector('#dag-clear-btn').disabled = true;
        }

        // 更新状态
        updateStatus(message, type = 'info') {
            const statusElement = this.container.querySelector('#dag-status');
            statusElement.textContent = message;
            
            // 添加颜色样式
            statusElement.style.color = {
                'success': '#52c41a',
                'error': '#ff4d4f',
                'info': '#1890ff',
                'warning': '#faad14'
            }[type] || '#8c8c8c';
            
            console.log(`[${type.toUpperCase()}] ${message}`);
        }

        // 颜色加深工具函数
        darkenColor(hex, percent) {
            const num = parseInt(hex.replace('#', ''), 16);
            const amt = Math.round(2.55 * percent);
            const R = (num >> 16) - amt;
            const G = (num >> 8 & 0x00FF) - amt;
            const B = (num & 0x0000FF) - amt;
            return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
                (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
                (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
        }
    }

    // === 主入口点 ===
    
    // 添加启动快捷键
    document.addEventListener('keydown', function(event) {
        // Ctrl+Shift+D 启动DAG可视化器
        if (event.ctrlKey && event.shiftKey && event.key === 'D') {
            event.preventDefault();
            
            if (!document.getElementById(CONFIG.CONTAINER_ID)) {
                new DAGVisualizer();
            }
        }
    });

    // 自动启动检测（检测是否在包含JSON的页面）
    function autoDetectAndStart() {
        // 检测页面是否包含JSON数据
        const pageText = document.body.textContent || '';
        const hasDAGKeywords = /workflow|task|dag|@type.*node/i.test(pageText);
        
        if (hasDAGKeywords) {
            console.log('🔍 检测到可能的DAG相关页面，可使用 Ctrl+Shift+D 启动可视化器');
        }
    }

    // 等待页面加载完成后检测
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoDetectAndStart);
    } else {
        autoDetectAndStart();
    }

    // 在控制台输出使用提示
    console.log(`
🚀 DAG工作流可视化器已加载！

📖 使用方法：
• 快捷键：Ctrl+Shift+D 启动可视化器
• 支持拖拽上传JSON文件
• 支持复杂DAG工作流可视化
• 节点类型自动识别和颜色编码

✨ 功能特性：
• 零依赖，纯JavaScript实现
• 分层布局算法，清晰显示依赖关系
• 配置导出功能（简化版本）
• 响应式界面，支持全屏展示

🔧 版本：v${CONFIG.APP_VERSION}
📝 遵循创意设计决策：油猴脚本 + 极简UI + 分层布局
    `);

})(); 