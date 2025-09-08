import { z } from 'zod';
import { EdgeSchema, PipelineEdge } from './edges';
import { Edge, Node, Position } from '@xyflow/react';

// Specific node type schemas that extend React Flow's Node
// 1) Data schema for your custom fields
export const TriggerNodeDataSchema = z.object({
  event: z.string().min(1, 'Trigger event is required'),
  branches: z.array(z.string()).optional(),
});

// 2) Full node schema that validates your keys and
//    lets React Flow add whatever else it needs
const TriggerNodeSchema = z.looseObject({
  type: z.literal('triggerNode'),
  data: TriggerNodeDataSchema,
});

// 3) TS types stay aligned with React Flow’s Node generic
export type TriggerNodeData = z.infer<typeof TriggerNodeDataSchema>;
export type TriggerNode = Node<TriggerNodeData, 'triggerNode'>;

// Job Node
export const JobNodeDataSchema = z.object({
  name: z.string().min(1, 'Job name is required'),
  'runs-on': z.string().min(1, 'Job runner is required'),
});

const JobNodeSchema = z.looseObject({
  type: z.literal('jobNode'),
  data: JobNodeDataSchema,
});

export type JobNodeData = z.infer<typeof JobNodeDataSchema>;
export type JobNode = Node<JobNodeData, 'jobNode'>;

// Run Node
export const RunNodeDataSchema = z.object({
  run: z.string().min(1, 'Run command is required'),
});

const RunNodeSchema = z.looseObject({
  type: z.literal('runNode'),
  data: RunNodeDataSchema,
});

export type RunNodeData = z.infer<typeof RunNodeDataSchema>;
export type RunNode = Node<RunNodeData, 'runNode'>;

// Uses Node
export const UsesNodeDataSchema = z.object({
  uses: z.string().min(1, 'Action to use is required'),
  with: z.record(z.string(), z.any()).optional(),
});

const UsesNodeSchema = z.looseObject({
  type: z.literal('usesNode'),
  data: UsesNodeDataSchema,
});

export type UsesNodeData = z.infer<typeof UsesNodeDataSchema>;
export type UsesNode = Node<UsesNodeData, 'usesNode'>;

// Union of all node types
export type PipelineNode = TriggerNode | JobNode | RunNode | UsesNode;
const NodeSchema = z.discriminatedUnion('type', [
  TriggerNodeSchema,
  JobNodeSchema,
  RunNodeSchema,
  UsesNodeSchema,
]);

// Pipeline metadata schema
type PipelineMetadata = z.infer<typeof PipelineMetadataSchema>;
const PipelineMetadataSchema = z.object({
  name: z.string().min(1, 'Pipeline name is required'),
  description: z.string().optional(),
  version: z.string().default('1.0.0'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Main pipeline schema
type Pipeline = z.infer<typeof PipelineSchema>;
const PipelineSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  metadata: PipelineMetadataSchema,
});

// Custom validation functions
function validateUniqueIds(nodes: PipelineNode[], edges: PipelineEdge[]) {
  const nodeIds = nodes.map((node) => node.id);
  const edgeIds = edges.map((edge) => edge.id);
  const allIds = [...nodeIds, ...edgeIds];

  const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);

  if (duplicates.length > 0) {
    throw new Error(
      `Duplicate IDs found: ${duplicates.join(', ')}. All node and edge IDs must be unique.`
    );
  }

  // Check for duplicate node IDs specifically
  const duplicateNodes = nodeIds.filter((id, index) => nodeIds.indexOf(id) !== index);
  if (duplicateNodes.length > 0) {
    throw new Error(
      `Duplicate node IDs found: ${duplicateNodes.join(', ')}. Each node must have a unique ID.`
    );
  }

  // Check for duplicate edge IDs specifically
  const duplicateEdges = edgeIds.filter((id, index) => edgeIds.indexOf(id) !== index);
  if (duplicateEdges.length > 0) {
    throw new Error(
      `Duplicate edge IDs found: ${duplicateEdges.join(', ')}. Each edge must have a unique ID.`
    );
  }
}

/**
 * Validates that a pipeline forms a Directed Acyclic Graph (DAG).
 *
 * This function ensures that:
 * 1. All edges reference valid source and target nodes
 * 2. The graph has no cycles (no circular dependencies)
 *
 * A DAG is essential for pipeline execution because:
 * - It guarantees a valid execution order exists
 * - It prevents infinite loops during pipeline execution
 * - It ensures dependencies can be resolved in a linear fashion
 *
 * @param nodes - Array of pipeline nodes
 * @param edges - Array of pipeline edges connecting the nodes
 * @throws {Error} When edges reference non-existent nodes or when cycles are detected
 */
