import React from 'react';
import { useApp } from '../context/AppContext';

const Toolbar: React.FC = () => {
  const { exportDAGConfig, loadExampleData, clearCanvas } = useApp();

  const handleFileLoad = () => {
    // TODO: 实现文件加载逻辑
    console.log('Load file');
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <h1>🔗 DAG可视化器——柏玄（shenyangkai））</h1>
      </div>
      
      <div className="toolbar-center">
        <button onClick={handleFileLoad}>
          📁 加载本地文件
        </button>
        <button onClick={loadExampleData}>
          🧪 加载示例数据
        </button>
        <button onClick={exportDAGConfig}>
          💾 导出配置
        </button>
        <button onClick={clearCanvas} className="danger">
          🗑️ 清空画布
        </button>
      </div>
      
      <div className="toolbar-right">
        <span>v1.0</span>
      </div>
    </div>
  );
};

export default Toolbar; 