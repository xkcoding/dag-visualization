import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  useReactFlow,
  addEdge,
  applyNodeChanges,
  ConnectionLineType
} from 'reactflow';
import type { Node, Edge, Connection, NodeChange } from 'reactflow';
import 'reactflow/dist/style.css';
import { useApp } from '../context/AppContext';
import NodeCreationDialog from './NodeCreationDialog';
import { DEFAULT_NODE_TYPES, NodeFactory, ColorManager } from '../utils/nodeTypeManager';
import type { NodeTypeDefinition } from '../utils/nodeTypeManager';

const DAGVisualizer: React.FC = () => {
  const { state, dispatch, loadDAGData } = useApp();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const reactFlowInstance = useReactFlow();

  // 节点创建对话框状态
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogPosition, setDialogPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  
  // 节点编辑状态
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingNodeLabel, setEditingNodeLabel] = useState<string>('');
  const [editingNodeType, setEditingNodeType] = useState<string>('');
  const [editingNodeColor, setEditingNodeColor] = useState<string>('');
  const [editingIsCustomType, setEditingIsCustomType] = useState<boolean>(false);
  const [editingCustomNodeType, setEditingCustomNodeType] = useState<string>('');
  
  // 连线删除提示状态
  const [showDeleteHint, setShowDeleteHint] = useState<boolean>(false);

  // 当DAG数据变化时更新节点和边
  React.useEffect(() => {
    if (state.dagData) {
      const reactFlowNodes: Node[] = state.dagData.nodes.map(node => ({
        id: node.id,
        type: 'default',
        position: node.position,
        data: { 
          label: node.label,
          original: node.data.original,
          taskType: node.data.taskType,
          inputCount: node.data.inputCount,
          outputCount: node.data.outputCount
        },
        style: {
          backgroundColor: node.data.color || '#ffffff',
          color: '#ffffff',
          border: '2px solid #ffffff',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 'bold',
          minWidth: '180px',
          minHeight: '40px',
          padding: '8px'
        }
      }));
      
      const reactFlowEdges: Edge[] = state.dagData.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#94a3b8',
          width: 16,
          height: 16,
        }
      }));

      setNodes(reactFlowNodes);
      setEdges(reactFlowEdges);
    }
  }, [state.dagData, setNodes, setEdges]);

  // 更新JSON中的连线信息
  const updateConnectionsInJSON = useCallback(async (connection: Connection) => {
    if (!state.jsonText || !connection.source || !connection.target) return;
    
    try {
      const currentJson = JSON.parse(state.jsonText);
      if (Array.isArray(currentJson)) {
        const updatedJson = currentJson.map(node => {
          // 直接使用connection.target匹配taskId
          if (node.taskId === connection.target) {
            const dependencies = node.dependencies || [];
            // 直接使用connection.source作为依赖
            if (!dependencies.includes(connection.source)) {
              return {
                ...node,
                dependencies: [...dependencies, connection.source]
              };
            }
          }
          return node;
        });
        
        const jsonString = JSON.stringify(updatedJson, null, 2);
        dispatch({
          type: 'SET_JSON_TEXT',
          payload: jsonString
        });
        
        // 重新加载DAG数据
        await loadDAGData(updatedJson);
      }
    } catch (error) {
      console.error('更新连线失败:', error);
    }
  }, [state.jsonText, dispatch, loadDAGData]);

  // 处理连线删除
  const onEdgesDelete = useCallback(async (edgesToDelete: Edge[]) => {
    setEdges((eds) => eds.filter((edge) => !edgesToDelete.find(e => e.id === edge.id)));
    
    // 显示删除提示
    setShowDeleteHint(true);
    setTimeout(() => setShowDeleteHint(false), 3000);
    
    // 更新JSON配置，移除对应的dependencies
    if (state.jsonText) {
      try {
        const currentJson = JSON.parse(state.jsonText);
        if (Array.isArray(currentJson)) {
          const updatedJson = currentJson.map(node => {
            let updatedNode = { ...node };
            
            edgesToDelete.forEach(edge => {
              if (node.taskId === edge.target) {
                const dependencies = node.dependencies || [];
                updatedNode = {
                  ...updatedNode,
                  dependencies: dependencies.filter((dep: string) => dep !== edge.source)
                };
              }
            });
            
            return updatedNode;
          });
          
          const jsonString = JSON.stringify(updatedJson, null, 2);
          dispatch({
            type: 'SET_JSON_TEXT',
            payload: jsonString
          });
          
          await loadDAGData(updatedJson);
        }
      } catch (error) {
        console.error('删除连线失败:', error);
      }
    }
  }, [state.jsonText, dispatch, loadDAGData]);

  // 处理边选中事件
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    // 显示删除提示
    if (!showDeleteHint) {
      setShowDeleteHint(true);
      setTimeout(() => setShowDeleteHint(false), 3000);
    }
  }, [showDeleteHint]);

  // 处理连线
  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
    
    // 更新JSON配置中的dependencies
    updateConnectionsInJSON(connection);
  }, [setEdges, updateConnectionsInJSON]);

  // 处理节点双击编辑
  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    setEditingNodeId(node.id);
    setEditingNodeLabel(node.id); // 编辑taskId，所以初始值是node.id
    
    // 获取当前节点的实际颜色（从node.data.color或node.style获取）
    const currentColor = node.data?.color || node.style?.backgroundColor || '#64748b';
    setEditingNodeColor(currentColor);
    
    // 获取当前节点的类型信息
    const currentNodeType = node.data?.taskType || 'PROMPT_BUILD';
    const isCustomType = node.data?.isCustomType || false;
    
    if (isCustomType) {
      // 自定义类型节点，回显自定义信息
      setEditingIsCustomType(true);
      setEditingNodeType('CUSTOM');
      setEditingCustomNodeType(currentNodeType);
    } else {
      // 预定义类型节点，检查是否在预定义类型列表中
      const predefinedType = DEFAULT_NODE_TYPES.find(type => 
        type.id === currentNodeType || 
        type.template.taskType === currentNodeType
      );
      
      if (predefinedType) {
        setEditingIsCustomType(false);
        setEditingNodeType(predefinedType.id);
        setEditingCustomNodeType('');
      } else {
        // 虽然isCustomType为false，但不在预定义类型中，当作自定义类型处理
        setEditingIsCustomType(true);
        setEditingNodeType('CUSTOM');
        setEditingCustomNodeType(currentNodeType);
      }
    }
  }, []);

  // 保存节点标签编辑
  const saveNodeLabelEdit = useCallback(async () => {
    if (!editingNodeId || !editingNodeLabel.trim()) {
      setEditingNodeId(null);
      setEditingNodeLabel('');
      return;
    }

    const newTaskId = editingNodeLabel.trim();
    const oldTaskId = editingNodeId;

    // 验证taskId格式
    if (!/^[a-zA-Z0-9_-]+$/.test(newTaskId)) {
      alert('节点ID只能包含字母、数字、下划线和短横线');
      return;
    }

    // 确定最终的节点类型
    let finalNodeType = editingNodeType;
    let finalNodeTypeDef: NodeTypeDefinition | undefined;
    
    if (editingIsCustomType) {
      if (!editingCustomNodeType.trim()) {
        alert('请输入自定义节点类型名称');
        return;
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(editingCustomNodeType.trim())) {
        alert('节点类型只能包含字母、数字、下划线和短横线');
        return;
      }
      finalNodeType = editingCustomNodeType.trim().toUpperCase();
      // 创建自定义类型定义
      finalNodeTypeDef = {
        id: finalNodeType,
        label: finalNodeType,
        description: '自定义节点',
        icon: '⚙️', // 自定义类型使用固定图标
        defaultColor: editingNodeColor,
        className: 'node-custom',
        template: {
          taskType: finalNodeType,
          '@type': `custom.node.${finalNodeType}`,
          input: [],
          output: [],
          dependencies: []
        }
      };
    } else {
      finalNodeTypeDef = DEFAULT_NODE_TYPES.find(type => type.id === editingNodeType);
      if (!finalNodeTypeDef) {
        alert('未知的节点类型');
        return;
      }
    }

    // 如果taskId变化，检查新的taskId是否已存在
    if (newTaskId !== oldTaskId) {
      if (state.jsonText) {
        try {
          const currentJson = JSON.parse(state.jsonText);
          if (Array.isArray(currentJson)) {
            const existingNode = currentJson.find(node => node.taskId === newTaskId);
            if (existingNode) {
              alert('该节点ID已存在，请使用其他名称');
              return;
            }
          }
        } catch (error) {
          // JSON解析失败，继续编辑
        }
      }
    }

    // 更新JSON配置
    if (state.jsonText) {
      try {
        const currentJson = JSON.parse(state.jsonText);
        if (Array.isArray(currentJson)) {
          const updatedJson = currentJson.map(node => {
            if (node.taskId === oldTaskId) {
              // 更新当前节点的所有属性
              const updatedNode = {
                ...node,
                taskId: newTaskId,
                taskType: finalNodeType,
                '@type': finalNodeTypeDef!.template['@type'],
                // 保存颜色信息
                color: editingNodeColor
              };
              
              // 如果是自定义类型，保存自定义类型信息
              if (editingIsCustomType) {
                updatedNode.isCustomType = true;
              } else {
                // 清除自定义类型标记
                delete updatedNode.isCustomType;
              }
              
              return updatedNode;
            } else {
              // 更新其他节点的dependencies中的引用
              if (node.dependencies && node.dependencies.includes(oldTaskId)) {
                return {
                  ...node,
                  dependencies: node.dependencies.map((dep: string) => 
                    dep === oldTaskId ? newTaskId : dep
                  )
                };
              }
            }
            return node;
          });
          
          const jsonString = JSON.stringify(updatedJson, null, 2);
          dispatch({
            type: 'SET_JSON_TEXT',
            payload: jsonString
          });
          
          // 重新加载DAG数据以更新显示
          await loadDAGData(updatedJson);
        }
      } catch (error) {
        console.error('更新节点失败:', error);
        alert('更新失败，请检查JSON格式');
      }
    }

    // 清理编辑状态
    setEditingNodeId(null);
    setEditingNodeLabel('');
    setEditingNodeType('');
    setEditingNodeColor('');
    setEditingIsCustomType(false);
    setEditingCustomNodeType('');
  }, [editingNodeId, editingNodeLabel, editingNodeType, editingNodeColor, editingIsCustomType, 
      editingCustomNodeType, state.jsonText, dispatch, loadDAGData]);

  // 取消节点标签编辑
  const cancelNodeLabelEdit = useCallback(() => {
    setEditingNodeId(null);
    setEditingNodeLabel('');
    setEditingNodeType('');
    setEditingNodeColor('');
    setEditingIsCustomType(false);
    setEditingCustomNodeType('');
  }, []);

  // 处理键盘事件
  const handleEditKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      saveNodeLabelEdit();
    } else if (event.key === 'Escape') {
      cancelNodeLabelEdit();
    }
  }, [saveNodeLabelEdit, cancelNodeLabelEdit]);

  // 获取节点颜色的函数（用于迷你地图）
  const getNodeColor = (node: Node) => {
    return node.style?.backgroundColor || '#64748b';
  };

  // 迷你地图样式
  const miniMapStyle = {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb'
  };

  // 处理右键点击事件
  const handlePaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    
    // 获取ReactFlow画布的点击位置
    const reactFlowBounds = reactFlowInstance.getViewport();
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.x,
      y: event.clientY - reactFlowBounds.y,
    });

    setDialogPosition(position);
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
  }, [reactFlowInstance]);

  // 处理新节点创建
  const handleCreateNode = useCallback(async (newNode: Node) => {
    // 检查taskId是否已存在
    if (state.jsonText) {
      try {
        const currentJson = JSON.parse(state.jsonText);
        if (Array.isArray(currentJson)) {
          const existingNode = currentJson.find(node => node.taskId === newNode.data.taskId);
          if (existingNode) {
            alert('该节点ID已存在，请使用其他名称');
            return;
          }
        }
      } catch (error) {
        // JSON解析失败，继续创建
      }
    }

    // 添加节点到ReactFlow
    setNodes((currentNodes) => [...currentNodes, newNode]);

    // 更新原始JSON数据
    const newDAGNode = {
      taskId: newNode.data.taskId,
      taskType: newNode.data.taskType,
      '@type': newNode.data['@type'],
      input: newNode.data.input || [],
      output: newNode.data.output || [],
      dependencies: newNode.data.dependencies || []
    };

    // 更新AppContext中的JSON文本
    try {
      let updatedJson;
      
      if (state.jsonText) {
        const currentJson = JSON.parse(state.jsonText);
        if (Array.isArray(currentJson)) {
          updatedJson = [...currentJson, newDAGNode];
        } else {
          updatedJson = [newDAGNode];
        }
      } else {
        // 如果没有现有JSON，创建新的
        updatedJson = [newDAGNode];
      }
      
      // 触发JSON更新到编辑器
      const jsonString = JSON.stringify(updatedJson, null, 2);
      dispatch({
        type: 'SET_JSON_TEXT',
        payload: jsonString
      });
      
      // 重新加载DAG数据
      await loadDAGData(updatedJson);
      
    } catch (error) {
      console.error('更新JSON配置失败:', error);
      // 如果解析失败，直接创建新的JSON数组
      const newJsonArray = [newDAGNode];
      const jsonString = JSON.stringify(newJsonArray, null, 2);
      dispatch({
        type: 'SET_JSON_TEXT',
        payload: jsonString
      });
      
      // 尝试加载简单的DAG数据
      try {
        await loadDAGData(newJsonArray);
      } catch (loadError) {
        console.error('加载DAG数据失败:', loadError);
      }
    }

    // 关闭菜单
    setContextMenuPosition(null);
  }, [setNodes, state.jsonText, dispatch, loadDAGData]);

  // 关闭右键菜单
  const closeContextMenu = useCallback(() => {
    setContextMenuPosition(null);
  }, []);

  // 打开节点创建对话框
  const openNodeCreationDialog = useCallback(() => {
    setIsDialogOpen(true);
    setContextMenuPosition(null);
  }, []);

  // 关闭节点创建对话框
  const closeNodeCreationDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  // 点击画布时关闭右键菜单
  const handlePaneClick = useCallback(() => {
    setContextMenuPosition(null);
  }, []);

  return (
    <div className="visualizer-container">
      {state.isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">正在处理DAG数据...</div>
        </div>
      )}
      
      <div className="reactflow-wrapper">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onPaneContextMenu={handlePaneContextMenu}
          onPaneClick={handlePaneClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onConnect={onConnect}
          onEdgesDelete={onEdgesDelete}
          onEdgeClick={onEdgeClick}
          connectionLineType={ConnectionLineType.SmoothStep}
          connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
          snapToGrid={true}
          snapGrid={[15, 15]}
          deleteKeyCode={['Backspace', 'Delete']}
          multiSelectionKeyCode={'Shift'}
          nodesDraggable={true}
          nodesConnectable={true}
          edgesUpdatable={true}
          edgesFocusable={true}
          fitView
          fitViewOptions={{
            padding: 0.2,
            includeHiddenNodes: false
          }}
          attributionPosition="bottom-left"
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          <Controls 
            position="top-right"
            showZoom={true}
            showFitView={true}
            showInteractive={true}
          />
          <MiniMap 
            position="bottom-right"
            nodeColor={getNodeColor}
            style={miniMapStyle}
            ariaLabel="DAG 迷你地图"
            pannable={true}
            zoomable={true}
            inversePan={false}
          />
          <Background 
            gap={20}
            size={1}
            color="#e0e0e0"
          />
        </ReactFlow>
      </div>

      {/* 连线删除提示 */}
      {showDeleteHint && (
        <div className="edge-delete-hint">
          💡 选中连线后按 Delete 或 Backspace 键删除
        </div>
      )}

      {/* 节点编辑覆盖层 */}
      {editingNodeId && (
        <div className="node-edit-overlay">
          <div className="node-edit-dialog-extended">
            <h4>编辑节点</h4>
            
            {/* 节点ID输入 */}
            <div className="edit-form-section">
              <label htmlFor="editNodeId">节点ID</label>
              <input
                id="editNodeId"
                type="text"
                value={editingNodeLabel}
                onChange={(e) => setEditingNodeLabel(e.target.value)}
                onKeyDown={handleEditKeyDown}
                placeholder="输入节点ID"
                className="edit-input"
              />
            </div>

            {/* 节点类型选择 */}
            <div className="edit-form-section">
              <label>节点类型</label>
              <div className="edit-node-type-grid">
                {DEFAULT_NODE_TYPES.map((nodeType) => (
                  <div
                    key={nodeType.id}
                    className={`edit-node-type-card ${editingNodeType === nodeType.id ? 'selected' : ''}`}
                    onClick={() => {
                      setEditingNodeType(nodeType.id);
                      setEditingIsCustomType(false);
                      setEditingNodeColor(nodeType.defaultColor);
                    }}
                  >
                    <div className="edit-node-type-icon">{nodeType.icon}</div>
                    <div className="edit-node-type-label">{nodeType.label}</div>
                  </div>
                ))}
                {/* 自定义类型选项 */}
                <div
                  className={`edit-node-type-card ${editingIsCustomType ? 'selected' : ''}`}
                  onClick={() => {
                    setEditingIsCustomType(true);
                    setEditingNodeType('CUSTOM');
                  }}
                >
                  <div className="edit-node-type-icon">⚙️</div>
                  <div className="edit-node-type-label">自定义</div>
                </div>
              </div>
            </div>

            {/* 自定义节点类型配置 */}
            {editingIsCustomType && (
              <div className="edit-form-section">
                <div className="edit-custom-field">
                  <label htmlFor="editCustomType">类型名称</label>
                  <input
                    id="editCustomType"
                    type="text"
                    value={editingCustomNodeType}
                    onChange={(e) => setEditingCustomNodeType(e.target.value)}
                    placeholder="DATA_PROCESSING"
                    className="edit-input"
                  />
                </div>
              </div>
            )}

            {/* 颜色选择 */}
            <div className="edit-form-section">
              <label htmlFor="editNodeColor">节点颜色</label>
              <input
                id="editNodeColor"
                type="color"
                value={editingNodeColor}
                onChange={(e) => setEditingNodeColor(e.target.value)}
                className="edit-color-input"
              />
            </div>

            <div className="node-edit-actions">
              <button onClick={saveNodeLabelEdit} className="save-btn">
                保存更改
              </button>
              <button onClick={cancelNodeLabelEdit} className="cancel-btn">
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 右键菜单 */}
      {contextMenuPosition && (
        <div 
          className="context-menu"
          style={{
            position: 'fixed',
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            zIndex: 1000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="context-menu-item"
            onClick={openNodeCreationDialog}
          >
            🎯 创建节点
          </button>
        </div>
      )}

      {/* 节点创建对话框 */}
      <NodeCreationDialog
        isOpen={isDialogOpen}
        position={dialogPosition}
        onClose={closeNodeCreationDialog}
        onCreateNode={handleCreateNode}
      />
      
      {!state.dagData && !state.isLoading && (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3 className="empty-state-title">DAG 配置快速验证</h3>
          <p className="empty-state-message">
            在左侧粘贴JSON工作流数据，或使用工具栏加载文件来开始可视化
          </p>
          <div className="empty-state-tips">
            <p><strong>支持的功能:</strong></p>
            <ul>
              <li>包含 taskId 和 dependencies 的工作流节点数组</li>
              <li>支持多种节点类型：PROMPT_BUILD、CALL_LLM、HttpRequestNode、CodeNode 等</li>
              <li>自动分层布局和依赖关系可视化</li>
              <li>🆕 右键创建新节点，支持自定义颜色和类型</li>
            </ul>
          </div>
          <div className="empty-state-credits">
            <div className="credits-item">
              <span className="credits-label">🧑‍💻 作者</span>
              <span className="credits-value">柏玄</span>
            </div>
            <div className="credits-item">
              <span className="credits-label">🛠️ 开发工具</span>
              <span className="credits-value">Cursor</span>
            </div>
            <div className="credits-item">
              <span className="credits-label">⚡ 技术栈</span>
              <span className="credits-value">React + ReactFlow + TypeScript</span>
            </div>
          </div>
        </div>
      )}
      
      {state.error && (
        <div className="error-state">
          <div className="error-state-icon">⚠️</div>
          <h3 className="error-state-title">数据处理错误</h3>
          <p className="error-state-message">{state.error}</p>
          <button 
            className="error-retry-btn"
            onClick={() => window.location.reload()}
          >
            重新加载页面
          </button>
        </div>
      )}
    </div>
  );
};

export default DAGVisualizer; 