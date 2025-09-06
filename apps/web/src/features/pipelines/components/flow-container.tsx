'use client';
import '@xyflow/react/dist/style.css';
import {
  addEdge,
  Background,
  Edge,
  Node,
  OnConnect,
  Panel,
  ReactFlow,
  DefaultEdgeOptions,
  FitViewOptions,
  useNodesState,
  useEdgesState,
  Position,
  ConnectionLineType,
  useReactFlow,
} from '@xyflow/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@repo/ui/components/base/button';
import CircularRunNode from './nodes/circular-run-node';
import CircularUsesNode from './nodes/circular-uses-node';
import CircularJobNode from './nodes/circular-job-node';
import CircularTriggerNode from './nodes/circular-trigger-node';
import { NodeEditorPanel } from './node-editor-panel';

import dagre from '@dagrejs/dagre';
import { FlowDock } from '@/components/dock';

const nodeTypes = {
  runNode: CircularRunNode,
  usesNode: CircularUsesNode,
  jobNode: CircularJobNode,
  triggerNode: CircularTriggerNode,
};

const initialNodes: Node[] = [];

const initialEdges: Edge[] = [];

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const nodeWidth = 80;
const nodeHeight = 80;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 150 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
};

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  initialNodes,
  initialEdges
);

export default function FlowContainer() {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const { getNodes, getEdges, fitView } = useReactFlow();

  // Generate unique node ID
  const generateNodeId = useCallback((type: string) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${type}-${timestamp}-${random}`;
  }, []);

  // Get default data for new nodes
  const getDefaultNodeData = (nodeType: string) => {
    switch (nodeType) {
      case 'runNode':
        return { run: 'echo "New step"' };
      case 'usesNode':
        return { uses: 'actions/checkout@v4' };
      case 'jobNode':
        return { name: 'new-job', 'runs-on': 'ubuntu-latest' };
      case 'triggerNode':
        return { event: 'push', branches: ['main'] };
      default:
        return {};
    }
  };

  const relayout = useCallback(
    (newNodeId: string) => {
      const latestNodes = getNodes();
      const latestEdges = getEdges();

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        latestNodes,
        latestEdges
      ); // your dagre/elk function

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

      const newNode = layoutedNodes.find((node) => node.id === newNodeId);

      if (newNode) {
        setSelectedNode(newNode);
        setIsPanelOpen(true);

        // Center the selected node on the canvas
        fitView({
          nodes: [{ id: newNode.id }],
          duration: 300,
          padding: 0.3,
        });
      }
    },
    [getNodes, getEdges, setNodes, setEdges, setSelectedNode, setIsPanelOpen, fitView]
  );

  // Add node after an existing node (for sequential flow)
  const onAddNodeAfter = useCallback(
    (sourceNodeId: string, nodeType: 'runNode' | 'usesNode' | 'jobNode') => {
      const newNodeId = generateNodeId(nodeType.replace('Node', ''));

      const currentNodes = getNodes();
      const sourceNode = currentNodes.find((n) => n.id === sourceNodeId);
      if (!sourceNode) return currentNodes;

      const newNode = {
        id: newNodeId,
        type: nodeType,
        position: { x: 0, y: 0 },
        data: {
          ...getDefaultNodeData(nodeType),
          onAddNodeAfter: onAddNodeAfter,
        },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
      };

      setNodes((currentNodes) => {
        const newNodes = [...currentNodes, newNode];
        return newNodes;
      });

      // Create an edge from source to new node
      const newEdge = {
        id: `e-${sourceNodeId}-${newNodeId}`,
        source: sourceNodeId,
        target: newNodeId,
        type: ConnectionLineType.SmoothStep,
        animated: true,
      };

      setEdges((eds) => {
        return [...eds, newEdge];
      });

      requestAnimationFrame(() => relayout(newNodeId));
    },
    [generateNodeId, setNodes, setEdges, getNodes, relayout]
  );

  // Add new node function (only for initial trigger from dock)
  const onAddNode = useCallback(
    (nodeType: 'triggerNode') => {
      const newNode = {
        id: generateNodeId(nodeType.replace('Node', '')),
        type: nodeType,
        position: {
          x: 0,
          y: 0,
        },
        data: {
          ...getDefaultNodeData(nodeType),
          onAddNodeAfter: onAddNodeAfter,
        },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
      };

      setNodes((nds) => [...nds, newNode]);

      // Select the newly created node
      setSelectedNode(newNode);
      setIsPanelOpen(true);
    },
    [generateNodeId, setNodes, onAddNodeAfter]
  );

  // Delete node function
  const onDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));

      // Close panel if the deleted node was selected
      if (selectedNode?.id === nodeId) {
        setIsPanelOpen(false);
        setSelectedNode(null);

        // Zoom back out to show all nodes when closing the panel
        fitView({
          duration: 300,
          padding: 0.2,
        });
      }
    },
    [setNodes, setEdges, selectedNode, fitView]
  );

  const onConnect: OnConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, type: ConnectionLineType.SmoothStep, animated: true }, eds)
      ),
    [setEdges]
  );

  const onLayout = useCallback(
    (direction: string) => {
      setIsPanelOpen(false);
      setSelectedNode(null);

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);

      // Zoom back out to show all nodes when closing the panel
      fitView({
        duration: 300,
        padding: 0.2,
      });
    },
    [nodes, edges, setNodes, setEdges, fitView]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);

      // Center the selected node on the canvas
      fitView({
        nodes: [{ id: node.id }],
        duration: 300,
        padding: 0.3,
      });
    },
    [fitView]
  );

  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      setIsPanelOpen(true);

      // Center the selected node on the canvas
      fitView({
        nodes: [{ id: node.id }],
        duration: 300,
        padding: 0.3,
      });
    },
    [fitView]
  );

  const onUpdateNodeData = useCallback(
    (nodeId: string, newData: Record<string, any>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
        )
      );
    },
    [setNodes]
  );

  const onClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setSelectedNode(null);

    // Zoom back out to show all nodes when closing the panel
    fitView({
      duration: 300,
      padding: 0.2,
    });
  }, [fitView]);

  const onPaneClick = useCallback(() => {
    // Close the panel when clicking on the canvas background
    if (isPanelOpen) {
      onClosePanel();
    }
  }, [isPanelOpen, onClosePanel]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      <ReactFlow
        colorMode={theme as 'light' | 'dark' | 'system'}
        nodes={nodes}
        nodeTypes={nodeTypes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        fitViewOptions={fitViewOptions}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
      >
        <Panel position="top-right">
          <div className="flex gap-2">
            <Button variant={'outline'}>Export</Button>
          </div>
        </Panel>
        <Panel position="bottom-center">
          <FlowDock
            onLayout={onLayout}
            onAddNode={onAddNode}
            onAddNodeAfter={onAddNodeAfter}
            hasNodes={nodes.length > 0}
            selectedNode={selectedNode}
          />
        </Panel>
        <Background bgColor="var(--background)" />
      </ReactFlow>

      {/* Custom sliding panel that overlays the ReactFlow */}
      <div
        className={`absolute left-0 top-0 h-full w-full sm:w-96 bg-background border-r shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isPanelOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {selectedNode && (
          <NodeEditorPanel
            node={selectedNode}
            onUpdate={onUpdateNodeData}
            onClose={onClosePanel}
            onDelete={() => onDeleteNode(selectedNode.id)}
          />
        )}
      </div>
    </div>
  );
}
