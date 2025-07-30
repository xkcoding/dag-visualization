import React, { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';

const JSONInputArea: React.FC = () => {
  const { state, dispatch, loadDAGData } = useApp();
  const [isValid, setIsValid] = useState(true);
  const [validationError, setValidationError] = useState('');

  // 处理文本输入变化
  const handleTextChange = useCallback(async (value: string) => {
    dispatch({ type: 'SET_JSON_TEXT', payload: value });
    
    if (value.trim() === '') {
      setIsValid(true);
      setValidationError('');
      return;
    }
    
    // 实时验证JSON格式
    try {
      JSON.parse(value);
      setIsValid(true);
      setValidationError('');
      
      // 自动解析和可视化（可选，可设置防抖）
      await loadDAGData(JSON.parse(value));
    } catch (error) {
      setIsValid(false);
      setValidationError(`JSON格式错误: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [dispatch, loadDAGData]);

  // 剪贴板粘贴处理
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText.trim()) {
          await handleTextChange(clipboardText);
        } else {
          alert('剪贴板内容为空');
        }
      } else {
        alert('浏览器不支持剪贴板API，请使用 Ctrl+V 或右键粘贴JSON内容到文本框中');
      }
    } catch (error) {
      alert('剪贴板访问失败，请使用 Ctrl+V 或右键粘贴JSON内容到文本框中');
    }
  };

  // 文件选择处理
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const content = await file.text();
        await handleTextChange(content);
      } catch (error) {
        setValidationError(`文件读取失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsValid(false);
      }
    }
  };

  return (
    <div className="json-input-container">
      <div className="input-header">
        <span>JSON输入</span>
        <div className="input-actions">
          <button 
            onClick={handlePasteFromClipboard}
            className="paste-btn"
            title="从剪贴板粘贴"
          >
            📋 粘贴
          </button>
          <label className="file-input-label" title="选择本地文件">
            📁 文件
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>
      
      <textarea
        value={state.jsonText}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder={`在此粘贴DAG JSON配置...

示例格式:
{
  "tasks": [
    {
      "taskId": "task1",
      "taskType": "PROMPT_BUILD",
      "dependencies": []
    }
  ]
}`}
        className={`json-editor ${!isValid ? 'error' : ''}`}
        spellCheck={false}
      />
      
      {!isValid && (
        <div className="error-message">
          ❌ {validationError}
        </div>
      )}
      
      <div className="input-footer">
        <div className={`status ${isValid ? 'valid' : 'invalid'}`}>
          {isValid ? '✅ JSON格式正确' : '❌ JSON格式错误'}
        </div>
        <div className="text-stats">
          字符数: {state.jsonText.length}
        </div>
      </div>
    </div>
  );
};

export default JSONInputArea; 