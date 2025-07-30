import type { DAGData, DAGNode, DAGEdge, TaskNodeType } from '../types';

// 工作流节点接口定义
interface WorkflowNode {
  taskId: string;
  taskType: string;
  '@type': string;
  dependencies?: string[];
  input?: Array<{ fieldName: string; path?: string; value?: any }>;
  output?: Array<{ fieldName: string; path: string; required?: boolean }>;
}

// 获取节点类型样式
function getNodeTypeColor(taskType: string): string {
  const typeColorMap: Record<string, string> = {
    'PROMPT_BUILD': '#4CAF50',    // 绿色 - 提示构建
    'CALL_LLM': '#2196F3',        // 蓝色 - LLM调用
    'HttpRequestNode': '#FF9800', // 橙色 - HTTP请求
    'CodeNode': '#9C27B0',        // 紫色 - 代码执行
    'TemplateTransformNode': '#00BCD4', // 青色 - 模板转换
    'LLMNode': '#2196F3',         // 蓝色 - LLM节点
    'default': '#757575'          // 灰色 - 默认
  };
  return typeColorMap[taskType] || typeColorMap.default;
}

// 获取简化的节点类型
function getSimplifiedNodeType(taskType: string): TaskNodeType {
  if (taskType === 'PROMPT_BUILD' || taskType === 'TemplateTransformNode') {
    return 'promptBuild';
  }
  if (taskType === 'CALL_LLM' || taskType === 'LLMNode') {
    return 'callLLM';
  }
  if (taskType === 'HttpRequestNode') {
    return 'httpRequest';
  }
  if (taskType === 'CodeNode') {
    return 'codeExec';
  }
  return 'default';
}

// 自动布局算法：分层布局
function calculateNodePositions(nodes: WorkflowNode[]): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  const nodeMap = new Map<string, WorkflowNode>();
  const inDegree = new Map<string, number>();
  const layers: string[][] = [];

  // 建立节点映射和入度统计
  nodes.forEach(node => {
    nodeMap.set(node.taskId, node);
    inDegree.set(node.taskId, 0);
  });

  // 计算入度
  nodes.forEach(node => {
    if (node.dependencies) {
      node.dependencies.forEach(_dep => {
        const current = inDegree.get(node.taskId) || 0;
        inDegree.set(node.taskId, current + 1);
      });
    }
  });

  // 拓扑排序分层
  const queue: string[] = [];
  nodes.forEach(node => {
    if ((inDegree.get(node.taskId) || 0) === 0) {
      queue.push(node.taskId);
    }
  });

  while (queue.length > 0) {
    const currentLayer: string[] = [...queue];
    layers.push(currentLayer);
    queue.length = 0;

    currentLayer.forEach(nodeId => {
      const node = nodeMap.get(nodeId);
      if (node && node.dependencies) {
        // 找到依赖此节点的其他节点
        nodes.forEach(otherNode => {
          if (otherNode.dependencies?.includes(nodeId)) {
            const degree = inDegree.get(otherNode.taskId) || 0;
            inDegree.set(otherNode.taskId, degree - 1);
            if (degree - 1 === 0) {
              queue.push(otherNode.taskId);
            }
          }
        });
      }
    });
  }

  // 计算位置
  const layerHeight = 120;
  const horizontalSpacing = 250;

  layers.forEach((layer, layerIndex) => {
    const layerY = layerIndex * layerHeight;
    layer.forEach((nodeId, nodeIndex) => {
      const totalNodesInLayer = layer.length;
      const startX = -(totalNodesInLayer - 1) * horizontalSpacing / 2;
      const nodeX = startX + nodeIndex * horizontalSpacing;
      
      positions[nodeId] = {
        x: nodeX,
        y: layerY
      };
    });
  });

  return positions;
}

