import React, { createContext, useContext, useReducer, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppState, DAGData, HistoryEntry, ImageExportOptions } from '../types';
import { parseWorkflowToDAG, validateWorkflowData, generateExampleData } from '../utils/dagDataProcessor';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import { generateTimestamp } from '../utils/timeUtils';

// 状态操作类型
type AppAction =
  | { type: 'SET_DAG_DATA'; payload: DAGData }
  | { type: 'SET_JSON_TEXT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILE_HISTORY'; payload: HistoryEntry[] }
  | { type: 'SET_EXPORTING'; payload: boolean }
  | { type: 'CLEAR_ALL' };

// 初始状态
const initialState: AppState = {
  dagData: null,
  jsonText: '',
  isLoading: false,
  error: null,
  fileHistory: [],
  isExporting: false
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
    case 'SET_EXPORTING':
      return { ...state, isExporting: action.payload };
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
  exportImage: (options: ImageExportOptions) => Promise<void>;
  clearCanvas: () => void;
  loadExampleData: () => Promise<void>;
  loadLocalFile: () => Promise<void>;
  setReactFlowInstance: (instance: any) => void;
}

// 创建Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Context Provider组件
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // 业务逻辑函数
  const loadDAGData = async (data: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      // 验证数据格式
      const validation = validateWorkflowData(data);
      if (!validation.isValid) {
        throw new Error(validation.error || '数据格式无效');
      }

      // 解析为DAG格式
      const dagData = parseWorkflowToDAG(data);
      
      // 更新状态
      dispatch({ type: 'SET_DAG_DATA', payload: dagData });
      
      // 添加到历史记录
      const historyEntry: HistoryEntry = {
        id: `history_${Date.now()}`,
        name: `数据_${new Date().toLocaleString()}`,
        data: data,
        source: 'manual',
        timestamp: Date.now()
      };
      
      const newHistory = [historyEntry, ...state.fileHistory.slice(0, 9)]; // 保留最近10条
      dispatch({ type: 'SET_FILE_HISTORY', payload: newHistory });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '数据处理失败';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('DAG数据加载错误:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const exportDAGConfig = () => {
    try {
      if (!state.dagData) {
        alert('没有可导出的数据');
        return;
      }

      // 从DAG数据中恢复原始工作流格式，但清空 input/output
      const exportNodes = state.dagData.nodes.map(node => {
        const original = node.data.original;
        return {
          "@type": original["@type"] || `com.example.workflow.nodes.${node.data.taskType}Node`,
          "taskId": original.taskId,
          "taskType": original.taskType,
          "input": [], // 清空input参数
          "output": [], // 清空output参数
          "dependencies": original.dependencies || []
        };
      });

      const dataStr = JSON.stringify(exportNodes, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // 生成当前时间戳作为文件名后缀
      const timestamp = generateTimestamp();
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `dag_workflow_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('DAG工作流已导出');
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const exportImage = async (options: ImageExportOptions) => {
    dispatch({ type: 'SET_EXPORTING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      if (!state.dagData) {
        throw new Error('没有可导出的数据');
      }

      // 获取 ReactFlow 容器
      const reactFlowElement = document.querySelector('.react-flow') as HTMLElement;
      if (!reactFlowElement) {
        throw new Error('无法找到可视化容器');
      }

      // 使用存储的ReactFlow实例来调整视图
      
      // 临时隐藏Controls和MiniMap组件以获得纯净的图表
      const controlsElement = document.querySelector('.react-flow__controls') as HTMLElement;
      const miniMapElement = document.querySelector('.react-flow__minimap') as HTMLElement;
      
      // 保存原始显示状态
      const originalControlsDisplay = controlsElement?.style.display || '';
      const originalMiniMapDisplay = miniMapElement?.style.display || '';
      
      // 隐藏Controls和MiniMap
      if (controlsElement) controlsElement.style.display = 'none';
      if (miniMapElement) miniMapElement.style.display = 'none';

      // 调整视图使内容完全居中
      if (reactFlowInstance && reactFlowInstance.fitView) {
        // 先进行fitView调整
        reactFlowInstance.fitView({
          padding: 0.2, // 20%的边距，确保四周均匀
          includeHiddenNodes: false,
          duration: 0
        });
        
        // 等待更长时间确保视图调整完成
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 再次调用fitView确保居中
        reactFlowInstance.fitView({
          padding: 0.2,
          includeHiddenNodes: false,
          duration: 0
        });
        
        // 再等待一段时间确保第二次调整生效
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 强制触发重新渲染
        const viewport = reactFlowInstance.getViewport();
        console.log('导出前的视口信息:', viewport);
        
        // 如果有setViewport方法，使用当前视口重新设置以强制渲染
        if (reactFlowInstance.setViewport) {
          reactFlowInstance.setViewport(viewport, { duration: 0 });
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      try {
        let dataUrl: string;
        const exportOptions = {
          width: options.width,
          height: options.height,
          backgroundColor: options.backgroundColor === 'transparent' ? undefined : options.backgroundColor,
          // 添加过滤器，只捕获主要内容，排除UI控制元素
          filter: (node: HTMLElement) => {
            // 排除Controls和MiniMap相关的元素
            if (node.classList && (
              node.classList.contains('react-flow__controls') ||
              node.classList.contains('react-flow__minimap') ||
              node.classList.contains('react-flow__attribution')
            )) {
              return false;
            }
            return true;
          },
          // 添加其他选项确保正确捕获
          useCORS: true,
          allowTaint: true,
          // 确保捕获当前视图状态
          skipAutoScale: true
        };

        // 根据格式调用不同的导出函数
        switch (options.format) {
          case 'png':
            dataUrl = await toPng(reactFlowElement, exportOptions);
            break;
          case 'jpg':
            dataUrl = await toJpeg(reactFlowElement, {
              ...exportOptions,
              quality: options.quality,
              backgroundColor: options.backgroundColor || '#ffffff', // JPG 不支持透明
            });
            break;
          case 'svg':
            dataUrl = await toSvg(reactFlowElement, {
              width: options.width,
              height: options.height,
              filter: exportOptions.filter,
            });
            break;
          default:
            throw new Error(`不支持的导出格式: ${options.format}`);
        }

        // 下载文件
        const link = document.createElement('a');
        link.download = `${options.filename}.${options.format}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`图片已导出: ${options.filename}.${options.format}`);
      } finally {
        // 恢复Controls和MiniMap的显示状态
        if (controlsElement) controlsElement.style.display = originalControlsDisplay;
        if (miniMapElement) miniMapElement.style.display = originalMiniMapDisplay;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '图片导出失败';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('图片导出错误:', error);
      throw error; // 重新抛出错误，让调用者处理
    } finally {
      dispatch({ type: 'SET_EXPORTING', payload: false });
    }
  };

  const clearCanvas = () => {
    dispatch({ type: 'CLEAR_ALL' });
    console.log('画布已清空');
  };

  const loadExampleData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const exampleData = generateExampleData();
      const jsonString = JSON.stringify(exampleData, null, 2);
      
      // 更新JSON文本
      dispatch({ type: 'SET_JSON_TEXT', payload: jsonString });
      
      // 加载数据
      await loadDAGData(exampleData);
      
      console.log('示例数据已加载');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载示例数据失败';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('加载示例数据错误:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadLocalFile = async () => {
    try {
      // 创建文件输入元素
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      return new Promise<void>((resolve, reject) => {
        input.onchange = async (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (!file) {
            reject(new Error('没有选择文件'));
            return;
          }

          dispatch({ type: 'SET_LOADING', payload: true });
          
          try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // 更新JSON文本
            dispatch({ type: 'SET_JSON_TEXT', payload: text });
            
            // 加载数据
            await loadDAGData(data);
            
            // 添加到历史记录
            const historyEntry: HistoryEntry = {
              id: `file_${Date.now()}`,
              name: file.name,
              data: data,
              source: 'file',
              timestamp: Date.now()
            };
            
            const newHistory = [historyEntry, ...state.fileHistory.slice(0, 9)];
            dispatch({ type: 'SET_FILE_HISTORY', payload: newHistory });
            
            console.log('本地文件已加载:', file.name);
            resolve();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '文件解析失败';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            console.error('文件加载错误:', error);
            reject(error);
          } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        };
        
        input.oncancel = () => {
          resolve(); // 用户取消选择文件时正常结束
        };
        
        input.click();
      });
    } catch (error) {
      console.error('本地文件加载错误:', error);
      alert('文件加载失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    loadDAGData,
    exportDAGConfig,
    exportImage,
    clearCanvas,
    loadExampleData,
    loadLocalFile,
    setReactFlowInstance: (instance: any) => setReactFlowInstance(instance)
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