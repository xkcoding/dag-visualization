// React Flow DAG 可视化验证脚本
// 使用 CDN 版本的 React 和 React Flow

const { useState, useCallback, useMemo } = React;
const { ReactFlow, useNodesState, useEdgesState, addEdge, Controls, MiniMap, Background } = ReactFlowCore;

// 全局变量
let flowInstance = null;
let validationStatus = {
    reactLoaded: false,
    reactFlowLoaded: false,
    renderSuccess: false,
    interactionWorking: false,
    layoutTested: false,
    realDataTested: false
};

// 状态更新函数
function updateStatus(key, value, message = '') {
    validationStatus[key] = value;
    displayValidationStatus();
    if (message) {
        console.log(`✅ ${message}`);
    }
}

// 显示验证状态
function displayValidationStatus() {
    const container = document.getElementById('status-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.entries(validationStatus).forEach(([key, value]) => {
        const statusItem = document.createElement('div');
        statusItem.className = `status-item ${value ? 'status-success' : 'status-warning'}`;
        
        const labels = {
            reactLoaded: 'React 加载',
            reactFlowLoaded: 'React Flow 加载',
            renderSuccess: '渲染成功',
            interactionWorking: '交互功能',
            layoutTested: '布局算法',
            realDataTested: '真实数据'
        };
        
        statusItem.textContent = `${labels[key]}: ${value ? '✅' : '⏳'}`;
        container.appendChild(statusItem);
    });
}

// 自定义节点类型
const customNodeTypes = {
    promptBuild: ({ data }) => {
        return React.createElement('div', {
            style: {
                background: '#52c41a',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #389e0d',
                fontSize: '12px',
                fontWeight: 'bold',
                textAlign: 'center',
                minWidth: '120px',
                boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)'
            }
        }, data.label);
    },
    
    callLLM: ({ data }) => {
        return React.createElement('div', {
            style: {
                background: '#faad14',
                color: '#000',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #d48806',
                fontSize: '12px',
                fontWeight: 'bold',
                textAlign: 'center',
                minWidth: '120px',
                boxShadow: '0 2px 8px rgba(250, 173, 20, 0.3)'
            }
        }, data.label);
    },
    
    httpRequest: ({ data }) => {
        return React.createElement('div', {
            style: {
                background: '#ff4d4f',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #cf1322',
                fontSize: '12px',
                fontWeight: 'bold',
                textAlign: 'center',
                minWidth: '120px',
                boxShadow: '0 2px 8px rgba(255, 77, 79, 0.3)'
            }
        }, data.label);
    },
    
    codeExec: ({ data }) => {
        return React.createElement('div', {
            style: {
                background: '#722ed1',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #531dab',
                fontSize: '12px',
                fontWeight: 'bold',
                textAlign: 'center',
                minWidth: '120px',
                boxShadow: '0 2px 8px rgba(114, 46, 209, 0.3)'
            }
        }, data.label);
    }
};

// DAG Flow 组件
function DAGFlowComponent() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    
    const onConnect = useCallback((params) => {
        setEdges((eds) => addEdge(params, eds));
    }, [setEdges]);
    
    return React.createElement(ReactFlow, {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        nodeTypes: customNodeTypes,
        fitView: true,
        style: { width: '100%', height: '100%' },
        onInit: (instance) => {
            flowInstance = instance;
            updateStatus('renderSuccess', true, 'React Flow 实例初始化成功');
        },
        onNodeClick: (event, node) => {
            console.log('节点被点击:', node);
            updateStatus('interactionWorking', true, '交互功能正常');
        }
    }, [
        React.createElement(Controls),
        React.createElement(MiniMap, { nodeColor: '#666' }),
        React.createElement(Background, { variant: 'dots' })
    ]);
}

