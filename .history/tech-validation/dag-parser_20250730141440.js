// DAG JSON 解析器 - 技术验证

/**
 * 解析 DAG JSON 配置文件
 * @param {Object} dagJson - 原始 DAG JSON 数据
 * @returns {Object} - 标准化的节点和边数据
 */
function parseDagJson(dagJson) {
    const nodes = [];
    const edges = [];
    
    // 遍历所有节点
    dagJson.forEach(node => {
        // 提取节点信息
        const nodeData = {
            id: node.taskId,
            label: formatNodeLabel(node.taskId, node.taskType),
            type: node.taskType || extractTypeFromClass(node['@type']),
            rawType: node['@type'],
            taskType: node.taskType
        };
        
        nodes.push({ data: nodeData });
        
        // 处理依赖关系（创建边）
        if (node.dependencies && Array.isArray(node.dependencies)) {
            node.dependencies.forEach(dependency => {
                edges.push({
                    data: {
                        id: `${dependency}_to_${node.taskId}`,
                        source: dependency,
                        target: node.taskId
                    }
                });
            });
        }
    });
    
    return { nodes, edges };
}

/**
 * 从 @type 字段提取节点类型
 * @param {string} typeString - 节点的 @type 字段
 * @returns {string} - 简化的节点类型
 */
function extractTypeFromClass(typeString) {
    if (typeString.includes('TemplateTransformNode')) return 'PROMPT_BUILD';
    if (typeString.includes('LLMNode')) return 'CALL_LLM';
    if (typeString.includes('HttpRequestNode')) return 'HttpRequestNode';
    if (typeString.includes('CodeNode')) return 'CodeNode';
    return 'UNKNOWN';
}

/**
 * 格式化节点标签显示
 * @param {string} taskId - 任务 ID
 * @param {string} taskType - 任务类型
 * @returns {string} - 格式化的标签
 */
function formatNodeLabel(taskId, taskType) {
    // 将 taskId 按下划线分割并限制长度
    const parts = taskId.split('_');
    if (parts.length > 2) {
        return parts.slice(0, 2).join('\n') + '\n' + (taskType || '');
    }
    return taskId.replace(/_/g, '\n');
}

/**
 * 验证 DAG 数据结构
 * @param {Object} parsedData - 解析后的数据
 * @returns {Object} - 验证结果
 */
function validateDagStructure(parsedData) {
    const { nodes, edges } = parsedData;
    const nodeIds = new Set(nodes.map(n => n.data.id));
    
    const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        stats: {
            nodeCount: nodes.length,
            edgeCount: edges.length,
            nodeTypes: {}
        }
    };
    
    // 统计节点类型
    nodes.forEach(node => {
        const type = node.data.type;
        validation.stats.nodeTypes[type] = (validation.stats.nodeTypes[type] || 0) + 1;
    });
    
    // 验证边的引用
    edges.forEach(edge => {
        if (!nodeIds.has(edge.data.source)) {
            validation.errors.push(`边引用了不存在的源节点: ${edge.data.source}`);
            validation.isValid = false;
        }
        if (!nodeIds.has(edge.data.target)) {
            validation.errors.push(`边引用了不存在的目标节点: ${edge.data.target}`);
            validation.isValid = false;
        }
    });
    
    // 检查孤立节点
    const connectedNodes = new Set();
    edges.forEach(edge => {
        connectedNodes.add(edge.data.source);
        connectedNodes.add(edge.data.target);
    });
    
    const isolatedNodes = nodes.filter(n => !connectedNodes.has(n.data.id));
    if (isolatedNodes.length > 0) {
        validation.warnings.push(`发现 ${isolatedNodes.length} 个孤立节点`);
    }
    
    return validation;
}

/**
 * 创建测试用的示例 DAG 数据
 * @returns {Array} - 示例 DAG JSON 数据
 */
function createSampleDagData() {
    return [
        {
            "@type": "com.xiaohongshu.data.aimi.workflow.nodes.TemplateTransformNode",
            "taskId": "START_PROMPT_BUILD",
            "taskType": "PROMPT_BUILD",
            "dependencies": []
        },
        {
            "@type": "com.xiaohongshu.data.aimi.workflow.nodes.LLMNode",
            "taskId": "MAIN_CALL_LLM",
            "taskType": "CALL_LLM",
            "dependencies": ["START_PROMPT_BUILD"]
        },
        {
            "@type": "com.xiaohongshu.data.aimi.workflow.nodes.HttpRequestNode",
            "taskId": "DATA_HTTP_REQUEST",
            "taskType": "HttpRequestNode",
            "dependencies": ["MAIN_CALL_LLM"]
        },
        {
            "@type": "com.xiaohongshu.data.aimi.workflow.nodes.CodeNode",
            "taskId": "PROCESS_EXEC_CODE",
            "taskType": "CodeNode",
            "dependencies": ["DATA_HTTP_REQUEST"]
        },
        {
            "@type": "com.xiaohongshu.data.aimi.workflow.nodes.CodeNode",
            "taskId": "FINAL_EXEC_CODE",
            "taskType": "CodeNode",
            "dependencies": ["PROCESS_EXEC_CODE", "MAIN_CALL_LLM"]
        }
    ];
}

// 测试函数
function testDagParser() {
    console.log('🧪 开始测试 DAG 解析器...');
    
    // 创建测试数据
    const sampleData = createSampleDagData();
    
    // 解析数据
    const parsedData = parseDagJson(sampleData);
    
    // 验证结构
    const validation = validateDagStructure(parsedData);
    
    console.log('📊 解析结果:', parsedData);
    console.log('✅ 验证结果:', validation);
    
    return { parsedData, validation };
}

// 如果在浏览器环境中，将函数绑定到 window 对象
if (typeof window !== 'undefined') {
    window.dagParser = {
        parseDagJson,
        validateDagStructure,
        createSampleDagData,
        testDagParser
    };
} 