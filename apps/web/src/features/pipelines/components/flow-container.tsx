'use client';
import '@xyflow/react/dist/style.css';
import {
  addEdge,
  Background,
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
import { toast } from 'sonner';
import CircularRunNode from './nodes/circular-run-node';
import CircularUsesNode from './nodes/circular-uses-node';
import CircularJobNode from './nodes/circular-job-node';
import CircularTriggerNode from './nodes/circular-trigger-node';
import { NodeEditorPanel } from './node-editor-panel';

import dagre from '@dagrejs/dagre';
import { FlowDock } from '@/components/dock';
import {
  PipelineNode,
  validateFlowData,
  createTriggerNode,
  createJobNode,
  createRunNode,
  createUsesNode,
  TriggerNodeData,
  JobNodeData,
  RunNodeData,
  UsesNodeData,
  PipelineNodeData,
} from '../schemas/nodes';
import { PipelineEdge } from '../schemas/edges';

const nodeTypes = {
  runNode: CircularRunNode,
  usesNode: CircularUsesNode,
  jobNode: CircularJobNode,
  triggerNode: CircularTriggerNode,
};

const initialNodes: PipelineNode[] = [];

const initialEdges: PipelineEdge[] = [];

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const nodeWidth = 80;
const nodeHeight = 80;

const getLayoutedElements = (nodes: PipelineNode[], edges: PipelineEdge[], direction = 'LR') => {
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
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<PipelineNode | null>(null);
  const { getNodes, getEdges, fitView } = useReactFlow<PipelineNode, PipelineEdge>();
  const [nodes, setNodes, onNodesChange] = useNodesState<PipelineNode>(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<PipelineEdge>(layoutedEdges);

  // Generate unique node ID
  const generateNodeId = useCallback((type: string) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${type}-${timestamp}-${random}`;
  }, []);

  // Validation function for current pipeline
  const validateCurrentPipeline = useCallback(() => {
    const validation = validateFlowData(nodes, edges);

    if (!validation.success) {
      console.warn('Pipeline validation errors:', validation.errors);
      return { isValid: false, errors: validation.errors };
    }

    console.log('Pipeline is valid!');
    return { isValid: true, errors: [] };
  }, [nodes, edges]);

  // Real-time validation with user feedback
  const validateAndNotify = useCallback(
    (newNodes: PipelineNode[], newEdges: PipelineEdge[], action: string) => {
      const validation = validateFlowData(newNodes, newEdges);

      if (!validation.success) {
        // Show validation errors to user
        toast.error(`Pipeline validation failed after ${action}`, {
          description: validation.errors.join('\n'),
        });
        console.warn('Pipeline validation errors:', validation.errors);
        return false;
      } else {
        console.log(`Pipeline validation succeeded after ${action}`);
        return true;
      }
    },
    []
  );

  // Validation function for export
  const handleExport = useCallback(() => {
    const validation = validateCurrentPipeline();

    if (!validation.isValid) {
      // Show validation errors to user
      toast.error(`Pipeline has validation errors:\n${validation.errors.join('\n')}`);
      return;
    }

    // Export logic here
    const exportData = {
      nodes: validation.isValid ? nodes : [],
      edges: validation.isValid ? edges : [],
      metadata: {
        name: 'Pipeline Export',
        description: 'Generated from Reposible pipeline builder',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    // Download as JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pipeline.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [validateCurrentPipeline, nodes, edges]);

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
      const currentEdges = getEdges();

      const sourceNode = currentNodes.find((n) => n.id === sourceNodeId);
      if (!sourceNode) {
        toast.error('Source node was not found. Please try again by adding a trigger node first.');
        return currentNodes;
      }

      const position = { x: 0, y: 0 };
      let newNode: PipelineNode;

      // Create typed node based on nodeType
      switch (nodeType) {
        case 'runNode': {
          const runData: RunNodeData = {
            run: 'echo "New step"',
          };
          newNode = createRunNode(newNodeId, position, runData);
          break;
        }
        case 'usesNode': {
          const usesData: UsesNodeData = {
            uses: 'actions/checkout@v4',
          };
          newNode = createUsesNode(newNodeId, position, usesData);
          break;
        }
        case 'jobNode': {
          const jobData: JobNodeData = {
            name: 'new-job',
            'runs-on': 'ubuntu-latest',
          };
          newNode = createJobNode(newNodeId, position, jobData);
          break;
        }
        default:
          throw new Error(`Unsupported node type: ${nodeType}`);
      }

      // Create an edge from source to new node
      const newEdge = {
        id: `e-${sourceNodeId}-${newNodeId}`,
        source: sourceNodeId,
        target: newNodeId,
        type: ConnectionLineType.SmoothStep,
        animated: true,
      };

      // Validate before applying changes
      const newNodes = [...currentNodes, newNode];
      const newEdges = [...currentEdges, newEdge];

      const isValid = validateAndNotify(
        newNodes,
        newEdges,
        `adding ${nodeType.replace('Node', ' node')}`
      );

      if (!isValid) {
        return;
      }

      // Apply changes if validation passes
      setNodes(newNodes);
      setEdges(newEdges);

      requestAnimationFrame(() => relayout(newNodeId));
    },
    [generateNodeId, setNodes, setEdges, getNodes, getEdges, relayout, validateAndNotify]
  );

  // Add new node function (only for initial trigger from dock)
  const onAddNode = useCallback(
    (nodeType: 'triggerNode') => {
      const newNodeId = generateNodeId(nodeType.replace('Node', ''));
      const position = { x: 0, y: 0 };

      let newNode: PipelineNode;

      if (nodeType === 'triggerNode') {
        const triggerData: TriggerNodeData = {
          event: 'push',
          branches: ['main'],
        };
        newNode = createTriggerNode(newNodeId, position, triggerData);
      } else {
        // This shouldn't happen given the type constraint, but for completeness
        throw new Error(`Unsupported node type: ${nodeType}`);
      }

      // Validate before applying changes
      const newNodes = [...nodes, newNode];
      const isValid = validateAndNotify(
        newNodes,
        edges,
        `adding ${nodeType.replace('Node', ' node')}`
      );

      if (!isValid) {
        return;
      }

      // Apply changes if validation passes
      setNodes(newNodes);

      requestAnimationFrame(() => relayout(newNodeId));
    },
    [generateNodeId, setNodes, nodes, edges, validateAndNotify, relayout]
  );

  // Delete node function
  const onDeleteNode = useCallback(
    (nodeId: string) => {
      const newNodes = nodes.filter((node) => node.id !== nodeId);
      const newEdges = edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);

      // Validate after deletion
      const isValid = validateAndNotify(newNodes, newEdges, 'deleting node');

      if (!isValid) {
        return;
      }

      // Apply changes regardless (deletion should usually be allowed)
      setNodes(newNodes);
      setEdges(newEdges);

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
    [setNodes, setEdges, selectedNode, fitView, nodes, edges, validateAndNotify]
  );

  const onConnect: OnConnect = useCallback(
    (params) => {
      const newEdge = { ...params, type: ConnectionLineType.SmoothStep, animated: true };
      const newEdges = addEdge(newEdge, edges);

      // Validate before applying changes
      const isValid = validateAndNotify(nodes, newEdges, 'connecting nodes');

      if (!isValid) {
        return;
      }

      // Apply changes if validation passes
      setEdges(newEdges);
    },
    [setEdges, edges, nodes, validateAndNotify]
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
    (event: React.MouseEvent, node: PipelineNode) => {
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
    (event: React.MouseEvent, node: PipelineNode) => {
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

  // Update node data
  const onUpdateNodeData = useCallback(
    (nodeId: string, newData: PipelineNodeData) => {
      const newNodes = nodes.map((node) =>
        node.id === nodeId
          ? ({ ...node, data: newData } as PipelineNode)
          : node
      );

      // Validate after data update
      const isValid = validateAndNotify(newNodes, edges, 'updating node data');

      if (!isValid) {
        toast.warning('Node data updated but pipeline now has issues', {
          description: 'Check the validation errors in the console',
          duration: 5000,
        });
      }

      // Apply changes regardless (user should be able to edit)
      setNodes(newNodes);
    },
    [setNodes, nodes, edges, validateAndNotify]
  );

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
            <Button variant={'outline'} onClick={handleExport}>
              Export
            </Button>
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