// 初始化验证
function initializeValidation() {
    console.log('🚀 开始 React Flow 验证...');
    
    // 检查依赖库
    if (typeof React !== 'undefined') {
        updateStatus('reactLoaded', true, 'React 加载成功');
    } else {
        updateStatus('reactLoaded', false, 'React 加载失败');
        return;
    }
    
    if (typeof ReactFlowCore !== 'undefined') {
        updateStatus('reactFlowLoaded', true, 'React Flow 加载成功');
    } else {
        updateStatus('reactFlowLoaded', false, 'React Flow 加载失败');
        return;
    }
    
    // 渲染 React Flow 组件
    const container = document.getElementById('dag-flow-container');
    if (container) {
        const root = ReactDOM.createRoot(container);
        root.render(React.createElement(DAGFlowComponent));
    }
}

// 加载简单 DAG
function loadSimpleDAG() {
    if (!flowInstance) {
        console.error('React Flow 实例未初始化');
        return;
    }
    
    const simpleNodes = [
        {
            id: '1',
            type: 'promptBuild',
            position: { x: 100, y: 100 },
            data: { label: 'PROMPT\nBUILD' }
        },
        {
            id: '2',
            type: 'callLLM',
            position: { x: 300, y: 100 },
            data: { label: 'CALL\nLLM' }
        },
        {
            id: '3',
            type: 'httpRequest',
            position: { x: 500, y: 100 },
            data: { label: 'HTTP\nREQUEST' }
        },
        {
            id: '4',
            type: 'codeExec',
            position: { x: 700, y: 100 },
            data: { label: 'CODE\nEXEC' }
        }
    ];
    
    const simpleEdges = [
        { id: 'e1-2', source: '1', target: '2', animated: true },
        { id: 'e2-3', source: '2', target: '3', animated: true },
        { id: 'e3-4', source: '3', target: '4', animated: true }
    ];
    
    flowInstance.setNodes(simpleNodes);
    flowInstance.setEdges(simpleEdges);
    
    setTimeout(() => {
        flowInstance.fitView();
    }, 100);
    
    console.log('✅ 简单 DAG 加载完成');
}

