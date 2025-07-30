import React from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background,
  useNodesState,
  useEdgesState
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
          original: node.data.original
        }
      }));
      
      const reactFlowEdges: Edge[] = state.dagData.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep'
      }));
      
      setNodes(reactFlowNodes);
      setEdges(reactFlowEdges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [state.dagData, setNodes, setEdges]);

  return (
    <div className="visualizer-container">
      {state.isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      
      <div className="reactflow-wrapper">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
      
      {!state.dagData && !state.isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#999'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <p>在左侧粘贴JSON数据以开始可视化</p>
        </div>
      )}
    </div>
  );
};

export default DAGVisualizer; 