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
 * 连线穿越检测和优化
 */

/**
 * 线段相交检测
 */
export function doLinesIntersect(
  line1Start: { x: number; y: number },
  line1End: { x: number; y: number },
  line2Start: { x: number; y: number },
  line2End: { x: number; y: number }
): boolean {
  const x1 = line1Start.x, y1 = line1Start.y;
  const x2 = line1End.x, y2 = line1End.y;
  const x3 = line2Start.x, y3 = line2Start.y;
  const x4 = line2End.x, y4 = line2End.y;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-10) return false; // 平行线

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

/**
 * 检测连线是否穿越节点
 */
export function doesEdgeCrossNode(
  edgeStart: { x: number; y: number },
  edgeEnd: { x: number; y: number },
  node: Node,
  nodeWidth: number = 180,
  nodeHeight: number = 40
): boolean {
  const nodeLeft = node.position.x;
  const nodeRight = node.position.x + nodeWidth;
  const nodeTop = node.position.y;
  const nodeBottom = node.position.y + nodeHeight;

  // 检查连线是否与节点边界相交
  const nodeEdges = [
    { start: { x: nodeLeft, y: nodeTop }, end: { x: nodeRight, y: nodeTop } }, // 上边
    { start: { x: nodeRight, y: nodeTop }, end: { x: nodeRight, y: nodeBottom } }, // 右边
    { start: { x: nodeRight, y: nodeBottom }, end: { x: nodeLeft, y: nodeBottom } }, // 下边
    { start: { x: nodeLeft, y: nodeBottom }, end: { x: nodeLeft, y: nodeTop } } // 左边
  ];

  return nodeEdges.some(nodeEdge =>
    doLinesIntersect(edgeStart, edgeEnd, nodeEdge.start, nodeEdge.end)
  );
}

/**
 * 检测DAG中的连线穿越问题
 */
export interface EdgeCrossingInfo {
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  crossingNodes: string[];
  severity: 'low' | 'medium' | 'high';
}

// 移除重复的calculateNodeLevels函数定义，使用已有的export版本

export function detectEdgeCrossings(
  nodes: Node[], 
  edges: Edge[],
  nodeWidth: number = 180,
  nodeHeight: number = 40
): EdgeCrossingInfo[] {
  const crossings: EdgeCrossingInfo[] = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  
  // 🎯 关键优化：计算节点层级，只对跨层级连线进行穿越检测
  const nodeLevels = calculateNodeLevels(nodes, edges);

  edges.forEach(edge => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    
    if (!sourceNode || !targetNode) return;
    
    // 获取源节点和目标节点的层级
    const sourceLevel = nodeLevels.get(edge.source) || 0;
    const targetLevel = nodeLevels.get(edge.target) || 0;
    const levelSpan = Math.abs(targetLevel - sourceLevel);
    
    // ⭐ 核心优化：只对真正跨越多个层级的连线进行穿越检测
    // 相邻层级连接（levelSpan <= 1）保持直接连线，不进行绕行优化
    if (levelSpan <= 1) {
      console.log(`🔄 保持直接连线: ${edge.source}(L${sourceLevel}) -> ${edge.target}(L${targetLevel})`);
      return; // 跳过相邻层级的连线
    }

    console.log(`🚫 检测跨层级连线: ${edge.source}(L${sourceLevel}) -> ${edge.target}(L${targetLevel}), 跨度: ${levelSpan}`);

    // 计算连线的起点和终点（节点中心）
    const edgeStart = {
      x: sourceNode.position.x + nodeWidth / 2,
      y: sourceNode.position.y + nodeHeight / 2
    };
    const edgeEnd = {
      x: targetNode.position.x + nodeWidth / 2,
      y: targetNode.position.y + nodeHeight / 2
    };

    // 检查哪些节点被此连线穿越
    const crossingNodes: string[] = [];
    nodes.forEach(node => {
      if (node.id === edge.source || node.id === edge.target) return;
      
      const nodeLevel = nodeLevels.get(node.id) || 0;
      const minLevel = Math.min(sourceLevel, targetLevel);
      const maxLevel = Math.max(sourceLevel, targetLevel);
      
      // 只检查位于源节点和目标节点层级之间的节点
      if (nodeLevel > minLevel && nodeLevel < maxLevel) {
        if (doesEdgeCrossNode(edgeStart, edgeEnd, node, nodeWidth, nodeHeight)) {
          crossingNodes.push(node.id);
        }
      }
    });

    if (crossingNodes.length > 0) {
      // 根据穿越节点数量确定严重程度
      let severity: 'low' | 'medium' | 'high' = 'low';
      if (crossingNodes.length >= 3) severity = 'high';
      else if (crossingNodes.length >= 2) severity = 'medium';

      crossings.push({
        edgeId: edge.id,
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
        crossingNodes,
        severity
      });
    }
  });

  return crossings;
}