function validateDAG(nodes: PipelineNode[], edges: PipelineEdge[]) {
  // Build adjacency list representation of the graph
  const adjacencyList: Record<string, string[]> = {};
  const nodeIds = new Set(nodes.map((node) => node.id));

  // Initialize adjacency list with empty arrays for each node
  for (const node of nodes) {
    adjacencyList[node.id] = [];
  }

  // Build the graph by adding edges to the adjacency list
  for (const edge of edges) {
    // Validate that edges reference existing nodes
    if (!nodeIds.has(edge.source)) {
      throw new Error(`Edge references non-existent source node: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      throw new Error(`Edge references non-existent target node: ${edge.target}`);
    }

    // Add the edge to our adjacency list
    adjacencyList[edge.source]?.push(edge.target);
  }

  // Use Depth-First Search (DFS) to detect cycles
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  /**
   * Recursive DFS function to detect cycles in the graph.
   * Uses the recursion stack to track the current path and detect back edges.
   *
   * @param nodeId - Current node being visited
   * @param path - Array tracking the current path for cycle reporting
   * @returns true if a cycle is found, false otherwise
   */
  function hasCycle(nodeId: string, path: string[] = []): boolean {
    // If we encounter a node that's already in our current recursion path,
    // we've found a cycle (back edge)
    if (recursionStack.has(nodeId)) {
      const cycleStart = path.indexOf(nodeId);
      const cycle = [...path.slice(cycleStart), nodeId];
      throw new Error(
        `Cycle detected in pipeline: ${cycle.join(' → ')}. Pipelines must be acyclic (no loops).`
      );
    }

    // If we've already processed this node completely, skip it
    if (visited.has(nodeId)) {
      return false;
    }

    // Mark node as visited and add to current recursion path
    visited.add(nodeId);
    recursionStack.add(nodeId);

    // Recursively check all neighbors (nodes this node points to)
    const neighbors = adjacencyList[nodeId];
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (hasCycle(neighbor, [...path, nodeId])) {
          return true;
        }
      }
    }

    // Remove node from recursion stack as we backtrack
    recursionStack.delete(nodeId);
    return false;
  }

  // Check each node for cycles (handles disconnected components)
  for (const nodeId of nodeIds) {
    if (!visited.has(nodeId)) {
      hasCycle(nodeId);
    }
  }
}

function validatePipelineLogic(nodes: PipelineNode[], edges: PipelineEdge[]) {
  // Check that pipeline starts with a trigger
  const triggerNodes = nodes.filter((node) => node.type === 'triggerNode');
  if (triggerNodes.length === 0) {
    throw new Error('Pipeline must have at least one trigger node to define when it runs.');
  }

  // Check for orphaned nodes (nodes with no incoming edges except triggers)
  const targetNodes = new Set(edges.map((edge) => edge.target));
  const orphanedNodes = nodes.filter(
    (node) => node.type !== 'triggerNode' && !targetNodes.has(node.id)
  );

  if (orphanedNodes.length > 0) {
    const orphanedNames = orphanedNodes.map((node) => `${node.id} (${node.type})`);
    throw new Error(
      `Found disconnected nodes: ${orphanedNames.join(', ')}. All nodes except triggers must be connected to the pipeline flow.`
    );
  }
}

// Main validation function
export function validatePipeline(pipeline: Pipeline) {
  try {
    // First, validate the basic schema
    const validatedPipeline = PipelineSchema.parse(pipeline);

    // Then run custom validations (with type assertions for the loose object schemas)
    validateUniqueIds(validatedPipeline.nodes as PipelineNode[], validatedPipeline.edges);
    validateDAG(validatedPipeline.nodes as PipelineNode[], validatedPipeline.edges);
    validatePipelineLogic(validatedPipeline.nodes as PipelineNode[], validatedPipeline.edges);

    return {
      success: true,
      data: validatedPipeline,
      errors: [],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format Zod errors to be human-friendly
      const friendlyErrors = error.issues.map((err: z.core.$ZodIssue) => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });

      return {
        success: false,
        data: null,
        errors: friendlyErrors,
      };
    } else {
      // Custom validation errors
      return {
        success: false,
        data: null,
        errors: [error instanceof Error ? error.message : 'Unknown validation error'],
      };
    }
  }
}

// Helper function to validate just nodes and edges (for use in your flow container)
export function validateFlowData(nodes: Node[], edges: Edge[]) {
  const pipeline = {
    nodes: nodes as PipelineNode[], // Type assertion - validation will catch any issues
    edges: edges as PipelineEdge[],
    metadata: {
      name: 'Untitled Pipeline',
      description: '',
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  return validatePipeline(pipeline);
}

// Helper functions to create typed nodes
export function createTriggerNode(
  id: string,
  position: { x: number; y: number },
  data: TriggerNodeData
): TriggerNode {
  const newNode: TriggerNode = {
    id,
    type: 'triggerNode',
    position,
    data,
  };

  return newNode;
}

export function createJobNode(
  id: string,
  position: { x: number; y: number },
  data: JobNodeData
): JobNode {
  const newNode: JobNode = {
    id,
    type: 'jobNode',
    position,
    data,
  };

  return newNode;
}

export function createRunNode(id: string, position: { x: number; y: number }, data: RunNodeData) {
  const newNode: RunNode = {
    id,
    type: 'runNode',
    position,
    data,
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
  };

  return newNode;
}

export function createUsesNode(
  id: string,
  position: { x: number; y: number },
  data: UsesNodeData
): UsesNode {
  const newNode: UsesNode = {
    id,
    type: 'usesNode',
    position,
    data,
  };

  return newNode;
}

// Export schemas for use in other parts of the app
export {
  NodeSchema,
  PipelineSchema,
  TriggerNodeSchema,
  JobNodeSchema,
  RunNodeSchema,
  UsesNodeSchema,
};
