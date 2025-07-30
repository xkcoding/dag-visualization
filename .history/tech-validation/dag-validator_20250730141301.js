// DAG 可视化技术验证脚本

// 全局变量
let cy;

// 初始化 Cytoscape 实例
function initCytoscape() {
    cy = cytoscape({
        container: document.getElementById('cy'),
        
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#007bff',
                    'label': 'data(label)',
                    'color': '#ffffff',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': '12px',
                    'width': 'label',
                    'height': 'label',
                    'padding': '10px',
                    'border-width': 2,
                    'border-color': '#0056b3'
                }
            },
            {
                selector: 'node[type="PROMPT_BUILD"]',
                style: {
                    'background-color': '#28a745',
                    'border-color': '#1e7e34'
                }
            },
            {
                selector: 'node[type="CALL_LLM"]',
                style: {
                    'background-color': '#ffc107',
                    'border-color': '#e0a800',
                    'color': '#000000'
                }
            },
            {
                selector: 'node[type="HttpRequestNode"]',
                style: {
                    'background-color': '#dc3545',
                    'border-color': '#c82333'
                }
            },
            {
                selector: 'node[type="CodeNode"]',
                style: {
                    'background-color': '#6f42c1',
                    'border-color': '#59359a'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#666',
                    'target-arrow-color': '#666',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier'
                }
            },
            {
                selector: 'node:selected',
                style: {
                    'border-width': 4,
                    'border-color': '#ff6b6b'
                }
            }
        ],
        
        layout: {
            name: 'breadthfirst',
            directed: true,
            padding: 30,
            spacingFactor: 1.2
        }
    });
    
    // 添加事件监听器
    cy.on('tap', 'node', function(evt) {
        const node = evt.target;
        console.log('节点被点击:', node.data());
        
        // 高亮连接的节点
        const connected = node.connectedEdges();
        cy.elements().removeClass('highlighted');
        node.addClass('highlighted');
        connected.addClass('highlighted');
        connected.connectedNodes().addClass('highlighted');
    });
    
    cy.on('mouseover', 'node', function(evt) {
        const node = evt.target;
        node.style('background-color', '#ff6b6b');
    });
    
    cy.on('mouseout', 'node', function(evt) {
        const node = evt.target;
        // 恢复原来的颜色（基于类型）
        const type = node.data('type');
        const colors = {
            'PROMPT_BUILD': '#28a745',
            'CALL_LLM': '#ffc107',
            'HttpRequestNode': '#dc3545',
            'CodeNode': '#6f42c1'
        };
        node.style('background-color', colors[type] || '#007bff');
    });
}

// 加载简单 DAG 进行验证
function loadSimpleDAG() {
    const simpleData = {
        nodes: [
            { data: { id: 'node1', label: 'START\nPROMPT_BUILD', type: 'PROMPT_BUILD' } },
            { data: { id: 'node2', label: 'LLM\nCALL_LLM', type: 'CALL_LLM' } },
            { data: { id: 'node3', label: 'HTTP\nREQUEST', type: 'HttpRequestNode' } },
            { data: { id: 'node4', label: 'CODE\nEXEC', type: 'CodeNode' } }
        ],
        edges: [
            { data: { id: 'edge1', source: 'node1', target: 'node2' } },
            { data: { id: 'edge2', source: 'node2', target: 'node3' } },
            { data: { id: 'edge3', source: 'node3', target: 'node4' } }
        ]
    };
    
    cy.json({ elements: simpleData });
    cy.layout({ name: 'breadthfirst', directed: true, padding: 50 }).run();
    console.log('✅ 简单 DAG 加载成功');
}

// 加载复杂 DAG（模拟真实数据）
function loadComplexDAG() {
    // 基于真实 DAG 数据创建的测试数据
    const complexData = {
        nodes: [
            { data: { id: 'understanding_prompt', label: 'UNDERSTANDING\nINTENTION\nPROMPT_BUILD', type: 'PROMPT_BUILD' } },
            { data: { id: 'understanding_llm', label: 'UNDERSTANDING\nINTENTION\nCALL_LLM', type: 'CALL_LLM' } },
            { data: { id: 'question_prompt', label: 'QUESTION\nDECOMPOSE\nPROMPT_BUILD', type: 'PROMPT_BUILD' } },
            { data: { id: 'question_llm', label: 'QUESTION\nDECOMPOSE\nCALL_LLM', type: 'CALL_LLM' } },
            { data: { id: 'field_prompt', label: 'FIELD\nRETRIEVAL\nPROMPT_BUILD', type: 'PROMPT_BUILD' } },
            { data: { id: 'field_http', label: 'FIELD\nRETRIEVAL\nHTTP_REQUEST', type: 'HttpRequestNode' } },
            { data: { id: 'field_code', label: 'FIELD\nRETRIEVAL\nEXEC_CODE', type: 'CodeNode' } },
            { data: { id: 'dataset_prompt', label: 'DATASET\nSELECT\nPROMPT_BUILD', type: 'PROMPT_BUILD' } },
            { data: { id: 'dataset_http', label: 'DATASET\nSELECT\nHTTP_REQUEST', type: 'HttpRequestNode' } },
            { data: { id: 'final_code', label: 'EVALUATE\nSCORE\nEXEC_CODE', type: 'CodeNode' } }
        ],
        edges: [
            { data: { source: 'understanding_prompt', target: 'understanding_llm' } },
            { data: { source: 'understanding_llm', target: 'question_prompt' } },
            { data: { source: 'question_prompt', target: 'question_llm' } },
            { data: { source: 'question_llm', target: 'field_prompt' } },
            { data: { source: 'field_prompt', target: 'field_http' } },
            { data: { source: 'field_http', target: 'field_code' } },
            { data: { source: 'field_code', target: 'dataset_prompt' } },
            { data: { source: 'dataset_prompt', target: 'dataset_http' } },
            { data: { source: 'dataset_http', target: 'final_code' } },
            // 添加一些并行分支
            { data: { source: 'question_llm', target: 'dataset_prompt' } },
            { data: { source: 'field_code', target: 'final_code' } }
        ]
    };
    
    cy.json({ elements: complexData });
    cy.layout({ 
        name: 'dagre',
        directed: true,
        padding: 50,
        spacingFactor: 1.5,
        rankDir: 'TB'
    }).run();
    console.log('✅ 复杂 DAG 加载成功');
}

// 重置视图
function resetView() {
    cy.fit();
    cy.center();
    cy.elements().removeClass('highlighted');
    console.log('✅ 视图已重置');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 开始技术验证...');
    
    // 检查 Cytoscape.js 是否加载
    if (typeof cytoscape === 'undefined') {
        console.error('❌ Cytoscape.js 未正确加载');
        return;
    }
    
    console.log('✅ Cytoscape.js 加载成功');
    
    // 初始化 Cytoscape 实例
    initCytoscape();
    
    // 默认加载简单 DAG
    setTimeout(() => {
        loadSimpleDAG();
    }, 500);
    
    console.log('✅ 技术验证初始化完成');
}); 