/**
 * 优化布局以减少连线穿越
 */
export function optimizeLayoutForEdgeCrossings(
  nodes: Node[], 
  edges: Edge[], 
  options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS
): Node[] {
  // 首先检测连线穿越
  const crossings = detectEdgeCrossings(nodes, edges);
  
  if (crossings.length === 0) {
    return nodes; // 没有穿越问题，返回原节点
  }

  console.log('检测到连线穿越问题:', crossings);

  // 对于有严重穿越问题的连线，尝试调整节点位置
  const optimizedNodes = [...nodes];
  const nodeMap = new Map(optimizedNodes.map(n => [n.id, n]));

  crossings.forEach(crossing => {
    if (crossing.severity === 'high' || crossing.severity === 'medium') {
      const sourceNode = nodeMap.get(crossing.sourceNodeId);
      const targetNode = nodeMap.get(crossing.targetNodeId);
      
      if (sourceNode && targetNode) {
        // 尝试水平偏移来避免穿越
        adjustNodePositionToAvoidCrossing(sourceNode, targetNode, crossing.crossingNodes, nodeMap, options);
      }
    }
  });

  return optimizedNodes;
}

/**
 * 调整节点位置以避免连线穿越（增强版：根据穿越严重程度调整偏移量）
 */
function adjustNodePositionToAvoidCrossing(
  sourceNode: Node,
  targetNode: Node,
  crossingNodeIds: string[],
  nodeMap: Map<string, Node>,
  options: LayoutOptions
): void {
  // 计算穿越节点的平均位置
  const crossingNodes = crossingNodeIds.map(id => nodeMap.get(id)).filter(Boolean) as Node[];
  if (crossingNodes.length === 0) return;

  // 移除未使用的avgCrossingX变量，改用crossingCenterX
  
  // 🎯 增强：根据穿越节点数量动态调整偏移量
  const severityMultiplier = Math.max(1.5, crossingNodes.length * 0.8); // 穿越越多，偏移越大
  
  console.log(`🔧 调整连线 ${sourceNode.id}→${targetNode.id}，穿越${crossingNodes.length}个节点，倍数: ${severityMultiplier}`);
  
  // 根据布局方向调整
  if (options.direction === 'LR') {
    // 横向布局：尝试垂直偏移
    const baseOffset = options.nodeSpacing.y * 1.2 * severityMultiplier; // 增大基础偏移量
    
    // 判断连线在穿越节点的上方还是下方
    const sourceY = sourceNode.position.y;
    const targetY = targetNode.position.y;
    const avgCrossingY = crossingNodes.reduce((sum, node) => sum + node.position.y, 0) / crossingNodes.length;
    
    if (sourceY < avgCrossingY && targetY < avgCrossingY) {
      // 连线在穿越节点上方，目标节点向上偏移
      targetNode.position.y -= baseOffset;
      console.log(`  ↑ 目标节点 ${targetNode.id} 向上偏移 ${baseOffset}px`);
    } else if (sourceY > avgCrossingY && targetY > avgCrossingY) {
      // 连线在穿越节点下方，目标节点向下偏移
      targetNode.position.y += baseOffset;
      console.log(`  ↓ 目标节点 ${targetNode.id} 向下偏移 ${baseOffset}px`);
    }
  } else {
    // 纵向布局：尝试水平偏移
    const baseOffset = options.nodeSpacing.x * 1.0 * severityMultiplier; // 增大基础偏移量
    
    // 🎯 Phase 2.5 强化绕行策略：确保完全避开穿越区域
    const sourceX = sourceNode.position.x;
    const targetX = targetNode.position.x;
    
    // 计算穿越节点的完整边界区域（包括节点宽度）
    const minCrossingX = Math.min(...crossingNodes.map(n => n.position.x));
    const maxCrossingX = Math.max(...crossingNodes.map(n => n.position.x + 180)); // 节点宽度180px
    const crossingWidth = maxCrossingX - minCrossingX;
    const crossingCenterX = (minCrossingX + maxCrossingX) / 2;
    
    console.log(`  📊 穿越区域分析: X范围[${minCrossingX}, ${maxCrossingX}], 宽度: ${crossingWidth}px, 中心: ${crossingCenterX}px`);
    console.log(`  📍 当前位置: 源节点X=${sourceX}, 目标节点X=${targetX}`);
    
    // 🚀 增强策略：确保偏移量足够大，完全避开穿越区域
    const safeMargin = 50; // 安全边距
    const minRequiredOffset = crossingWidth / 2 + safeMargin;
    const finalOffset = Math.max(baseOffset, minRequiredOffset);
    
    // 🔄 智能路径选择：选择最有效的绕行方向
    const sourceLeftSpace = sourceX - minCrossingX;
    const sourceRightSpace = maxCrossingX - sourceX;
    const targetLeftSpace = targetX - minCrossingX;
    const targetRightSpace = maxCrossingX - targetX;
    
    console.log(`  🧭 空间分析: 源节点(左${sourceLeftSpace}px, 右${sourceRightSpace}px), 目标节点(左${targetLeftSpace}px, 右${targetRightSpace}px)`);
    
    // 如果源节点和目标节点都在穿越区域同一侧，优先向外侧偏移
    if (sourceX > crossingCenterX && targetX > crossingCenterX) {
      // 都在右侧，向右偏移更远
      const rightOffset = finalOffset * 1.5;
      targetNode.position.x += rightOffset;
      sourceNode.position.x += rightOffset * 0.6; // 源节点也小幅偏移
      console.log(`  🔄 向右绕行: 目标节点向右偏移 ${rightOffset}px, 源节点向右偏移 ${rightOffset * 0.6}px`);
    } else if (sourceX < crossingCenterX && targetX < crossingCenterX) {
      // 都在左侧，向左偏移更远
      const leftOffset = finalOffset * 1.5;
      targetNode.position.x -= leftOffset;
      sourceNode.position.x -= leftOffset * 0.6;
      console.log(`  🔄 向左绕行: 目标节点向左偏移 ${leftOffset}px, 源节点向左偏移 ${leftOffset * 0.6}px`);
    } else {
      // 跨越中心，选择阻力最小的路径
      if (targetRightSpace > targetLeftSpace) {
        // 目标节点右侧空间更大，向右绕行
        targetNode.position.x = maxCrossingX + safeMargin;
        console.log(`  ➡️ 强制右绕行: 目标节点移至 X=${targetNode.position.x}px (穿越区域右侧)`);
      } else {
        // 目标节点左侧空间更大，向左绕行  
        targetNode.position.x = minCrossingX - 180 - safeMargin; // 考虑节点宽度
        console.log(`  ⬅️ 强制左绕行: 目标节点移至 X=${targetNode.position.x}px (穿越区域左侧)`);
      }
    }
  }
}