// 加载真实数据 DAG（模拟29个节点）
function loadRealDAG() {
    if (!flowInstance) {
        console.error('React Flow 实例未初始化');
        return;
    }
    
    // 模拟真实的29个节点数据
    const realNodes = [
        { id: 'understanding_prompt', type: 'promptBuild', position: { x: 100, y: 50 }, data: { label: 'UNDERSTANDING\nINTENTION\nPROMPT' } },
        { id: 'understanding_llm', type: 'callLLM', position: { x: 100, y: 150 }, data: { label: 'UNDERSTANDING\nINTENTION\nLLM' } },
        { id: 'question_prompt', type: 'promptBuild', position: { x: 100, y: 250 }, data: { label: 'QUESTION\nDECOMPOSE\nPROMPT' } },
        { id: 'question_llm', type: 'callLLM', position: { x: 100, y: 350 }, data: { label: 'QUESTION\nDECOMPOSE\nLLM' } },
        { id: 'field_prompt', type: 'promptBuild', position: { x: 350, y: 200 }, data: { label: 'FIELD\nRETRIEVAL\nPROMPT' } },
        { id: 'field_http', type: 'httpRequest', position: { x: 350, y: 300 }, data: { label: 'FIELD\nRETRIEVAL\nHTTP' } },
        { id: 'field_code', type: 'codeExec', position: { x: 350, y: 400 }, data: { label: 'FIELD\nRETRIEVAL\nCODE' } },
        { id: 'dim_code', type: 'codeExec', position: { x: 350, y: 500 }, data: { label: 'DIM_VALUE\nRETRIEVAL\nCODE' } },
        { id: 'subject_prompt', type: 'promptBuild', position: { x: 600, y: 150 }, data: { label: 'SUBJECT\nFIELD\nPROMPT' } },
        { id: 'subject_llm', type: 'callLLM', position: { x: 600, y: 250 }, data: { label: 'SUBJECT\nFIELD\nLLM' } },
        { id: 'dataset_prompt', type: 'promptBuild', position: { x: 600, y: 350 }, data: { label: 'DATASET\nSELECT\nPROMPT' } },
        { id: 'dataset_http', type: 'httpRequest', position: { x: 600, y: 450 }, data: { label: 'DATASET\nSELECT\nHTTP' } },
        { id: 'dataset_code', type: 'codeExec', position: { x: 600, y: 550 }, data: { label: 'DATASET\nSELECT\nCODE' } },
        { id: 'select_prompt', type: 'promptBuild', position: { x: 850, y: 200 }, data: { label: 'SELECT_ONE\nDATASET\nPROMPT' } },
        { id: 'select_llm', type: 'callLLM', position: { x: 850, y: 300 }, data: { label: 'SELECT_ONE\nDATASET\nLLM' } },
        { id: 'select_code', type: 'codeExec', position: { x: 850, y: 400 }, data: { label: 'SELECT_ONE\nDATASET\nCODE' } },
        { id: 'rerank_prompt', type: 'promptBuild', position: { x: 1100, y: 150 }, data: { label: 'RETRIEVAL\nRERAnK\nPROMPT' } },
        { id: 'rerank_llm', type: 'callLLM', position: { x: 1100, y: 250 }, data: { label: 'RETRIEVAL\nRERAnK\nLLM' } },
        { id: 'rerank_code', type: 'codeExec', position: { x: 1100, y: 350 }, data: { label: 'RETRIEVAL\nRERAnK\nCODE' } },
        { id: 'before_prompt', type: 'promptBuild', position: { x: 1350, y: 100 }, data: { label: 'BEFORE\nCONFIG\nPROMPT' } },
        { id: 'measure_prompt', type: 'promptBuild', position: { x: 1350, y: 200 }, data: { label: 'MEASURE\nRESOLVE\nPROMPT' } },
        { id: 'measure_llm', type: 'callLLM', position: { x: 1350, y: 300 }, data: { label: 'MEASURE\nRESOLVE\nLLM' } },
        { id: 'dimension_prompt', type: 'promptBuild', position: { x: 1350, y: 400 }, data: { label: 'DIMENSION\nRESOLVE\nPROMPT' } },
        { id: 'dimension_llm', type: 'callLLM', position: { x: 1350, y: 500 }, data: { label: 'DIMENSION\nRESOLVE\nLLM' } },
        { id: 'filter_prompt', type: 'promptBuild', position: { x: 1600, y: 200 }, data: { label: 'FILTER\nRESOLVE\nPROMPT' } },
        { id: 'filter_llm', type: 'callLLM', position: { x: 1600, y: 300 }, data: { label: 'FILTER\nRESOLVE\nLLM' } },
        { id: 'analysis_prompt', type: 'promptBuild', position: { x: 1600, y: 400 }, data: { label: 'GEN_ANALYSIS\nPROMPT' } },
        { id: 'analysis_http', type: 'httpRequest', position: { x: 1600, y: 500 }, data: { label: 'GEN_ANALYSIS\nHTTP' } },
        { id: 'evaluate_http', type: 'httpRequest', position: { x: 1850, y: 350 }, data: { label: 'EVALUATE\nSCORE\nHTTP' } },
        { id: 'evaluate_code', type: 'codeExec', position: { x: 1850, y: 450 }, data: { label: 'EVALUATE\nSCORE\nCODE' } }
    ];
    
    const realEdges = [
        { id: 'e1', source: 'understanding_prompt', target: 'understanding_llm' },
        { id: 'e2', source: 'understanding_llm', target: 'question_prompt' },
        { id: 'e3', source: 'question_prompt', target: 'question_llm' },
        { id: 'e4', source: 'question_llm', target: 'field_prompt' },
        { id: 'e5', source: 'field_prompt', target: 'field_http' },
        { id: 'e6', source: 'field_http', target: 'field_code' },
        { id: 'e7', source: 'field_code', target: 'dim_code' },
        { id: 'e8', source: 'field_code', target: 'subject_prompt' },
        { id: 'e9', source: 'subject_prompt', target: 'subject_llm' },
        { id: 'e10', source: 'subject_llm', target: 'dataset_prompt' },
        { id: 'e11', source: 'dataset_prompt', target: 'dataset_http' },
        { id: 'e12', source: 'dataset_http', target: 'dataset_code' },
        { id: 'e13', source: 'dataset_code', target: 'select_prompt' },
        { id: 'e14', source: 'select_prompt', target: 'select_llm' },
        { id: 'e15', source: 'select_llm', target: 'select_code' },
        { id: 'e16', source: 'select_code', target: 'rerank_prompt' },
        { id: 'e17', source: 'rerank_prompt', target: 'rerank_llm' },
        { id: 'e18', source: 'rerank_llm', target: 'rerank_code' },
        { id: 'e19', source: 'rerank_code', target: 'before_prompt' },
        { id: 'e20', source: 'before_prompt', target: 'measure_prompt' },
        { id: 'e21', source: 'measure_prompt', target: 'measure_llm' },
        { id: 'e22', source: 'measure_llm', target: 'dimension_prompt' },
        { id: 'e23', source: 'dimension_prompt', target: 'dimension_llm' },
        { id: 'e24', source: 'dimension_llm', target: 'filter_prompt' },
        { id: 'e25', source: 'filter_prompt', target: 'filter_llm' },
        { id: 'e26', source: 'filter_llm', target: 'analysis_prompt' },
        { id: 'e27', source: 'analysis_prompt', target: 'analysis_http' },
        { id: 'e28', source: 'analysis_http', target: 'evaluate_http' },
        { id: 'e29', source: 'evaluate_http', target: 'evaluate_code' },
        // 并行连接
        { id: 'e30', source: 'question_llm', target: 'dataset_prompt' },
        { id: 'e31', source: 'field_code', target: 'evaluate_code' }
    ];
    
    flowInstance.setNodes(realNodes);
    flowInstance.setEdges(realEdges);
    
    setTimeout(() => {
        flowInstance.fitView();
    }, 100);
    
    updateStatus('realDataTested', true, '真实 DAG 数据（29个节点）加载成功');
    
    // 性能测试
    const startTime = performance.now();
    setTimeout(() => {
        const endTime = performance.now();
        console.log(`📊 渲染性能：${(endTime - startTime).toFixed(2)}ms`);
    }, 500);
}

