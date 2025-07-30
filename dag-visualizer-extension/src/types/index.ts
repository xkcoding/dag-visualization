// DAG数据类型定义
export interface DAGNode {
  id: string;
  type: string;
  label: string;
  data: {
    original: any;
    index: number;
    taskType?: string;
    color?: string;
    inputCount?: number;
    outputCount?: number;
  };
  position: { x: number; y: number };
}

export interface DAGEdge {
  id: string;
  source: string;
  target: string;
  type: string;
}

export interface DAGData {
  nodes: DAGNode[];
  edges: DAGEdge[];
  metadata: {
    totalNodes: number;
    totalEdges: number;
    processedAt: string;
  };
}

// 应用状态类型
export interface AppState {
  dagData: DAGData | null;
  jsonText: string;
  isLoading: boolean;
  error: string | null;
  fileHistory: HistoryEntry[];
}

// 历史记录类型
export interface HistoryEntry {
  id: string;
  name: string;
  data: any;
  source: 'manual' | 'file' | 'clipboard' | 'example';
  timestamp: number;
}

// 用户偏好类型
export interface UserPreferences {
  theme: 'light' | 'dark';
  autoSave: boolean;
  layoutDirection: 'horizontal' | 'vertical';
}

// 导出选项类型
export interface ExportOptions {
  includePositions: boolean;
  includeMetadata: boolean;
  simplifyData: boolean;
  fileName?: string;
}

// 任务节点类型映射
export type TaskNodeType = 'promptBuild' | 'callLLM' | 'httpRequest' | 'codeExec' | 'default'; 