/**
 * 复杂DAG连线穿越分析
 */
export interface DAGAnalysisResult {
  totalNodes: number;
  totalEdges: number;
  crossingEdges: EdgeCrossingInfo[];
  severitySummary: {
    high: number;
    medium: number;
    low: number;
  };
  suggestions: string[];
}

export function analyzeComplexDAG(nodes: Node[], edges: Edge[]): DAGAnalysisResult {
  const crossings = detectEdgeCrossings(nodes, edges);
  
  const severitySummary = {
    high: crossings.filter(c => c.severity === 'high').length,
    medium: crossings.filter(c => c.severity === 'medium').length,
    low: crossings.filter(c => c.severity === 'low').length
  };

  const suggestions: string[] = [];
  
  if (severitySummary.high > 0) {
    suggestions.push(`发现 ${severitySummary.high} 个严重连线穿越问题，建议调整布局方向或节点位置`);
  }
  
  if (crossings.length > nodes.length * 0.3) {
    suggestions.push('连线穿越过多，建议使用分层布局或增加节点间距');
  }
  
  if (nodes.length > 20) {
    suggestions.push('节点数量较多，建议使用分组展示或折叠部分节点');
  }

  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    crossingEdges: crossings,
    severitySummary,
    suggestions
  };
}

/**
 * 增强的连线穿越优化算法 - 针对复杂DAG
 */
