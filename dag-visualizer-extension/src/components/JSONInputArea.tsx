import React, { useState, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useApp } from '../context/AppContext';

const JSONInputArea: React.FC = () => {
  const { state, dispatch, loadDAGData } = useApp();
  const [isValid, setIsValid] = useState(true);
  const [validationError, setValidationError] = useState('');
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
  };

  // 处理文本输入变化
  const handleTextChange = useCallback(async (value: string | undefined) => {
    const newValue = value || '';
    dispatch({ type: 'SET_JSON_TEXT', payload: newValue });
    
    if (newValue.trim() === '') {
      setIsValid(true);
      setValidationError('');
      return;
    }
    
    // 实时验证JSON格式
    try {
      JSON.parse(newValue);
      setIsValid(true);
      setValidationError('');
      
      // 自动解析和可视化（可选，可设置防抖）
      await loadDAGData(JSON.parse(newValue));
    } catch (error) {
      setIsValid(false);
      setValidationError(`JSON格式错误: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        setValidationError(`文件读取失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          >
            🎨 格式化
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
          字符数: {state.jsonText.length} | 行数: {state.jsonText.split('\n').length}
        </div>
      </div>
    </div>
  );
};

export default JSONInputArea; 