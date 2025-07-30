// 节点类型管理器 - 智能节点创建的核心工具
export interface NodeTypeDefinition {
  id: string;
  label: string;
  description: string;
  icon: string;
  defaultColor: string;
  className: string;
  template: {
    taskType: string;
    '@type': string;
    input: any[];
    output: any[];
    dependencies: string[];
  };
}

// 4种默认节点类型（基于dag-question-rewrite-rerank.json）
export const DEFAULT_NODE_TYPES: NodeTypeDefinition[] = [
  {
    id: 'PROMPT_BUILD',
    label: '提示构建',
    description: '构建和处理提示模板',
    icon: '🔧',
    defaultColor: '#4ade80', // 绿色 - 构建类
    className: 'node-prompt-build',
    template: {
      taskType: 'PROMPT_BUILD',
      '@type': 'com.xiaohongshu.data.aimi.workflow.nodes.TemplateTransformNode',
      input: [], // 简化为空数组
      output: [], // 简化为空数组
      dependencies: []
    }
  },
  {
    id: 'CALL_LLM',
    label: 'LLM调用',
    description: '调用大语言模型处理',
    icon: '🤖',
    defaultColor: '#3b82f6', // 蓝色 - AI类
    className: 'node-call-llm',
    template: {
      taskType: 'CALL_LLM',
      '@type': 'com.xiaohongshu.data.aimi.workflow.nodes.LLMNode',
      input: [], // 简化为空数组
      output: [], // 简化为空数组
      dependencies: []
    }
  },
  {
    id: 'HTTP_REQUEST',
    label: 'HTTP请求',
    description: '发送HTTP请求获取数据',
    icon: '🌐',
    defaultColor: '#f59e0b', // 橙色 - 网络类
    className: 'node-http-request',
    template: {
      taskType: 'HttpRequestNode',
      '@type': 'com.xiaohongshu.data.aimi.workflow.nodes.HttpRequestNode',
      input: [], // 简化为空数组
      output: [], // 简化为空数组
      dependencies: []
    }
  },
  {
    id: 'CODE_EXEC',
    label: '代码执行',
    description: '执行自定义代码逻辑',
    icon: '💻',
    defaultColor: '#8b5cf6', // 紫色 - 计算类
    className: 'node-code-exec',
    template: {
      taskType: 'CodeNode',
      '@type': 'com.xiaohongshu.data.aimi.workflow.nodes.CodeNode',
      input: [], // 简化为空数组
      output: [], // 简化为空数组
      dependencies: []
    }
  }
];

// 颜色管理系统
export class ColorManager {
  // 预定义的随机颜色池（语义化色彩）
  private static readonly RANDOM_COLORS = [
    '#ef4444', // 红色
    '#f97316', // 橙色  
    '#eab308', // 黄色
    '#22c55e', // 绿色
    '#06b6d4', // 青色
    '#3b82f6', // 蓝色
    '#6366f1', // 靛蓝色
    '#8b5cf6', // 紫色
    '#ec4899', // 粉色
    '#64748b', // 灰色
  ];

  // 获取节点类型的默认颜色
  static getDefaultColor(nodeType: string): string {
    const nodeTypeDefinition = DEFAULT_NODE_TYPES.find(type => type.id === nodeType);
    return nodeTypeDefinition?.defaultColor || '#64748b';
  }

  // 生成随机颜色
  static generateRandomColor(): string {
    const randomIndex = Math.floor(Math.random() * this.RANDOM_COLORS.length);
    return this.RANDOM_COLORS[randomIndex];
  }

  // 验证颜色格式（十六进制）
  static isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  // 获取颜色的对比文字颜色
  static getContrastTextColor(backgroundColor: string): string {
    // 简化的对比度计算
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  }
}

// 节点创建配置接口
export interface NodeCreationConfig {
  id: string;
  label: string;
  nodeType: string;
  position: { x: number; y: number };
  color?: string;
  customProperties?: {
    isCustomType?: boolean;
    customNodeType?: string;
    [key: string]: any;
  };
}

// 节点创建工厂
export class NodeFactory {
  // 创建新节点
  static createNode(config: NodeCreationConfig): any {
    let nodeTypeDef = DEFAULT_NODE_TYPES.find(type => type.id === config.nodeType);
    
    // 如果没有找到预定义类型，创建自定义类型定义
    if (!nodeTypeDef && config.customProperties?.isCustomType) {
      nodeTypeDef = {
        id: config.customProperties.customNodeType,
        label: config.customProperties.customNodeType,
        description: '自定义节点',
        icon: '⚙️', // 自定义类型使用固定图标
        defaultColor: '#64748b',
        className: 'node-custom',
        template: {
          taskType: config.customProperties.customNodeType,
          '@type': `custom.node.${config.customProperties.customNodeType}`,
          input: [],
          output: [],
          dependencies: []
        }
      };
    }
    
    if (!nodeTypeDef) {
      throw new Error(`未知的节点类型: ${config.nodeType}`);
    }

    // 确定节点颜色
    const finalColor = config.color || 
                      ColorManager.getDefaultColor(config.nodeType);

    // 生成唯一的taskId（使用用户输入的label作为taskId）
    const taskId = config.label.trim();

    // 创建ReactFlow节点
    const reactFlowNode = {
      id: taskId, // 使用taskId作为节点ID
      type: 'custom', // 使用自定义节点类型
      position: config.position,
      data: {
        label: taskId, // label就是taskId
        taskId: taskId,
        taskType: nodeTypeDef.template.taskType,
        '@type': nodeTypeDef.template['@type'],
        input: [...nodeTypeDef.template.input],
        output: [...nodeTypeDef.template.output],
        dependencies: [...nodeTypeDef.template.dependencies],
        nodeTypeId: config.nodeType,
        icon: nodeTypeDef.icon,
        color: finalColor,
        textColor: ColorManager.getContrastTextColor(finalColor),
        className: nodeTypeDef.className,
        isCustomType: config.customProperties?.isCustomType || false,
        ...config.customProperties
      }
    };

    return reactFlowNode;
  }

  // 获取所有可用的节点类型
  static getAvailableNodeTypes(): NodeTypeDefinition[] {
    return [...DEFAULT_NODE_TYPES];
  }

  // 根据节点类型ID获取定义
  static getNodeTypeDefinition(nodeTypeId: string): NodeTypeDefinition | undefined {
    return DEFAULT_NODE_TYPES.find(type => type.id === nodeTypeId);
  }
}

// 导出类型定义已在上面interface前直接使用export完成 