export function optimizeComplexDAGLayout(
  nodes: Node[], 
  edges: Edge[], 
  options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS
): Node[] {
  // 1. 分析当前问题
  const analysis = analyzeComplexDAG(nodes, edges);
  
  if (analysis.crossingEdges.length === 0) {
    return nodes;
  }

  console.log('复杂DAG分析结果:', analysis);
  
  // 2. 使用基础智能布局
  let optimizedNodes = calculateSmartLayout(nodes, edges, options);
  
  // 3. 针对严重穿越问题应用特殊处理
  const severeCrossings = analysis.crossingEdges.filter(c => 
    c.severity === 'high' || c.severity === 'medium'
  );
  
  if (severeCrossings.length > 0) {
    optimizedNodes = applySevereCrossingFixes(optimizedNodes, edges, severeCrossings, options);
  }
  
  // 4. 最终微调
  optimizedNodes = applyFineTuning(optimizedNodes, edges, options);
  
  return optimizedNodes;
}

/**
 * 处理严重的连线穿越问题
 */
function applySevereCrossingFixes(
  nodes: Node[],
  _edges: Edge[],
  severeCrossings: EdgeCrossingInfo[],
  options: LayoutOptions
): Node[] {
  const optimizedNodes = [...nodes];
  const nodeMap = new Map(optimizedNodes.map(n => [n.id, n]));
  
  // 按严重程度排序，优先处理最严重的问题
  severeCrossings.sort((a, b) => {
    const severityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
  
  severeCrossings.forEach(crossing => {
    const sourceNode = nodeMap.get(crossing.sourceNodeId);
    const targetNode = nodeMap.get(crossing.targetNodeId);
    
    if (sourceNode && targetNode && crossing.crossingNodes.length >= 2) {
      // 对于穿越多个节点的连线，尝试更大的偏移
      const offsetMultiplier = Math.min(crossing.crossingNodes.length, 3);
      applyEnhancedPositionAdjustment(
        sourceNode, 
        targetNode, 
        crossing.crossingNodes, 
        nodeMap, 
        options,
        offsetMultiplier
      );
    }
  });
  
  return optimizedNodes;
}

/**
 * 增强的位置调整算法
 */
function applyEnhancedPositionAdjustment(
  sourceNode: Node,
  targetNode: Node,
  crossingNodeIds: string[],
  nodeMap: Map<string, Node>,
  options: LayoutOptions,
  offsetMultiplier: number = 1
): void {
  const crossingNodes = crossingNodeIds.map(id => nodeMap.get(id)).filter(Boolean) as Node[];
  if (crossingNodes.length === 0) return;

  // 计算穿越区域的边界
  const crossingBounds = {
    minX: Math.min(...crossingNodes.map(n => n.position.x)),
    maxX: Math.max(...crossingNodes.map(n => n.position.x + 180)),
    minY: Math.min(...crossingNodes.map(n => n.position.y)),
    maxY: Math.max(...crossingNodes.map(n => n.position.y + 40))
  };
  
  const baseOffset = options.direction === 'LR' 
    ? options.nodeSpacing.y * 0.8 * offsetMultiplier
    : options.nodeSpacing.x * 0.6 * offsetMultiplier;
    
  if (options.direction === 'LR') {
    // 横向布局：垂直偏移
    const sourceY = sourceNode.position.y + 20; // 节点中心Y
    const targetY = targetNode.position.y + 20;
    const crossingCenterY = (crossingBounds.minY + crossingBounds.maxY) / 2;
    
    if (sourceY < crossingCenterY && targetY < crossingCenterY) {
      // 连线在穿越区域上方，向上偏移更多
      targetNode.position.y -= baseOffset;
      sourceNode.position.y -= baseOffset * 0.5;
    } else if (sourceY > crossingCenterY && targetY > crossingCenterY) {
      // 连线在穿越区域下方，向下偏移更多
      targetNode.position.y += baseOffset;
      sourceNode.position.y += baseOffset * 0.5;
    } else {
      // 连线穿越中心，选择较少占用的方向
      if (sourceY < crossingCenterY) {
        targetNode.position.y -= baseOffset;
      } else {
        targetNode.position.y += baseOffset;
      }
    }
  } else {
    // 纵向布局：水平偏移
    const sourceX = sourceNode.position.x + 90; // 节点中心X
    const targetX = targetNode.position.x + 90;
    const crossingCenterX = (crossingBounds.minX + crossingBounds.maxX) / 2;
    
    if (sourceX < crossingCenterX && targetX < crossingCenterX) {
      // 连线在穿越区域左侧，向左偏移更多
      targetNode.position.x -= baseOffset;
      sourceNode.position.x -= baseOffset * 0.5;
    } else if (sourceX > crossingCenterX && targetX > crossingCenterX) {
      // 连线在穿越区域右侧，向右偏移更多
      targetNode.position.x += baseOffset;
      sourceNode.position.x += baseOffset * 0.5;
    } else {
      // 连线穿越中心，选择较少占用的方向
      if (sourceX < crossingCenterX) {
        targetNode.position.x -= baseOffset;
      } else {
        targetNode.position.x += baseOffset;
      }
    }
  }
}

/**
 * 最终微调优化
 */
function applyFineTuning(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions
): Node[] {
  let currentNodes = [...nodes];
  
  // 迭代优化：最多3次
  for (let iteration = 0; iteration < 3; iteration++) {
    const crossings = detectEdgeCrossings(currentNodes, edges);
    
    if (crossings.length === 0) break;
    
    // 微调幅度递减
    const microAdjustment = options.nodeSpacing.x * 0.1 * (1 - iteration * 0.3);
    
    crossings.forEach(crossing => {
      if (crossing.crossingNodes.length === 1) {
        // 只影响单个节点的轻微穿越，微调即可
        const nodeMap = new Map(currentNodes.map(n => [n.id, n]));
        const sourceNode = nodeMap.get(crossing.sourceNodeId);
        const targetNode = nodeMap.get(crossing.targetNodeId);
        
        if (sourceNode && targetNode) {
          if (options.direction === 'LR') {
            targetNode.position.y += iteration % 2 === 0 ? microAdjustment : -microAdjustment;
          } else {
            targetNode.position.x += iteration % 2 === 0 ? microAdjustment : -microAdjustment;
          }
        }
      }
    });
  }
  
  return currentNodes;
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