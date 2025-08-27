'use client';
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
import '@xyflow/react/dist/style.css';
import { useTheme } from 'next-themes';
import { Button } from '@repo/ui/components/base/button';
import '@xyflow/react/dist/style.css';
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

const initialNodes: Node[] = [
  // Trigger
  {
    id: 'trigger-push',
    type: 'triggerNode',
    position: { x: 0, y: 0 },
    data: { event: 'push', branches: ['main'] },
  },

  // Job nodes
  {
    id: 'install-job',
    type: 'jobNode',
    position: { x: 0, y: 0 },
    data: { name: 'install', 'runs-on': 'ubuntu-latest' },
  },
  {
    id: 'test-job',
    type: 'jobNode',
    position: { x: 0, y: 0 },
    data: { name: 'test', 'runs-on': 'ubuntu-latest', needs: ['install'] },
  },
  {
    id: 'build-job',
    type: 'jobNode',
    position: { x: 0, y: 0 },
    data: { name: 'build', 'runs-on': 'ubuntu-latest', needs: ['test'] },
  },
  {
    id: 'deploy-job',
    type: 'jobNode',
    position: { x: 0, y: 0 },
    data: { name: 'deploy', 'runs-on': 'ubuntu-latest', needs: ['build'] },
  },

  // Install job steps
  {
    id: 'install-checkout',
    type: 'usesNode',
    data: { uses: 'actions/checkout@v4' },
    position: { x: 0, y: 0 },
  },
  {
    id: 'install-setup-node',
    type: 'usesNode',
    data: { uses: 'actions/setup-node@v4', with: { 'node-version': 18 } },
    position: { x: 0, y: 0 },
  },
  {
    id: 'install-npm-ci',
    type: 'runNode',
    data: { run: 'npm ci' },
    position: { x: 0, y: 0 },
  },
  {
    id: 'install-upload',
    type: 'usesNode',
    data: {
      uses: 'actions/upload-artifact@v4',
      with: { name: 'node_modules', path: 'node_modules' },
    },
    position: { x: 0, y: 0 },
  },

  // Test job steps
  {
    id: 'test-checkout',
    type: 'usesNode',
    data: { uses: 'actions/checkout@v4' },
    position: { x: 0, y: 0 },
  },
  {
    id: 'test-download',
    type: 'usesNode',
    data: {
      uses: 'actions/download-artifact@v4',
      with: { name: 'node_modules', path: 'node_modules' },
    },
    position: { x: 0, y: 0 },
  },
  {
    id: 'test-run',
    type: 'runNode',
    data: { run: 'npm test' },
    position: { x: 0, y: 0 },
  },

  // Build job steps
  {
    id: 'build-checkout',
    type: 'usesNode',
    data: { uses: 'actions/checkout@v4' },
    position: { x: 0, y: 0 },
  },
  {
    id: 'build-download',
    type: 'usesNode',
    data: {
      uses: 'actions/download-artifact@v4',
      with: { name: 'node_modules', path: 'node_modules' },
    },
    position: { x: 0, y: 0 },
  },
  {
    id: 'build-run',
    type: 'runNode',
    data: { run: 'npm run build' },
    position: { x: 0, y: 0 },
  },
  {
    id: 'build-upload',
    type: 'usesNode',
    data: { uses: 'actions/upload-artifact@v4', with: { name: 'app-build', path: 'build' } },
    position: { x: 0, y: 0 },
  },

  // Deploy job steps
  {
    id: 'deploy-download',
    type: 'usesNode',
    data: { uses: 'actions/download-artifact@v4', with: { name: 'app-build', path: 'build' } },
    position: { x: 0, y: 0 },
  },
  {
    id: 'deploy-run',
    type: 'runNode',
    data: { run: 'echo "Deploying..."\nrsync -avz --delete build/ user@your-server:/var/www/app' },
    position: { x: 0, y: 0 },
  },
];

const initialEdges: Edge[] = [
  // Trigger to first job
  { id: 'e-trigger-install', source: 'trigger-push', target: 'install-job' },

  // Job dependencies
  { id: 'e-install-test', source: 'install-job', target: 'test-job' },
  { id: 'e-test-build', source: 'test-job', target: 'build-job' },
  { id: 'e-build-deploy', source: 'build-job', target: 'deploy-job' },

  // Install job steps
  { id: 'e-install-job-checkout', source: 'install-job', target: 'install-checkout' },
  { id: 'e-install-checkout-setup', source: 'install-checkout', target: 'install-setup-node' },
  { id: 'e-install-setup-ci', source: 'install-setup-node', target: 'install-npm-ci' },
  { id: 'e-install-ci-upload', source: 'install-npm-ci', target: 'install-upload' },

  // Test job steps
  { id: 'e-test-job-checkout', source: 'test-job', target: 'test-checkout' },
  { id: 'e-test-checkout-download', source: 'test-checkout', target: 'test-download' },
  { id: 'e-test-download-run', source: 'test-download', target: 'test-run' },

  // Build job steps
  { id: 'e-build-job-checkout', source: 'build-job', target: 'build-checkout' },
  { id: 'e-build-checkout-download', source: 'build-checkout', target: 'build-download' },
  { id: 'e-build-download-run', source: 'build-download', target: 'build-run' },
  { id: 'e-build-run-upload', source: 'build-run', target: 'build-upload' },

  // Deploy job steps
  { id: 'e-deploy-job-download', source: 'deploy-job', target: 'deploy-download' },
  { id: 'e-deploy-download-run', source: 'deploy-download', target: 'deploy-run' },
];

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
  const { fitView } = useReactFlow();

  const onConnect: OnConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, type: ConnectionLineType.SmoothStep, animated: true }, eds)
      ),
    [setEdges]
  );

  const onLayout = useCallback(
    (direction: string) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges, setNodes, setEdges]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      setIsPanelOpen(true);

      // Center the selected node on the canvas
      setTimeout(() => {
        fitView({
          nodes: [{ id: node.id }],
          duration: 300,
          padding: 0.3,
        });
      }, 100); // Small delay to ensure panel state is updated
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
    setTimeout(() => {
      fitView({
        duration: 300,
        padding: 0.2,
      });
    }, 100); // Small delay to ensure panel close animation starts
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
          <FlowDock onLayout={onLayout} />
        </Panel>
        <Background bgColor="var(--background)" />
      </ReactFlow>

      {/* Custom sliding panel that overlays the ReactFlow */}
      <div
        className={`absolute left-0 top-0 h-full w-96 bg-background border-r shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isPanelOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {selectedNode && (
          <NodeEditorPanel node={selectedNode} onUpdate={onUpdateNodeData} onClose={onClosePanel} />
        )}
      </div>
    </div>
  );
}
