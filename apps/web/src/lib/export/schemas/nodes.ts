import z from 'zod';

export const TriggerSchema = z
  .object({
    push: z
      .object({
        branches: z.array(z.string()).optional(),
      })
      .optional(),
    pull_request: z
      .object({
        branches: z.array(z.string()).optional(),
      })
      .optional(),
  })
  .refine((data) => data.push || data.pull_request, {
    message: 'At least one trigger (push or pull_request) must be configured',
    path: ['trigger'],
  });
export type Trigger = z.infer<typeof TriggerSchema>;

export const UsesStepSchema = z.object({
  name: z.string().optional(),
  uses: z.string(),
  with: z.record(z.string(), z.any()).optional(),
  env: z.record(z.string(), z.string()).optional(),
  if: z.string().optional(),
  'continue-on-error': z.boolean().optional(),
  'timeout-minutes': z.number().optional(),
});

export const RunStepSchema = z.object({
  name: z.string().optional(),
  run: z.string(),
  shell: z.string().optional(),
  'working-directory': z.string().optional(),
  env: z.record(z.string(), z.string()).optional(),
  if: z.string().optional(),
  'continue-on-error': z.boolean().optional(),
  'timeout-minutes': z.number().optional(),
});

export const StepSchema = z.union([UsesStepSchema, RunStepSchema]);

export type UsesStep = z.infer<typeof UsesStepSchema>;
export type RunStep = z.infer<typeof RunStepSchema>;
export type Step = z.infer<typeof StepSchema>;

export const JobSchema = z.object({
  'runs-on': z.string(),
  steps: z.array(StepSchema).optional(),
});

export type Job = z.infer<typeof JobSchema>;

export const JobsSchema = z.record(z.string().min(2).max(100), JobSchema);

export type Jobs = z.infer<typeof JobsSchema>;
