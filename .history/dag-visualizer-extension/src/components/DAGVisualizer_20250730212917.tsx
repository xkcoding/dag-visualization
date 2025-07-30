import React from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { useApp } from '../context/AppContext';

const DAGVisualizer: React.FC = () => {
  const { state } = useApp();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

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
        style: {
          stroke: '#666',
          strokeWidth: 2
        },
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#666'
        }
      }));
      
      setNodes(reactFlowNodes);
      setEdges(reactFlowEdges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [state.dagData, setNodes, setEdges]);

  // 小地图节点颜色函数
  const getNodeColor = (node: Node) => {
    return node.style?.backgroundColor || '#999';
  };

  // 小地图样式
  const miniMapStyle = {
    backgroundColor: '#f8f9fa',
    maskColor: 'rgba(0, 0, 0, 0.1)'
  };

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
      
      {!state.dagData && !state.isLoading && (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3 className="empty-state-title">DAG 配置快速验证</h3>
          <p className="empty-state-message">
            在左侧粘贴JSON工作流数据，或使用工具栏加载文件来开始可视化
          </p>
          <div className="empty-state-tips">
            <p><strong>支持的格式:</strong></p>
            <ul>
              <li>包含 taskId 和 dependencies 的工作流节点数组</li>
              <li>支持多种节点类型：PROMPT_BUILD、CALL_LLM、HttpRequestNode、CodeNode 等</li>
              <li>自动分层布局和依赖关系可视化</li>
            </ul>
          </div>
          <div className="empty-state-credits">
            <div className="credits-item">
              <span className="credits-label">🧑‍💻 作者</span>
              <span className="credits-value">柏玄」</span>
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