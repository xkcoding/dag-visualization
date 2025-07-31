import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  ControlButton,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  MarkerType,
  useReactFlow,
  addEdge,
  ConnectionLineType,
  ConnectionMode,
  Position
} from 'reactflow';
import type { Node, Edge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';
import { useApp } from '../context/AppContext';
import NodeCreationDialog from './NodeCreationDialog';
import { DEFAULT_NODE_TYPES, ColorManager } from '../utils/nodeTypeManager';
import type { NodeTypeDefinition } from '../utils/nodeTypeManager';
import { 
  calculateSmartLayout, 
  alignNodesToGrid, 
  DEFAULT_LAYOUT_OPTIONS, 
  LAYOUT_DIRECTIONS,
  findNearestAlignment,
  DEFAULT_ALIGNMENT_OPTIONS,
  detectEdgeCrossings,
  optimizeLayoutForEdgeCrossings,
  optimizeComplexDAGLayout,
  analyzeComplexDAG
} from '../utils/layoutUtils';
import type { LayoutOptions, AlignmentOptions } from '../utils/layoutUtils';
import {
  calculateUniformNodeSize,
  DEFAULT_NODE_TEXT_CONFIG
} from '../utils/textUtils';
// 移除连线重叠优化相关导入，功能已被智能布局囊括
// import {
//   optimizeEdges,
//   DEFAULT_EDGE_OPTIMIZATION_OPTIONS
// } from '../utils/edgeOptimization';
// import type { EdgeOptimizationOptions } from '../utils/edgeOptimization';

const DAGVisualizer: React.FC = () => {
  const { state, dispatch, loadDAGData, setReactFlowInstance } = useApp();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const reactFlowInstance = useReactFlow();

  // 将ReactFlow实例传递给AppContext
  React.useEffect(() => {
    if (reactFlowInstance) {
      setReactFlowInstance(reactFlowInstance);
    }
  }, [reactFlowInstance, setReactFlowInstance]);

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
  
  // 批量颜色控制状态
  const [batchColorMode, setBatchColorMode] = useState<boolean>(false);
  
  // 连线删除提示状态
  const [showDeleteHint, setShowDeleteHint] = useState<boolean>(false);

  // 智能布局状态
  const [isLayouting, setIsLayouting] = useState<boolean>(false);
  const [layoutOptions, setLayoutOptions] = useState<LayoutOptions>(DEFAULT_LAYOUT_OPTIONS);
  
  // 节点对齐状态
  const [alignmentOptions, setAlignmentOptions] = useState<AlignmentOptions>(DEFAULT_ALIGNMENT_OPTIONS);
  
  // 使用ref来存储智能布局函数，避免依赖循环
  const smartLayoutRef = useRef<(() => void) | null>(null);

  // 文本自适应布局状态 (T=固定, U=统一)
  const [textAdaptiveMode, setTextAdaptiveMode] = useState<'uniform' | 'fixed'>('fixed');
  const textConfig = DEFAULT_NODE_TEXT_CONFIG; // 使用默认配置

  // 移除连线重叠优化状态，功能已被智能布局囊括
  // const [edgeOptimizationOptions, setEdgeOptimizationOptions] = useState<EdgeOptimizationOptions>(DEFAULT_EDGE_OPTIMIZATION_OPTIONS);

  // 连线选中和节点高亮状态
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  
  // DAG分析状态
  const [showAnalysisModal, setShowAnalysisModal] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // 当DAG数据变化时更新节点和边
  React.useEffect(() => {
    if (state.dagData) {
      const reactFlowNodes: Node[] = state.dagData.nodes.map(node => {
        // 确保使用正确的颜色，优先使用ColorManager获取最新的默认颜色
        const nodeTaskType = node.data.taskType || 'default';
        const nodeColor = node.data.color || ColorManager.getDefaultColor(nodeTaskType);
        
        return {
          id: node.id,
          type: 'default',
          position: node.position, // 数据加载时使用原始位置
          data: { 
            label: node.label,
            original: node.data.original,
            taskType: nodeTaskType, // 保持一致的数据结构
            inputCount: node.data.inputCount,
            outputCount: node.data.outputCount,
            color: nodeColor, // 添加颜色字段到data中
            textColor: ColorManager.getContrastTextColor(nodeColor),
            isCustomType: (node.data as any).isCustomType || false
          },
          style: {
            backgroundColor: nodeColor,
            color: ColorManager.getContrastTextColor(nodeColor),
            border: '2px solid #ffffff',
            borderRadius: '8px',
            fontSize: '11px', // 默认字体大小，文本模式会单独处理
            fontWeight: 'bold',
            width: '180px', // 默认尺寸，文本模式会单独处理
            height: '40px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            whiteSpace: 'nowrap' as const, // 默认不换行，文本模式会单独处理
            wordBreak: 'normal' as const,
            overflow: 'hidden',
            lineHeight: '1.2',
            transition: 'all 0.3s ease'
          },
          sourcePosition: layoutOptions.direction === 'LR' ? Position.Right : Position.Bottom,
          targetPosition: layoutOptions.direction === 'LR' ? Position.Left : Position.Top
        };
      });
      
      let reactFlowEdges: Edge[] = state.dagData.edges.map(edge => {
        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: '#94a3b8', // 默认颜色，高亮状态单独处理
            strokeWidth: 2, // 默认宽度
            opacity: 0.8
          },
          sourcePosition: layoutOptions.direction === 'LR' ? Position.Right : Position.Bottom,
          targetPosition: layoutOptions.direction === 'LR' ? Position.Left : Position.Top,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#94a3b8', // 默认箭头颜色
            width: 16,
            height: 16,
          }
        };
      });

      // 移除连线重叠优化应用，功能已被智能布局囊括
      // if (edgeOptimizationOptions.enabled && reactFlowNodes.length > 0) {
      //   reactFlowEdges = optimizeEdges(
      //     reactFlowEdges,
      //     reactFlowNodes,
      //     layoutOptions.direction === 'LR' ? Position.Right : Position.Bottom,
      //     layoutOptions.direction === 'LR' ? Position.Left : Position.Top,
      //     edgeOptimizationOptions
      //   );
      // }

      setNodes(reactFlowNodes);
      setEdges(reactFlowEdges);
    } else {
      // 当dagData为null时，清空ReactFlow的节点和边
      setNodes([]);
      setEdges([]);
      
      // 重置其他相关状态
      setSelectedEdge(null);
      setHighlightedNodes(new Set());
      setEditingNodeId(null);
      setIsDialogOpen(false);
      setShowAnalysisModal(false);
      
      console.log('✅ 画布已清空：节点和边已移除');
    }
  }, [state.dagData, setNodes, setEdges, layoutOptions.direction]);

  // 使用ref来跟踪上次的textAdaptiveMode，避免无限循环
  const lastTextModeRef = useRef<'uniform' | 'fixed'>('fixed');

  // 文本模式变化时，只更新节点样式，保持位置不变 - 使用函数式更新
  React.useEffect(() => {
    // 只有当textAdaptiveMode真正改变时才更新
    if (lastTextModeRef.current !== textAdaptiveMode) {
      lastTextModeRef.current = textAdaptiveMode;
      
      setNodes(prevNodes => {
        if (prevNodes.length === 0) return prevNodes;
        
        // 计算节点尺寸（根据文本自适应模式）
        let uniformSize: { width: number; height: number; fontSize: number } | null = null;
        if (textAdaptiveMode === 'uniform' && state.dagData) {
          const allTexts = state.dagData.nodes.map(node => node.label);
          uniformSize = calculateUniformNodeSize(allTexts, textConfig);
        }

        return prevNodes.map(node => {
          let nodeSize = { width: 180, height: 40, fontSize: 11 };
          
          if (textAdaptiveMode === 'uniform' && uniformSize) {
            nodeSize = uniformSize;
          }

          return {
            ...node,
            style: {
              ...node.style,
              fontSize: `${nodeSize.fontSize}px`,
              width: textAdaptiveMode === 'fixed' ? '180px' : `${nodeSize.width}px`,
              height: textAdaptiveMode === 'fixed' ? '40px' : `${nodeSize.height}px`,
              whiteSpace: textAdaptiveMode === 'fixed' ? 'nowrap' as const : 'pre-wrap' as const,
              wordBreak: textAdaptiveMode === 'fixed' ? 'normal' as const : 'break-word' as const,
            }
          };
        });
      });
    }
  }, [textAdaptiveMode, setNodes, state.dagData]);

  // 单独处理节点高亮状态更新 - 使用函数式更新避免依赖冲突
  React.useEffect(() => {
    setNodes(prevNodes => {
      if (prevNodes.length === 0) return prevNodes;
      
      return prevNodes.map(node => {
        const isHighlighted = highlightedNodes.has(node.id);
        const currentlyHighlighted = node.style?.border === '3px solid #fbbf24';
        
        // 只有状态真正改变时才更新
        if (isHighlighted === currentlyHighlighted) {
          return node;
        }
        
        return {
          ...node,
          // 明确保持原始位置不变
          position: node.position,
          style: {
            ...node.style,
            border: isHighlighted ? '3px solid #fbbf24' : '2px solid #ffffff',
            boxShadow: isHighlighted ? '0 0 20px rgba(251, 191, 36, 0.6)' : undefined
            // 移除 transform 和 zIndex 避免影响交互
          }
        };
      });
    });
  }, [highlightedNodes, setNodes]);

  // 单独处理边的高亮状态更新
  React.useEffect(() => {
    setEdges(prevEdges => {
      if (prevEdges.length === 0) return prevEdges;
      
      return prevEdges.map(edge => {
        const isSelected = selectedEdge === edge.id;
        const currentlySelected = edge.style?.stroke === '#fbbf24';
        
        // 只有状态真正改变时才更新
        if (isSelected === currentlySelected) {
          return edge;
        }
        
        return {
          ...edge,
          style: {
            ...edge.style,
            stroke: isSelected ? '#fbbf24' : '#94a3b8',
            strokeWidth: isSelected ? 4 : 2,
            opacity: isSelected ? 1 : 0.8,
            filter: isSelected ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))' : undefined
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isSelected ? '#fbbf24' : '#94a3b8',
            width: 16,
            height: 16,
          }
        };
      });
    });
  }, [selectedEdge, setEdges]);



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



  // 处理连线
  const onConnect = useCallback((connection: Connection) => {
    const newEdge = {
      ...connection,
      id: `${connection.source}-${connection.target}`,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
      sourcePosition: layoutOptions.direction === 'LR' ? Position.Right : Position.Bottom,
      targetPosition: layoutOptions.direction === 'LR' ? Position.Left : Position.Top,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#94a3b8',
        width: 16,
        height: 16,
      }
    };
    
    setEdges((eds) => addEdge(newEdge, eds));
    
    // 更新JSON配置中的dependencies
    updateConnectionsInJSON(connection);
  }, [setEdges, updateConnectionsInJSON, layoutOptions.direction]);

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

  // 批量更新同类型节点颜色
  const updateSameTypeNodesColor = useCallback((nodeType: string, newColor: string) => {
    let updatedCount = 0;
    
    setNodes((currentNodes) => {
      const updatedNodes = currentNodes.map((node) => {
        // 安全的类型检查
        const nodeData = node.data as any;
        const nodeTaskType = nodeData?.taskType;
        
        if (nodeData && nodeTaskType === nodeType) {
          updatedCount++;
          
          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              color: newColor,
              textColor: ColorManager.getContrastTextColor(newColor)
            },
            style: {
              ...node.style,
              backgroundColor: newColor,
              color: ColorManager.getContrastTextColor(newColor)
            }
          };
          
          // 节点颜色更新成功
          
          return updatedNode;
        }
        return node;
      });
      
      console.log(`🎨 批量更新完成: 类型 "${nodeType}", 更新了 ${updatedCount} 个节点`);
      return updatedNodes;
    });
    
    // 强制ReactFlow重新渲染 - 使用多种方法确保渲染
    setTimeout(() => {
      if (reactFlowInstance) {
        // 方法1: 强制重新适配视图
        reactFlowInstance.fitView({ duration: 100 });
        
        // 方法2: 触发重新计算
        setTimeout(() => {
          reactFlowInstance.setNodes((nds) => [...nds]);
        }, 150);
      }
    }, 100);
  }, [setNodes, reactFlowInstance]);

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

    // 如果是批量颜色模式，更新类型默认颜色并批量应用
    if (batchColorMode && finalNodeType) {
      // 更新类型默认颜色
      ColorManager.updateTypeDefaultColor(finalNodeType, editingNodeColor);
      // 批量更新所有同类型节点
      updateSameTypeNodesColor(finalNodeType, editingNodeColor);
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
    setBatchColorMode(false);
  }, [editingNodeId, editingNodeLabel, editingNodeType, editingNodeColor, editingIsCustomType, 
      editingCustomNodeType, batchColorMode, updateSameTypeNodesColor, state.jsonText, dispatch, loadDAGData]);

  // 取消节点标签编辑
  const cancelNodeLabelEdit = useCallback(() => {
    setEditingNodeId(null);
    setEditingNodeLabel('');
    setEditingNodeType('');
    setEditingNodeColor('');
    setEditingIsCustomType(false);
    setEditingCustomNodeType('');
    setBatchColorMode(false);
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

  // 打开节点创建对话框
  const openNodeCreationDialog = useCallback(() => {
    setIsDialogOpen(true);
    setContextMenuPosition(null);
  }, []);

  // 智能布局处理函数
  const handleSmartLayout = useCallback(async () => {
    if (isLayouting || nodes.length === 0) return;
    
    setIsLayouting(true);
    
    try {
      console.log('开始智能布局...');
      
      // 计算基础智能布局
      const layoutedNodes = calculateSmartLayout(nodes, edges, layoutOptions);
      
      // 检测连线穿越问题
      const crossings = detectEdgeCrossings(layoutedNodes, edges);
      console.log(`检测到 ${crossings.length} 个连线穿越问题`);
      
      // 根据DAG复杂度选择优化策略
      let optimizedNodes = layoutedNodes;
      if (crossings.length > 0) {
        console.log('应用连线穿越优化...', crossings);
        
        // 对于复杂DAG (节点数>10 或 穿越数>5) 使用增强算法
        if (nodes.length > 10 || crossings.length > 5) {
          console.log('使用复杂DAG优化算法...');
          optimizedNodes = optimizeComplexDAGLayout(layoutedNodes, edges, layoutOptions);
          
          // 输出详细分析结果
          const analysis = analyzeComplexDAG(optimizedNodes, edges);
          console.log('复杂DAG优化分析:', analysis);
          
          if (analysis.suggestions.length > 0) {
            console.log('优化建议:', analysis.suggestions.join('; '));
          }
        } else {
          // 简单DAG使用基础算法
          optimizedNodes = optimizeLayoutForEdgeCrossings(layoutedNodes, edges, layoutOptions);
        }
        
        // 再次检测优化效果
        const optimizedCrossings = detectEdgeCrossings(optimizedNodes, edges);
        console.log(`优化后剩余 ${optimizedCrossings.length} 个连线穿越问题`);
        
        // 输出穿越问题的详细信息
        if (optimizedCrossings.length > 0) {
          const problemEdges = optimizedCrossings.map(c => 
            `${c.sourceNodeId}→${c.targetNodeId} (${c.severity}, 穿越${c.crossingNodes.length}个节点)`
          ).join(', ');
          console.log('剩余穿越问题:', problemEdges);
        }
      }
      
      // 对齐到网格
      const alignedNodes = alignNodesToGrid(optimizedNodes, 20);
      
      // 应用新的节点位置
      setNodes(alignedNodes);
      
      // 布局完成后自动适配视图
      if (reactFlowInstance && reactFlowInstance.fitView) {
        setTimeout(() => {
          reactFlowInstance.fitView({
            padding: 0.1,
            includeHiddenNodes: false,
            duration: 800 // 添加平滑动画
          });
        }, 100);
      }
      
      console.log('智能布局完成');
    } catch (error) {
      console.error('智能布局失败:', error);
    } finally {
      setIsLayouting(false);
    }
  }, [isLayouting, nodes, edges, layoutOptions, setNodes, reactFlowInstance]);

  // 将智能布局函数存储到ref中
  React.useEffect(() => {
    smartLayoutRef.current = handleSmartLayout;
  }, [handleSmartLayout]);



  // 切换布局方向
  const toggleLayoutDirection = useCallback(() => {
    if (isLayouting || nodes.length === 0) return;
    
    const directions: LayoutOptions['direction'][] = ['TB', 'LR'];
    const currentIndex = directions.indexOf(layoutOptions.direction);
    const nextIndex = (currentIndex + 1) % directions.length;
    const nextDirection = directions[nextIndex];
    
    setLayoutOptions(prev => ({
      ...prev,
      direction: nextDirection
    }));
    
    console.log(`布局方向切换为: ${LAYOUT_DIRECTIONS[nextDirection].name}`);
    
    // 延迟执行智能布局，确保状态更新完成
    setTimeout(() => {
      if (smartLayoutRef.current) {
        smartLayoutRef.current();
      }
    }, 100);
  }, [layoutOptions.direction, isLayouting, nodes.length]);

  // 节点拖动结束处理
  const handleNodeDragStop = useCallback((_event: React.MouseEvent, node: Node) => {
    if (!alignmentOptions.snapToGrid && !alignmentOptions.snapToNodes) return;

    // 获取其他节点
    const otherNodes = nodes.filter(n => n.id !== node.id);
    
    // 查找最近的对齐位置
    const alignment = findNearestAlignment(node, otherNodes, alignmentOptions);
    
    // 如果位置有变化，应用对齐
    if (alignment.x !== node.position.x || alignment.y !== node.position.y) {
      const updatedNodes = nodes.map(n => 
        n.id === node.id 
          ? { ...n, position: { x: alignment.x, y: alignment.y } }
          : n
      );
      
      setNodes(updatedNodes);
      
      if (alignment.alignedTo) {
        console.log(`节点 ${node.id} 已对齐到: ${alignment.alignedTo}`);
      }
    }
  }, [nodes, alignmentOptions, setNodes]);

  // 切换对齐选项
  const toggleSnapToGrid = useCallback(() => {
    setAlignmentOptions(prev => ({
      ...prev,
      snapToGrid: !prev.snapToGrid
    }));
    console.log(`网格对齐: ${alignmentOptions.snapToGrid ? '关闭' : '开启'}`);
  }, [alignmentOptions.snapToGrid]);

  // 切换文本自适应模式 (T/U)
  const toggleTextAdaptiveMode = useCallback(() => {
    console.log(`文本模式切换前: 布局方向=${layoutOptions.direction}, 文本模式=${textAdaptiveMode}`);
    
    const modes: Array<'fixed' | 'uniform'> = ['fixed', 'uniform'];
    const currentIndex = modes.indexOf(textAdaptiveMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const nextMode = modes[nextIndex];
    
    setTextAdaptiveMode(nextMode);
    
    const modeNames = {
      'fixed': 'T (固定尺寸)',
      'uniform': 'U (统一尺寸)'
    };
    
    console.log(`文本布局模式切换为: ${modeNames[nextMode]}`);
    
    // 延迟检查布局方向是否被意外改变
    setTimeout(() => {
      console.log(`文本模式切换后: 布局方向=${layoutOptions.direction}, 文本模式=${nextMode}`);
    }, 50);
  }, [textAdaptiveMode, layoutOptions.direction]);

  // 移除连线重叠优化切换函数，功能已被智能布局囊括
  // const toggleEdgeOptimization = useCallback(() => {
  //   setEdgeOptimizationOptions(prev => ({
  //     ...prev,
  //     enabled: !prev.enabled
  //   }));
  //   
  //   console.log(`连线重叠优化: ${edgeOptimizationOptions.enabled ? '关闭' : '开启'}`);
  // }, [edgeOptimizationOptions.enabled]);

  // 连线点击事件处理
  const handleEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    console.log(`点击连线: ${edge.id}, 起点: ${edge.source}, 终点: ${edge.target}`);
    
    // 显示删除提示
    if (!showDeleteHint) {
      setShowDeleteHint(true);
      setTimeout(() => setShowDeleteHint(false), 3000);
    }
    
    if (selectedEdge === edge.id) {
      // 取消选中
      setSelectedEdge(null);
      setHighlightedNodes(new Set());
    } else {
      // 选中新连线
      setSelectedEdge(edge.id);
      setHighlightedNodes(new Set([edge.source, edge.target]));
    }
  }, [selectedEdge, showDeleteHint]);
  
  // DAG分析处理函数
  const handleAnalyzeDAG = useCallback(() => {
    if (nodes.length === 0) {
      alert('没有节点数据可供分析');
      return;
    }
    
    const analysis = analyzeComplexDAG(nodes, edges);
    setAnalysisResult(analysis);
    setShowAnalysisModal(true);
    
    console.log('DAG分析结果:', analysis);
  }, [nodes, edges]);

  // 关闭节点创建对话框
  const closeNodeCreationDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  // 点击画布时关闭右键菜单和取消连线选中
  const handlePaneClick = useCallback(() => {
    setContextMenuPosition(null);
    // 取消连线选中
    setSelectedEdge(null);
    setHighlightedNodes(new Set());
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
          onNodeDragStop={handleNodeDragStop}
          onPaneContextMenu={handlePaneContextMenu}
          onPaneClick={handlePaneClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onConnect={onConnect}
          onEdgesDelete={onEdgesDelete}
          onEdgeClick={handleEdgeClick}
          connectionLineType={layoutOptions.direction === 'LR' ? ConnectionLineType.Straight : ConnectionLineType.SmoothStep}
          connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
          connectionMode={ConnectionMode.Loose}
          snapToGrid={alignmentOptions.snapToGrid}
          snapGrid={[alignmentOptions.gridSize, alignmentOptions.gridSize]}
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
          >
            {/* 智能布局按钮 */}
            <ControlButton
              onClick={handleSmartLayout}
              title={`智能布局 (${LAYOUT_DIRECTIONS[layoutOptions.direction].name})`}
              disabled={isLayouting || nodes.length === 0}
            >
              {isLayouting ? '⟳' : '⊞'}
            </ControlButton>
            
            {/* 布局方向切换按钮 */}
            <ControlButton
              onClick={toggleLayoutDirection}
              title={`布局方向: ${LAYOUT_DIRECTIONS[layoutOptions.direction].name}`}
              disabled={isLayouting}
            >
              {LAYOUT_DIRECTIONS[layoutOptions.direction].icon}
            </ControlButton>
            
            {/* 网格对齐开关按钮 */}
            <ControlButton
              onClick={toggleSnapToGrid}
              title={`网格对齐: ${alignmentOptions.snapToGrid ? '开启' : '关闭'}`}
              style={{
                backgroundColor: alignmentOptions.snapToGrid ? '#4CAF50' : undefined,
                color: alignmentOptions.snapToGrid ? 'white' : undefined
              }}
            >
              {alignmentOptions.snapToGrid ? '⊞' : '⊡'}
            </ControlButton>
            
            {/* 文本自适应模式切换按钮 */}
            <ControlButton
              onClick={toggleTextAdaptiveMode}
              title={`文本布局: ${
                textAdaptiveMode === 'fixed' ? 'T (固定尺寸)' : 'U (统一尺寸)'
              }`}
              style={{
                backgroundColor: textAdaptiveMode !== 'fixed' ? '#2196F3' : undefined,
                color: textAdaptiveMode !== 'fixed' ? 'white' : undefined
              }}
            >
              {textAdaptiveMode === 'fixed' ? 'T' : 'U'}
            </ControlButton>
            
            {/* 移除连线重叠优化按钮，功能已被智能布局囊括 */}
            
            {/* DAG分析按钮 */}
            <ControlButton
              onClick={handleAnalyzeDAG}
              title="分析DAG连线穿越问题"
              disabled={nodes.length === 0}
              style={{ 
                backgroundColor: 'white',
                color: nodes.length === 0 ? '#9ca3af' : '#374151',
                cursor: nodes.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              📊
            </ControlButton>
          </Controls>
          {/* 只在有数据时显示小地图 */}
          {state.dagData && (
            <MiniMap 
              position="bottom-right"
              nodeColor={getNodeColor}
              style={miniMapStyle}
              ariaLabel="DAG 迷你地图"
              pannable={true}
              zoomable={true}
              inversePan={false}
            />
          )}
          <Background 
            gap={30}
            size={1}
            color="#f0f0f0"
            variant={BackgroundVariant.Lines}
            style={{ opacity: 0.6 }}
          />
        </ReactFlow>
      </div>

      {/* 连线删除提示 */}
      {showDeleteHint && (
        <div className="edge-delete-hint">
          ℹ 选中连线后按 Delete 或 Backspace 键删除
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
              <div className="color-control-wrapper">
                <input
                  id="editNodeColor"
                  type="color"
                  value={editingNodeColor}
                  onChange={(e) => setEditingNodeColor(e.target.value)}
                  className="edit-color-input"
                />
                <div className="batch-color-control">
                  <label className="batch-checkbox-label">
                    <input
                      type="checkbox"
                      checked={batchColorMode}
                      onChange={(e) => setBatchColorMode(e.target.checked)}
                      className="batch-checkbox"
                    />
                    <span className="batch-checkbox-text">
                      批量应用到所有 <strong>{editingIsCustomType ? editingCustomNodeType : (DEFAULT_NODE_TYPES.find(t => t.id === editingNodeType)?.label || editingNodeType)}</strong> 类型节点
                    </span>
                  </label>
                  {batchColorMode && (
                    <div className="batch-color-info">
                      <span>🎯 将同时更新该类型的默认颜色</span>
                    </div>
                  )}
                </div>
              </div>
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
      
      {/* DAG分析结果模态框 */}
      {showAnalysisModal && analysisResult && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowAnalysisModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '32rem',
              maxHeight: '24rem',
              overflowY: 'auto',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              margin: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '16px',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '12px'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#111827',
                margin: 0
              }}>
                📊 DAG连线穿越分析报告
              </h3>
              <button 
                onClick={() => setShowAnalysisModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
                onMouseOver={(e) => (e.target as HTMLElement).style.color = '#6b7280'}
                onMouseOut={(e) => (e.target as HTMLElement).style.color = '#9ca3af'}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 基础统计 */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '16px', 
                fontSize: '14px',
                backgroundColor: '#f9fafb',
                padding: '12px',
                borderRadius: '6px'
              }}>
                <div>
                  <span style={{ fontWeight: '500', color: '#374151' }}>节点总数:</span> 
                  <span style={{ color: '#1f2937', marginLeft: '8px' }}>{analysisResult.totalNodes}</span>
                </div>
                <div>
                  <span style={{ fontWeight: '500', color: '#374151' }}>连线总数:</span> 
                  <span style={{ color: '#1f2937', marginLeft: '8px' }}>{analysisResult.totalEdges}</span>
                </div>
              </div>
              
              {/* 严重程度统计 */}
              <div>
                <h4 style={{ 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  margin: '0 0 8px 0'
                }}>
                  连线穿越统计
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr', 
                  gap: '8px', 
                  fontSize: '13px' 
                }}>
                  <div style={{ 
                    color: '#dc2626',
                    padding: '6px 8px',
                    backgroundColor: '#fef2f2',
                    borderRadius: '4px',
                    textAlign: 'center'
                  }}>
                    严重: {analysisResult.severitySummary.high}
                  </div>
                  <div style={{ 
                    color: '#d97706',
                    padding: '6px 8px',
                    backgroundColor: '#fffbeb',
                    borderRadius: '4px',
                    textAlign: 'center'
                  }}>
                    中等: {analysisResult.severitySummary.medium}
                  </div>
                  <div style={{ 
                    color: '#16a34a',
                    padding: '6px 8px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '4px',
                    textAlign: 'center'
                  }}>
                    轻微: {analysisResult.severitySummary.low}
                  </div>
                </div>
              </div>
              
              {/* 优化建议 */}
              {analysisResult.suggestions.length > 0 && (
                <div>
                  <h4 style={{ 
                    fontWeight: '500', 
                    color: '#374151', 
                    marginBottom: '8px',
                    fontSize: '14px',
                    margin: '0 0 8px 0'
                  }}>
                    💡 优化建议
                  </h4>
                  <ul style={{ 
                    fontSize: '13px', 
                    margin: 0, 
                    paddingLeft: '16px',
                    color: '#4b5563'
                  }}>
                    {analysisResult.suggestions.map((suggestion: string, index: number) => (
                      <li key={index} style={{ marginBottom: '4px' }}>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* 问题连线详情 */}
              {analysisResult.crossingEdges.length > 0 && (
                <div>
                  <h4 style={{ 
                    fontWeight: '500', 
                    color: '#374151', 
                    marginBottom: '8px',
                    fontSize: '14px',
                    margin: '0 0 8px 0'
                  }}>
                    🔗 问题连线详情 ({analysisResult.crossingEdges.length}条)
                  </h4>
                  <div style={{ 
                    maxHeight: '120px', 
                    overflowY: 'auto', 
                    fontSize: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    padding: '8px'
                  }}>
                    {analysisResult.crossingEdges.map((crossing: any, index: number) => (
                      <div key={index} style={{ 
                        color: '#4b5563', 
                        marginBottom: '6px',
                        padding: '4px',
                        backgroundColor: index % 2 === 0 ? '#f9fafb' : 'transparent',
                        borderRadius: '2px'
                      }}>
                        <span style={{ fontWeight: '500' }}>
                          {crossing.sourceNodeId} → {crossing.targetNodeId}
                        </span>
                        <span style={{
                          marginLeft: '8px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          backgroundColor: crossing.severity === 'high' ? '#fef2f2' :
                                         crossing.severity === 'medium' ? '#fffbeb' : '#f0fdf4',
                          color: crossing.severity === 'high' ? '#dc2626' :
                                crossing.severity === 'medium' ? '#d97706' : '#16a34a'
                        }}>
                          {crossing.severity}
                        </span>
                        <span style={{ marginLeft: '4px', color: '#6b7280', fontSize: '11px' }}>
                          (穿越{crossing.crossingNodes.length}个节点)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowAnalysisModal(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#2563eb'}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!state.dagData && !state.isLoading && !state.error && (
        <div className="empty-state">
          <div className="empty-state-container">
            {/* Header Section */}
            <div className="empty-state-header">
              <div className="empty-state-icon">
                <div className="icon-background">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <h1 className="empty-state-title">DAG Visualizer</h1>
              <p className="empty-state-subtitle">专业的工作流可视化工具</p>
            </div>

            {/* Main Content */}
            <div className="empty-state-content">
              <div className="content-section">
                <h3 className="section-title">快速开始</h3>
                <p className="section-description">
                  在左侧粘贴JSON工作流数据，或使用工具栏加载文件来开始可视化
                </p>
              </div>

              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">🔗</div>
                  <h4>智能布局</h4>
                  <p>自动分层布局和依赖关系可视化</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🎨</div>
                  <h4>自定义节点</h4>
                  <p>右键创建节点，支持自定义颜色和类型</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">⚡</div>
                  <h4>多格式支持</h4>
                  <p>支持多种节点类型和数据格式</p>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="empty-state-footer">
              <div className="footer-content">
                <div className="author-info">
                  <div className="author-avatar">柏</div>
                  <div className="author-details">
                    <a 
                      href="https://github.com/xkcoding" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="author-name-link"
                      title="🔥 Follow @xkcoding 获取更多开源项目"
                    >
                      柏玄 Follow→
                    </a>
                    <div className="author-role">Developer</div>
                  </div>
                </div>
                <div className="tech-stack">
                  <div className="tech-item">
                    <span className="tech-icon">⚛️</span>
                    <span>React</span>
                  </div>
                  <div className="tech-item">
                    <span className="tech-icon">🔷</span>
                    <span>TypeScript</span>
                  </div>
                  <div className="tech-item">
                    <span className="tech-icon">🌊</span>
                    <span>ReactFlow</span>
                  </div>
                </div>
              </div>
              <div className="footer-note">
                <span>使用 </span>
                <strong>Cursor</strong>
                <span> 开发 • </span>
                <a 
                  href="https://github.com/xkcoding/dag-visualization" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="repo-link"
                  title="⭐ Star 支持项目发展，帮助更多开发者"
                >
                  ⭐ GitHub Star→
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {state.error && (
        <div className="error-state">
          <div className="error-state-icon">⚠️</div>
          <h3 className="error-state-title">数据验证错误</h3>
          <p className="error-state-message">{state.error}</p>
          <div className="error-suggestions">
            <div className="suggestion-item">
              <span className="suggestion-icon">💡</span>
              <span>检查JSON格式是否正确</span>
            </div>
            <div className="suggestion-item">
              <span className="suggestion-icon">🔍</span>
              <span>确保每个节点包含 taskId、taskType、dependencies</span>
            </div>
            <div className="suggestion-item">
              <span className="suggestion-icon">🎯</span>
              <span>修复左侧JSON输入中的字段缺失问题</span>
            </div>
            <div className="suggestion-item">
              <span className="suggestion-icon">📋</span>
              <span>可以使用工具栏的"加载示例数据"进行测试</span>
            </div>
          </div>
          <button 
            className="error-retry-btn"
            onClick={() => {
              dispatch({ type: 'SET_ERROR', payload: null });
              dispatch({ type: 'SET_JSON_TEXT', payload: '' });
            }}
          >
            清空重新开始
          </button>
        </div>
      )}
    </div>
  );
};

export default DAGVisualizer; 