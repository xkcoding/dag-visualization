import React, { useState, useCallback, useRef } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { useApp } from '../context/AppContext';
import { validateWorkflowData } from '../utils/dagDataProcessor';
import ConfirmDialog from './ConfirmDialog';

// 配置Monaco Editor使用本地资源
loader.config({
  paths: {
    vs: '/monaco-editor/min/vs'
  }
});

const JSONInputArea: React.FC = () => {
  const { state, dispatch, loadDAGData, clearCanvas } = useApp();
  const [isValid, setIsValid] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const editorRef = useRef<any>(null);

  // Monaco Editor配置
  const editorOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on' as const,
    lineNumbers: 'on' as const,
    lineNumbersMinChars: 3, // 减少行号列宽度
    formatOnPaste: true,
    formatOnType: true,
    automaticLayout: true,
    fontSize: 12, // 减小字体大小
    fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
    tabSize: 2,
    insertSpaces: true,
    folding: false, // 禁用代码折叠以节省空间
    bracketPairColorization: {
      enabled: true,
    },
    suggest: {
      showKeywords: true,
    },
    scrollbar: {
      vertical: 'auto' as const,
      horizontal: 'auto' as const,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    glyphMargin: false, // 移除左侧glyph边距
    lineDecorationsWidth: 8, // 增加行号和代码之间的间距
    renderLineHighlight: 'line' as const,
        // 简洁的提示文本，避免格式化问题
    placeholder: `// 📝 请输入JSON数据或点击上方「加载示例数据」`,
  };



  // 处理文本输入变化
  const handleTextChange = useCallback(async (value: string | undefined) => {
    const newValue = value || '';
    dispatch({ type: 'SET_JSON_TEXT', payload: newValue });
    
    if (newValue.trim() === '') {
      setIsValid(true);
      dispatch({ type: 'SET_ERROR', payload: null });
      return;
    }
    
    // 实时验证JSON格式和工作流数据
    try {
      const parsedData = JSON.parse(newValue);
      
      // 验证工作流数据格式
      const validation = validateWorkflowData(parsedData);
      if (!validation.isValid) {
        setIsValid(false);
        // 将错误信息传递给右侧可视化区域
        dispatch({ type: 'SET_ERROR', payload: validation.error || 'JSON数据验证失败' });
        return;
      }
      
      setIsValid(true);
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // 自动解析和可视化
      await loadDAGData(parsedData);
    } catch (error) {
      setIsValid(false);
      const errorMsg = `JSON格式错误: ${error instanceof Error ? error.message : 'Unknown error'}`;
      // 将错误信息传递给右侧可视化区域
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
    }
  }, [dispatch, loadDAGData]);

  // Monaco Editor挂载完成
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // 设置JSON验证
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [],
      enableSchemaRequest: false,
    });

    // 添加快捷键
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      handlePasteFromClipboard();
    });
  };

  // 剪贴板粘贴处理
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText.trim()) {
          // 设置编辑器内容
          if (editorRef.current) {
            editorRef.current.setValue(clipboardText);
          }
          await handleTextChange(clipboardText);
        } else {
          alert('剪贴板内容为空');
        }
      } else {
        alert('浏览器不支持剪贴板API，请使用 Ctrl+V 或右键粘贴JSON内容到编辑器中');
      }
    } catch (error) {
      alert('剪贴板访问失败，请使用 Ctrl+V 或右键粘贴JSON内容到编辑器中');
    }
  };

  // 文件选择处理
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const content = await file.text();
        // 设置编辑器内容
        if (editorRef.current) {
          editorRef.current.setValue(content);
        }
        await handleTextChange(content);
      } catch (error) {
        const errorMsg = `文件读取失败: ${error instanceof Error ? error.message : 'Unknown error'}`;
        dispatch({ type: 'SET_ERROR', payload: errorMsg });
        setIsValid(false);
      }
    }
  };

  // 格式化JSON
  const handleFormatJSON = () => {
    if (editorRef.current && state.jsonText.trim()) {
      try {
        const parsed = JSON.parse(state.jsonText);
        const formatted = JSON.stringify(parsed, null, 2);
        editorRef.current.setValue(formatted);
        handleTextChange(formatted);
      } catch (error) {
        alert('JSON格式错误，无法格式化');
      }
    }
  };

  // 清空编辑器
  const handleClearEditor = () => {
    setShowClearConfirm(true);
  };

  const confirmClearEditor = () => {
    if (editorRef.current) {
      editorRef.current.setValue('');
    }
    // 清空JSON输入和画布数据
    clearCanvas();
    setIsValid(true);
    setShowClearConfirm(false);
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
          <button 
            onClick={handleFormatJSON}
            className="format-btn"
            title="格式化JSON"
            disabled={!state.jsonText.trim()}
          >
            🎨 格式化
          </button>
          <button 
            onClick={handleClearEditor}
            className="clear-btn"
            title="清空编辑器"
            disabled={!state.jsonText.trim()}
          >
            🗑️ 清空
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
      
      <div className={`editor-container ${!isValid ? 'error' : ''}`}>
        <Editor
          height="100%"
          defaultLanguage="json"
          value={state.jsonText}
          onChange={handleTextChange}
          onMount={handleEditorDidMount}
          options={editorOptions}
          theme="vs"
          loading={<div className="editor-loading">🚀 正在加载Monaco编辑器...</div>}
        />
      </div>
      
      {/* 移除左侧错误显示，错误将在右侧可视化区域展示 */}
      
      <div className="input-footer">
        <div className={`status ${state.jsonText.trim() === '' ? 'empty' : (isValid ? 'valid' : 'invalid')}`}>
          {state.jsonText.trim() === '' 
            ? '📝 请输入JSON数据或点击上方「加载示例数据」' 
            : (isValid ? '✅ JSON格式正确' : '❌ JSON格式错误')
          }
        </div>
        <div className="text-stats">
          字符数: {state.jsonText.length} | 行数: {state.jsonText.split('\n').length}
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="清空JSON输入"
        message="确定要清空当前的JSON输入内容吗？此操作不可撤销。"
        confirmText="清空"
        cancelText="取消"
        type="danger"
        onConfirm={confirmClearEditor}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};

export default JSONInputArea; 