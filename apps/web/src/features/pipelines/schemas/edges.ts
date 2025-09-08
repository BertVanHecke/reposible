import z from 'zod';

// Edge schema
export type PipelineEdge = z.infer<typeof EdgeSchema>;
const EdgeSchema = z.object({
  id: z.string().min(1, 'Edge ID cannot be empty'),
  source: z.string().min(1, 'Edge source node ID is required'),
  target: z.string().min(1, 'Edge target node ID is required'),
  type: z.string().optional(),
  animated: z.boolean().optional(),
});

export { EdgeSchema };
