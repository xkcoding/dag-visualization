import type { Node, Edge } from 'reactflow';

/**
 * 智能布局算法选项
 */
export interface LayoutOptions {
  direction: 'TB' | 'LR'; // 布局方向：TB=从上到下，LR=从左到右
  nodeSpacing: { x: number; y: number }; // 节点间距
  levelSpacing: number; // 层级间距
  centerNodes: boolean; // 是否居中对齐节点
}

/**
 * 默认布局选项
 */
export const DEFAULT_LAYOUT_OPTIONS: LayoutOptions = {
  direction: 'TB', // Top to Bottom
  nodeSpacing: { x: 200, y: 150 },
  levelSpacing: 200,
  centerNodes: true
};

/**
 * 计算节点的层级关系
 */
export function calculateNodeLevels(nodes: Node[], edges: Edge[]): Map<string, number> {
  const levels = new Map<string, number>();
  const inDegree = new Map<string, number>();
  const adjacencyList = new Map<string, string[]>();

  // 初始化
  nodes.forEach(node => {
    inDegree.set(node.id, 0);
    adjacencyList.set(node.id, []);
  });

  // 构建图的邻接表和入度统计
  edges.forEach(edge => {
    const from = edge.source;
    const to = edge.target;
    
    adjacencyList.get(from)?.push(to);
    inDegree.set(to, (inDegree.get(to) || 0) + 1);
  });

  // 使用拓扑排序计算层级
  const queue: string[] = [];
  
  // 找到所有入度为0的节点（根节点）
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      levels.set(nodeId, 0);
      queue.push(nodeId);
    }
  });

  // 拓扑排序
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentLevel = levels.get(current)!;

    adjacencyList.get(current)?.forEach(neighbor => {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);

      if (newDegree === 0) {
        levels.set(neighbor, currentLevel + 1);
        queue.push(neighbor);
      }
    });
  }

  return levels;
}

/**
 * 根据层级分组节点
 */
export function groupNodesByLevel(nodes: Node[], levels: Map<string, number>): Map<number, Node[]> {
  const levelGroups = new Map<number, Node[]>();

  nodes.forEach(node => {
    const level = levels.get(node.id) ?? 0;
    if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    }
    levelGroups.get(level)!.push(node);
  });

  return levelGroups;
}

/**
 * 计算智能布局后的节点位置
 */
export function calculateSmartLayout(
  nodes: Node[], 
  edges: Edge[], 
  options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS
): Node[] {
  if (nodes.length === 0) return nodes;

  // 计算节点层级
  const levels = calculateNodeLevels(nodes, edges);
  const levelGroups = groupNodesByLevel(nodes, levels);

  const updatedNodes: Node[] = [];

  levelGroups.forEach((levelNodes, level) => {
    const totalNodes = levelNodes.length;
    const totalWidth = (totalNodes - 1) * options.nodeSpacing.x;
    const startX = options.centerNodes ? -totalWidth / 2 : 0;

    levelNodes.forEach((node, index) => {
      let x, y;

      switch (options.direction) {
        case 'TB': // Top to Bottom - 纵向往下
          x = startX + index * options.nodeSpacing.x;
          y = level * options.levelSpacing;
          break;
        case 'LR': // Left to Right - 横向往右
          x = level * options.levelSpacing;
          y = startX + index * options.nodeSpacing.y;
          break;
        default:
          x = startX + index * options.nodeSpacing.x;
          y = level * options.levelSpacing;
      }

      updatedNodes.push({
        ...node,
        position: { x, y }
      });
    });
  });

  return updatedNodes;
}

/**
 * 节点网格对齐
 */
export function alignNodesToGrid(nodes: Node[], gridSize: number = 20): Node[] {
  return nodes.map(node => ({
    ...node,
    position: {
      x: Math.round(node.position.x / gridSize) * gridSize,
      y: Math.round(node.position.y / gridSize) * gridSize
    }
  }));
}

/**
 * 计算节点边界框
 */
