import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { AppState, DAGData, HistoryEntry } from '../types';

// 状态操作类型
type AppAction =
  | { type: 'SET_DAG_DATA'; payload: DAGData }
  | { type: 'SET_JSON_TEXT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILE_HISTORY'; payload: HistoryEntry[] }
  | { type: 'CLEAR_ALL' };

// 初始状态
const initialState: AppState = {
  dagData: null,
  jsonText: '',
  isLoading: false,
  error: null,
  fileHistory: []
};

// Reducer函数
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_DAG_DATA':
      return { ...state, dagData: action.payload, error: null };
    case 'SET_JSON_TEXT':
      return { ...state, jsonText: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_FILE_HISTORY':
      return { ...state, fileHistory: action.payload };
    case 'CLEAR_ALL':
      return { ...initialState };
    default:
      return state;
  }
}

// Context类型定义
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // 业务逻辑函数
  loadDAGData: (data: any) => Promise<void>;
  exportDAGConfig: () => void;
  clearCanvas: () => void;
  loadExampleData: () => Promise<void>;
}

// 创建Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Context Provider组件
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 业务逻辑函数
  const loadDAGData = async (data: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // TODO: 实现数据处理逻辑
      const processedData: DAGData = {
        nodes: [],
        edges: [],
        metadata: {
          totalNodes: 0,
          totalEdges: 0,
          processedAt: new Date().toISOString()
        }
      };
      
      dispatch({ type: 'SET_DAG_DATA', payload: processedData });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const exportDAGConfig = () => {
    // TODO: 实现导出逻辑
    console.log('Export DAG config');
  };

  const clearCanvas = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  const loadExampleData = async () => {
    // TODO: 实现示例数据加载
    console.log('Load example data');
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    loadDAGData,
    exportDAGConfig,
    clearCanvas,
    loadExampleData
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// 自定义Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}; 