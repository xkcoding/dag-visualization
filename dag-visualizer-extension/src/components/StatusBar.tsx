import React from 'react';
import { useApp } from '../context/AppContext';

const StatusBar: React.FC = () => {
  const { state } = useApp();

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusColor = () => {
    if (state.error) return '#f44336';
    if (state.isLoading) return '#ff9800';
    if (state.dagData) return '#4caf50';
    return '#9e9e9e';
  };

  const getStatusText = () => {
    if (state.error) return '错误';
    if (state.isLoading) return '处理中';
    if (state.dagData) return '就绪';
    return '等待数据';
  };

  const getNodeTypeStats = () => {
    if (!state.dagData || !state.dagData.nodes) return null;
    
    const typeCount: Record<string, number> = {};
    state.dagData.nodes.forEach(node => {
      const taskType = node.data?.taskType || 'unknown';
      typeCount[taskType] = (typeCount[taskType] || 0) + 1;
    });
    
    return typeCount;
  };

  const nodeTypeStats = getNodeTypeStats();

  return (
    <div className="status-bar">
      <div className="status-left">
        <div className="status-indicator">
          <div 
            className="status-dot" 
            style={{ backgroundColor: getStatusColor() }}
          ></div>
          <span className="status-text">{getStatusText()}</span>
        </div>
        
        {state.error && (
          <div className="error-indicator" title={state.error}>
            ⚠️ {state.error.length > 50 ? state.error.substring(0, 50) + '...' : state.error}
          </div>
        )}
      </div>
      
      <div className="status-center">
        <div className="stats-group">
          <div className="stat-item">
            <span className="stat-label">节点:</span>
            <span className="stat-value">{state.dagData?.metadata.totalNodes || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">连线:</span>
            <span className="stat-value">{state.dagData?.metadata.totalEdges || 0}</span>
          </div>
          
          {nodeTypeStats && Object.keys(nodeTypeStats).length > 1 && (
            <div className="stat-item">
              <span className="stat-label">类型:</span>
              <span className="stat-value">{Object.keys(nodeTypeStats).length}</span>
            </div>
          )}
        </div>
        
        {nodeTypeStats && (
          <div className="type-breakdown">
            {Object.entries(nodeTypeStats).map(([type, count]) => (
              <span key={type} className="type-stat" title={`${type}: ${count}个`}>
                {type.split('_')[0]}: {count}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="status-right">
        {state.dagData?.metadata.processedAt && (
          <div className="timestamp">
            <span className="timestamp-label">更新:</span>
            <span className="timestamp-value">
              {formatTime(state.dagData.metadata.processedAt)}
            </span>
          </div>
        )}
        

        
        <div className="app-info">
          <div className="brand-info">
            <a 
              href="https://github.com/xkcoding" 
              target="_blank" 
              rel="noopener noreferrer"
              className="developer-link"
              title="🔥 点击 Follow @xkcoding 获取更多开源项目"
            >
              柏玄 (Follow↗)
            </a>
            <span className="separator">•</span>
            <a 
              href="https://github.com/xkcoding/dag-visualization" 
              target="_blank" 
              rel="noopener noreferrer"
              className="repo-link"
              title="⭐ 点击 Star 支持项目发展"
            >
              DAG Visualizer (Star↗)
            </a>
            <span className="separator">•</span>
            <span className="tech-stack">React + TypeScript</span>
            <span className="separator">•</span>
            <span className="dev-tool">Cursor</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar; 