// 解析JSON工作流数据
export function parseWorkflowToDAG(jsonData: any): DAGData {
  try {
    // 确保输入是数组
    const workflowNodes: WorkflowNode[] = Array.isArray(jsonData) ? jsonData : [jsonData];
    
    if (workflowNodes.length === 0) {
      throw new Error('工作流数据为空');
    }

    // 验证节点结构
    workflowNodes.forEach((node, index) => {
      if (!node.taskId) {
        throw new Error(`节点 ${index + 1} 缺少 taskId 字段`);
      }
    });

    // 计算节点位置
    const positions = calculateNodePositions(workflowNodes);

    // 转换为DAG节点
    const dagNodes: DAGNode[] = workflowNodes.map((node, index) => {
      const nodeType = getSimplifiedNodeType(node.taskType);
      const position = positions[node.taskId] || { x: 0, y: index * 100 };
      
      return {
        id: node.taskId,
        type: nodeType,
        label: node.taskId.replace(/_/g, ' '),
        data: {
          original: node,
          index: index,
          taskType: node.taskType,
          color: getNodeTypeColor(node.taskType),
          inputCount: node.input?.length || 0,
          outputCount: node.output?.length || 0
        },
        position
      };
    });

    // 生成边（连接线）
    const dagEdges: DAGEdge[] = [];
    workflowNodes.forEach(node => {
      if (node.dependencies && node.dependencies.length > 0) {
        node.dependencies.forEach(depId => {
          // 验证依赖节点是否存在
          const sourceNode = workflowNodes.find(n => n.taskId === depId);
          if (sourceNode) {
            dagEdges.push({
              id: `${depId}->${node.taskId}`,
              source: depId,
              target: node.taskId,
              type: 'smoothstep'
            });
          }
        });
      }
    });

    return {
      nodes: dagNodes,
      edges: dagEdges,
      metadata: {
        totalNodes: dagNodes.length,
        totalEdges: dagEdges.length,
        processedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('DAG数据解析错误:', error);
    throw new Error(`DAG数据解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 验证JSON数据是否为有效的工作流格式
export function validateWorkflowData(jsonData: any): { isValid: boolean; error?: string } {
  try {
    if (!jsonData) {
      return { isValid: false, error: 'JSON数据为空' };
    }

    const nodes = Array.isArray(jsonData) ? jsonData : [jsonData];
    
    if (nodes.length === 0) {
      return { isValid: false, error: '工作流节点数量为0' };
    }

    // 检查必需字段
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node.taskId) {
        return { isValid: false, error: `节点 ${i + 1} 缺少 taskId 字段` };
      }
      if (!node.taskType && !node['@type']) {
        return { isValid: false, error: `节点 ${i + 1} 缺少 taskType 或 @type 字段` };
      }
    }

    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: `验证失败: ${error instanceof Error ? error.message : '未知错误'}` 
    };
  }
}

// 生成示例数据
export function generateExampleData(): any {
  return [
    {
      "@type": "com.example.workflow.nodes.StartNode",
      "taskId": "START_NODE",
      "taskType": "START",
      "input": [],
      "output": [{ "fieldName": "initData", "path": "$.data" }],
      "dependencies": []
    },
    {
      "@type": "com.example.workflow.nodes.ProcessNode", 
      "taskId": "DATA_PROCESSING",
      "taskType": "PROMPT_BUILD",
      "input": [{ "fieldName": "rawData", "path": "session.START_NODE.initData" }],
      "output": [{ "fieldName": "processedData", "path": "$.result" }],
      "dependencies": ["START_NODE"]
    },
    {
      "@type": "com.example.workflow.nodes.LLMNode",
      "taskId": "AI_ANALYSIS", 
      "taskType": "CALL_LLM",
      "input": [{ "fieldName": "data", "path": "session.DATA_PROCESSING.processedData" }],
      "output": [{ "fieldName": "analysis", "path": "$.analysis" }],
      "dependencies": ["DATA_PROCESSING"]
    },
    {
      "@type": "com.example.workflow.nodes.HttpNode",
      "taskId": "API_CALL",
      "taskType": "HttpRequestNode", 
      "input": [{ "fieldName": "payload", "path": "session.AI_ANALYSIS.analysis" }],
      "output": [{ "fieldName": "response", "path": "$.response" }],
      "dependencies": ["AI_ANALYSIS"]
    },
    {
      "@type": "com.example.workflow.nodes.EndNode",
      "taskId": "END_NODE",
      "taskType": "CodeNode",
      "input": [{ "fieldName": "finalData", "path": "session.API_CALL.response" }],
      "output": [],
      "dependencies": ["API_CALL"]
    }
  ];
} 