export function getNodesBounds(nodes: Node[]): { 
  minX: number; 
  minY: number; 
  maxX: number; 
  maxY: number; 
  width: number; 
  height: number; 
} {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  const nodeWidth = 180; // 默认节点宽度
  const nodeHeight = 40;  // 默认节点高度

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach(node => {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + nodeWidth);
    maxY = Math.max(maxY, node.position.y + nodeHeight);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * 布局方向配置
 */
export const LAYOUT_DIRECTIONS = {
  'TB': { name: '纵向布局', icon: 'V' },
  'LR': { name: '横向布局', icon: 'H' }
} as const;

/**
 * 对齐选项配置
 */
export interface AlignmentOptions {
  snapToGrid: boolean;
  gridSize: number;
  snapToNodes: boolean;
  snapDistance: number;
  alignToEdges: boolean;
  alignToCenter: boolean;
  enableAnimation: boolean;
}

/**
 * 默认对齐选项
 */
export const DEFAULT_ALIGNMENT_OPTIONS: AlignmentOptions = {
  snapToGrid: true,
  gridSize: 20,
  snapToNodes: true,
  snapDistance: 10,
  alignToEdges: true,
  alignToCenter: true,
  enableAnimation: true
};

/**
 * 查找最近的对齐位置
 */
export function findNearestAlignment(
  draggedNode: Node,
  otherNodes: Node[],
  options: AlignmentOptions = DEFAULT_ALIGNMENT_OPTIONS
): { x: number; y: number; alignedTo?: string } {
  let bestX = draggedNode.position.x;
  let bestY = draggedNode.position.y;
  let alignedTo: string | undefined;

  // 网格对齐
  if (options.snapToGrid) {
    bestX = Math.round(bestX / options.gridSize) * options.gridSize;
    bestY = Math.round(bestY / options.gridSize) * options.gridSize;
    alignedTo = 'grid';
  }

  // 节点对齐
  if (options.snapToNodes && otherNodes.length > 0) {
    const nodeAlignment = findNodeAlignment(draggedNode, otherNodes, options);
    if (nodeAlignment.alignedTo) {
      bestX = nodeAlignment.x;
      bestY = nodeAlignment.y;
      alignedTo = nodeAlignment.alignedTo;
    }
  }

  return { x: bestX, y: bestY, alignedTo };
}

/**
 * 查找节点对齐
 */
function findNodeAlignment(
  draggedNode: Node,
  otherNodes: Node[],
  options: AlignmentOptions
): { x: number; y: number; alignedTo?: string } {
  let bestX = draggedNode.position.x;
  let bestY = draggedNode.position.y;
  let minDistance = Infinity;
  let alignedTo: string | undefined;

  const draggedCenterX = draggedNode.position.x + 90; // 节点宽度的一半
  const draggedCenterY = draggedNode.position.y + 20; // 节点高度的一半

  otherNodes.forEach(node => {
    if (node.id === draggedNode.id) return;

    const nodeCenterX = node.position.x + 90;
    const nodeCenterY = node.position.y + 20;

    // 水平对齐检查
    if (options.alignToCenter) {
      // 中心对齐
      const centerDistanceY = Math.abs(draggedCenterY - nodeCenterY);
      if (centerDistanceY <= options.snapDistance && centerDistanceY < minDistance) {
        bestY = nodeCenterY - 20; // 调整到中心对齐
        minDistance = centerDistanceY;
        alignedTo = `center-${node.id}`;
      }
    }

    if (options.alignToEdges) {
      // 顶部对齐
      const topDistance = Math.abs(draggedNode.position.y - node.position.y);
      if (topDistance <= options.snapDistance && topDistance < minDistance) {
        bestY = node.position.y;
        minDistance = topDistance;
        alignedTo = `top-${node.id}`;
      }

      // 底部对齐
      const bottomDistance = Math.abs(
        (draggedNode.position.y + 40) - (node.position.y + 40)
      );
      if (bottomDistance <= options.snapDistance && bottomDistance < minDistance) {
        bestY = node.position.y;
        minDistance = bottomDistance;
        alignedTo = `bottom-${node.id}`;
      }
    }

    // 垂直对齐检查
    if (options.alignToCenter) {
      // 中心对齐
      const centerDistanceX = Math.abs(draggedCenterX - nodeCenterX);
      if (centerDistanceX <= options.snapDistance && centerDistanceX < minDistance) {
        bestX = nodeCenterX - 90; // 调整到中心对齐
        minDistance = centerDistanceX;
        alignedTo = `center-${node.id}`;
      }
    }

    if (options.alignToEdges) {
      // 左边对齐
      const leftDistance = Math.abs(draggedNode.position.x - node.position.x);
      if (leftDistance <= options.snapDistance && leftDistance < minDistance) {
        bestX = node.position.x;
        minDistance = leftDistance;
        alignedTo = `left-${node.id}`;
      }

      // 右边对齐
      const rightDistance = Math.abs(
        (draggedNode.position.x + 180) - (node.position.x + 180)
      );
      if (rightDistance <= options.snapDistance && rightDistance < minDistance) {
        bestX = node.position.x;
        minDistance = rightDistance;
        alignedTo = `right-${node.id}`;
      }
    }
  });

  return { x: bestX, y: bestY, alignedTo };
}

/**
 * 批量对齐多个节点
 */
export function alignMultipleNodes(
  selectedNodes: Node[],
  alignType: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY' | 'distributeX' | 'distributeY'
): Node[] {
  if (selectedNodes.length < 2) return selectedNodes;

  const alignedNodes = [...selectedNodes];

  switch (alignType) {
    case 'left':
      const leftmostX = Math.min(...selectedNodes.map(n => n.position.x));
      alignedNodes.forEach(node => { node.position.x = leftmostX; });
      break;

    case 'right':
      const rightmostX = Math.max(...selectedNodes.map(n => n.position.x + 180));
      alignedNodes.forEach(node => { node.position.x = rightmostX - 180; });
      break;

    case 'top':
      const topmostY = Math.min(...selectedNodes.map(n => n.position.y));
      alignedNodes.forEach(node => { node.position.y = topmostY; });
      break;

    case 'bottom':
      const bottommostY = Math.max(...selectedNodes.map(n => n.position.y + 40));
      alignedNodes.forEach(node => { node.position.y = bottommostY - 40; });
      break;

    case 'centerX':
      const avgX = selectedNodes.reduce((sum, n) => sum + n.position.x + 90, 0) / selectedNodes.length;
      alignedNodes.forEach(node => { node.position.x = avgX - 90; });
      break;

    case 'centerY':
      const avgY = selectedNodes.reduce((sum, n) => sum + n.position.y + 20, 0) / selectedNodes.length;
      alignedNodes.forEach(node => { node.position.y = avgY - 20; });
      break;

    case 'distributeX':
      alignedNodes.sort((a, b) => a.position.x - b.position.x);
      const totalWidthX = alignedNodes[alignedNodes.length - 1].position.x - alignedNodes[0].position.x;
      const spacingX = totalWidthX / (alignedNodes.length - 1);
      alignedNodes.forEach((node, index) => {
        if (index > 0 && index < alignedNodes.length - 1) {
          node.position.x = alignedNodes[0].position.x + spacingX * index;
        }
      });
      break;

    case 'distributeY':
      alignedNodes.sort((a, b) => a.position.y - b.position.y);
      const totalHeightY = alignedNodes[alignedNodes.length - 1].position.y - alignedNodes[0].position.y;
      const spacingY = totalHeightY / (alignedNodes.length - 1);
      alignedNodes.forEach((node, index) => {
        if (index > 0 && index < alignedNodes.length - 1) {
          node.position.y = alignedNodes[0].position.y + spacingY * index;
        }
      });
      break;
  }

  return alignedNodes;
}

/**
 * 平滑动画移动节点到目标位置
 */
export function animateNodeToPosition(
  node: Node,
  targetPosition: { x: number; y: number },
  _duration: number = 300
): Promise<Node> {
  // 简化版本：直接返回目标位置的节点
  return Promise.resolve({
    ...node,
    position: targetPosition
  });
} 