import React, { useState, useEffect } from 'react';
import { 
  NodeFactory, 
  ColorManager,
  DEFAULT_NODE_TYPES 
} from '../utils/nodeTypeManager';
import type { 
  NodeTypeDefinition, 
  NodeCreationConfig
} from '../utils/nodeTypeManager';

interface NodeCreationDialogProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onCreateNode: (node: any) => void;
}

export const NodeCreationDialog: React.FC<NodeCreationDialogProps> = ({
  isOpen,
  position,
  onClose,
  onCreateNode
}) => {
  const [selectedNodeType, setSelectedNodeType] = useState<string>('PROMPT_BUILD');
  const [nodeLabel, setNodeLabel] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  
  // 自定义节点类型状态
  const [isCustomType, setIsCustomType] = useState<boolean>(false);
  const [customNodeType, setCustomNodeType] = useState<string>('');

  // 生成随机节点ID
  const generateRandomNodeId = (nodeType: string) => {
    const timestamp = Date.now().toString().slice(-6); // 取时间戳后6位
    const random = Math.random().toString(36).substr(2, 4); // 生成4位随机字符
    return `${nodeType.toLowerCase()}_${timestamp}_${random}`;
  };

  // 更新节点类型时自动设置标签和颜色
  useEffect(() => {
    if (selectedNodeType === 'CUSTOM') {
      setIsCustomType(true);
      if (customNodeType) {
        const randomId = generateRandomNodeId(customNodeType);
        setNodeLabel(randomId);
      }
      setSelectedColor('#64748b'); // 自定义类型默认颜色
    } else {
      setIsCustomType(false);
      const nodeTypeDef = DEFAULT_NODE_TYPES.find(type => type.id === selectedNodeType);
      if (nodeTypeDef) {
        // 自动生成一个随机的节点ID
        const randomId = generateRandomNodeId(selectedNodeType);
        setNodeLabel(randomId);
        setSelectedColor(nodeTypeDef.defaultColor);
      }
    }
  }, [selectedNodeType, customNodeType]);

  // 当对话框打开时重置表单并生成默认ID
  useEffect(() => {
    if (isOpen) {
      setSelectedNodeType('PROMPT_BUILD');
      setIsCustomType(false);
      setCustomNodeType('');
      // 生成默认ID
      const randomId = generateRandomNodeId('PROMPT_BUILD');
      setNodeLabel(randomId);
      setSelectedColor('#4ade80'); // PROMPT_BUILD的默认颜色
    }
  }, [isOpen]);

  const handleCreateNode = () => {
    if (!nodeLabel.trim()) {
      alert('请输入节点ID');
      return;
    }

    // 验证taskId格式（不能包含特殊字符）
    const taskId = nodeLabel.trim();
    if (!/^[a-zA-Z0-9_-]+$/.test(taskId)) {
      alert('节点ID只能包含字母、数字、下划线和短横线');
      return;
    }

    // 如果是自定义类型，验证自定义字段
    let finalNodeType = selectedNodeType;
    if (isCustomType) {
      if (!customNodeType.trim()) {
        alert('请输入自定义节点类型名称');
        return;
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(customNodeType.trim())) {
        alert('节点类型只能包含字母、数字、下划线和短横线');
        return;
      }
      finalNodeType = customNodeType.trim().toUpperCase();
    }

    // 确定最终颜色
    const finalColor = selectedColor;

    try {
      // 创建节点配置
      const config: NodeCreationConfig = {
        id: taskId,
        label: taskId, // label就是taskId
        nodeType: finalNodeType,
        position: position,
        color: finalColor,
        customProperties: isCustomType ? {
          isCustomType: true,
          customNodeType: finalNodeType
        } : undefined
      };

      // 使用工厂创建节点
      const newNode = NodeFactory.createNode(config);
      
      // 通知父组件
      onCreateNode(newNode);
      
      // 关闭对话框
      onClose();
    } catch (error) {
      console.error('创建节点失败:', error);
      alert('创建节点失败，请检查配置');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="node-edit-overlay">
      <div className="node-edit-dialog-extended">
        <h4>🎯 创建新节点</h4>

        {/* 节点类型选择 */}
        <div className="edit-form-section">
          <label>节点类型</label>
          <div className="edit-node-type-grid">
            {DEFAULT_NODE_TYPES.map((nodeType) => (
              <div
                key={nodeType.id}
                className={`edit-node-type-card ${selectedNodeType === nodeType.id ? 'selected' : ''}`}
                onClick={() => setSelectedNodeType(nodeType.id)}
              >
                <div className="edit-node-type-icon">{nodeType.icon}</div>
                <div className="edit-node-type-label">{nodeType.label}</div>
              </div>
            ))}
            {/* 自定义节点类型选项 */}
            <div
              className={`edit-node-type-card ${selectedNodeType === 'CUSTOM' ? 'selected' : ''}`}
              onClick={() => setSelectedNodeType('CUSTOM')}
            >
              <div className="edit-node-type-icon">⚙️</div>
              <div className="edit-node-type-label">自定义</div>
            </div>
          </div>
        </div>

        {/* 自定义节点类型配置 */}
        {isCustomType && (
          <div className="edit-form-section">
            <div className="edit-custom-field">
              <label htmlFor="customNodeType">类型名称</label>
              <input
                id="customNodeType"
                type="text"
                value={customNodeType}
                onChange={(e) => setCustomNodeType(e.target.value)}
                placeholder="DATA_PROCESSING"
                className="edit-input"
              />
            </div>
          </div>
        )}

        {/* 节点ID输入 */}
        <div className="edit-form-section">
          <label htmlFor="nodeLabel">节点ID</label>
          <input
            id="nodeLabel"
            type="text"
            value={nodeLabel}
            onChange={(e) => setNodeLabel(e.target.value)}
            placeholder="输入节点ID"
            className="edit-input"
          />
        </div>

        {/* 颜色选择 */}
        <div className="edit-form-section">
          <label htmlFor="nodeColor">节点颜色</label>
          <input
            id="nodeColor"
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="edit-color-input"
          />
        </div>

        <div className="node-edit-actions">
          <button onClick={handleCreateNode} className="save-btn">
            🎯 创建节点
          </button>
          <button onClick={onClose} className="cancel-btn">
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeCreationDialog; 