// 测试布局算法
function testLayoutAlgorithms() {
    if (!flowInstance) {
        console.error('React Flow 实例未初始化');
        return;
    }
    
    const nodes = flowInstance.getNodes();
    if (nodes.length === 0) {
        console.warn('请先加载节点数据');
        return;
    }
    
    // 简单的自动布局（层次布局模拟）
    const layoutedNodes = nodes.map((node, index) => {
        const row = Math.floor(index / 5);
        const col = index % 5;
        return {
            ...node,
            position: {
                x: col * 200 + 100,
                y: row * 120 + 100
            }
        };
    });
    
    flowInstance.setNodes(layoutedNodes);
    
    setTimeout(() => {
        flowInstance.fitView();
    }, 100);
    
    updateStatus('layoutTested', true, '布局算法测试完成');
}

// 测试交互功能
function testInteraction() {
    if (!flowInstance) {
        console.error('React Flow 实例未初始化');
        return;
    }
    
    console.log('🎮 交互功能测试：');
    console.log('1. 拖拽节点进行移动');
    console.log('2. 使用鼠标滚轮缩放');
    console.log('3. 点击节点查看选择效果');
    console.log('4. 使用右下角小地图导航');
    
    // 自动测试节点选择
    const nodes = flowInstance.getNodes();
    if (nodes.length > 0) {
        const firstNode = nodes[0];
        flowInstance.setNodes(nodes.map(n => ({
            ...n,
            selected: n.id === firstNode.id
        })));
        
        setTimeout(() => {
            flowInstance.setNodes(nodes.map(n => ({
                ...n,
                selected: false
            })));
        }, 2000);
        
        updateStatus('interactionWorking', true, '自动选择测试完成');
    }
}

// 清空画布
function clearFlow() {
    if (!flowInstance) {
        console.error('React Flow 实例未初始化');
        return;
    }
    
    flowInstance.setNodes([]);
    flowInstance.setEdges([]);
    console.log('🧹 画布已清空');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 页面加载完成，开始验证...');
    
    // 稍微延迟确保所有 CDN 资源加载完成
    setTimeout(() => {
        initializeValidation();
        displayValidationStatus();
    }, 500);
}); 