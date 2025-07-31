import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ImageExportDialog from './ImageExportDialog';
import type { ImageExportOptions } from '../types';

const Toolbar: React.FC = () => {
  const { loadExampleData, loadLocalFile, exportDAGConfig, exportImage, clearCanvas, state } = useApp();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const handleLoadLocalFile = async () => {
    try {
      await loadLocalFile();
    } catch (error) {
      console.error('加载本地文件失败:', error);
    }
  };

  const handleLoadExampleData = async () => {
    try {
      await loadExampleData();
    } catch (error) {
      console.error('加载示例数据失败:', error);
    }
  };

  const handleExportConfig = () => {
    exportDAGConfig();
  };

  const handleClearCanvas = () => {
    if (state.dagData && window.confirm('确定要清空画布吗？这将删除当前的所有数据。')) {
      clearCanvas();
    } else if (!state.dagData) {
      clearCanvas(); // 如果没有数据就直接清空
    }
  };

  const handleExportImage = () => {
    setIsExportDialogOpen(true);
  };

  const handleImageExport = async (options: ImageExportOptions) => {
    try {
      await exportImage(options);
      setIsExportDialogOpen(false);
    } catch (error) {
      // 错误已经在 AppContext 中处理了，这里不需要额外处理
      console.error('图片导出失败:', error);
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <div className="app-title">
          <h1>🔗 DAG 配置快速验证</h1>
          <div className="app-meta">
            <span className="author">作者：柏玄</span>
            <span className="tool">开发工具：Cursor</span>
          </div>
        </div>
      </div>
      
      <div className="toolbar-right">
        <div className="toolbar-section">
          <div className="toolbar-buttons">
            <button 
              className="toolbar-btn"
              onClick={handleLoadLocalFile}
              disabled={state.isLoading}
              title="从本地加载JSON文件"
            >
              <span className="btn-icon">📁</span>
              加载本地文件
            </button>
            
            <button 
              className="toolbar-btn"
              onClick={handleLoadExampleData}
              disabled={state.isLoading}
              title="加载示例DAG数据"
            >
              <span className="btn-icon">📋</span>
              加载示例数据
            </button>
            
            <button 
              className="toolbar-btn"
              onClick={handleExportConfig}
              disabled={state.isLoading || !state.dagData}
              title="导出当前配置"
            >
              <span className="btn-icon">💾</span>
              导出配置
            </button>
            
            <button 
              className="toolbar-btn"
              onClick={handleExportImage}
              disabled={state.isLoading || !state.dagData}
              title="导出图片 (Ctrl+E)"
            >
              <span className="btn-icon">📸</span>
              导出图片
            </button>
            
            <button 
              className="toolbar-btn danger"
              onClick={handleClearCanvas}
              disabled={state.isLoading}
              title="清空画布"
            >
              <span className="btn-icon">🗑️</span>
              清空画布
            </button>
          </div>
        </div>
        
        {state.isLoading && (
          <div className="toolbar-loading">
            <span className="loading-text">处理中...</span>
          </div>
        )}
      </div>
      
      <ImageExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        onExport={handleImageExport}
        isExporting={state.isExporting}
      />
    </div>
  );
};

export default Toolbar; 