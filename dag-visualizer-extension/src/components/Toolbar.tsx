import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ImageExportDialog from './ImageExportDialog';
import ConfirmDialog from './ConfirmDialog';
import type { ImageExportOptions } from '../types';

const Toolbar: React.FC = () => {
  const { loadExampleData, loadLocalFile, exportDAGConfig, exportImage, clearCanvas, state } = useApp();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [showClearCanvasConfirm, setShowClearCanvasConfirm] = useState(false);

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
    if (state.dagData) {
      setShowClearCanvasConfirm(true);
    } else {
      clearCanvas(); // 如果没有数据就直接清空
    }
  };

  const confirmClearCanvas = () => {
    clearCanvas();
    setShowClearCanvasConfirm(false);
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
          <h1>
            <span className="app-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            DAG Visualizer
          </h1>
          <div className="app-meta">
            <span className="app-subtitle">专业的工作流可视化工具</span>
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
      
      <ConfirmDialog
        isOpen={showClearCanvasConfirm}
        title="清空画布"
        message="确定要清空画布吗？这将删除当前的所有节点、连线和可视化数据，且操作不可撤销。"
        confirmText="清空画布"
        cancelText="取消"
        type="danger"
        onConfirm={confirmClearCanvas}
        onCancel={() => setShowClearCanvasConfirm(false)}
      />
    </div>
  );
};

export default Toolbar; 