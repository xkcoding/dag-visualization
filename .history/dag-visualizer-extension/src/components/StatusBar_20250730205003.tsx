import React from 'react';
import { useApp } from '../context/AppContext';

const StatusBar: React.FC = () => {
  const { state } = useApp();

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  return (
    <div className="status-bar">
      <div className="status-info">
        {state.dagData ? (
          <>
            <span>✅ {state.dagData.metadata.totalNodes}个节点，{state.dagData.metadata.totalEdges}条连线</span>
            <span>最后更新: {formatTime(state.dagData.metadata.processedAt)}</span>
          </>
        ) : (
          <span>等待加载DAG数据...</span>
        )}
        
        {state.error && (
          <span style={{ color: '#ff4d4f' }}>
            ❌ 错误: {state.error}
          </span>
        )}
      </div>
      
      <div>
        <span>DAG可视化器 v1.0 —— made by 柏玄（沈扬凯）with Cursor</span>
      </div>
    </div>
  );
};

export default StatusBar; 