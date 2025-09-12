import z from 'zod';
import { JobsSchema, TriggerSchema } from './nodes';

export const WorkflowSchema = z.object({
  name: z.string().min(2).max(100),
  on: TriggerSchema,
  jobs: JobsSchema,
});

export type Workflow = z.infer<typeof WorkflowSchema>;
