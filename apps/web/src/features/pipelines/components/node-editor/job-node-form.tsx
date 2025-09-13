import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Terminal, Package, X } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/base/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/base/select';
import { Input } from '@repo/ui/components/base/input';
import { Button } from '@repo/ui/components/base/button';
import { Textarea } from '@repo/ui/components/base/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@repo/ui/components/base/tooltip';
import {
  JobNode,
  PipelineNodeData,
  JobNodeData,
  JobNodeDataSchema,
  Step,
  StepSchema,
} from '../../schemas/nodes';

interface SortableStepDisplayProps {
  step: Step & { id: string };
  index: number;
  onRemove: () => void;
}

function SortableStepDisplay({ step, index, onRemove }: SortableStepDisplayProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isRunStep = 'run' in step;

  return (
    <div className="relative group w-full">
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center gap-3 p-3 bg-muted/50 rounded-lg w-full min-w-0 ${
          isDragging ? 'opacity-50 shadow-lg' : ''
        }`}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Step Type Icon */}
        <div className="flex-shrink-0">
          {isRunStep ? (
            <Terminal className="w-4 h-4 text-pink-500" />
          ) : (
            <Package className="w-4 h-4 text-purple-500" />
          )}
        </div>

        {/* Step Content */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="text-sm font-medium truncate flex-1 min-w-0"
              title={step.name || (isRunStep ? 'Run Command' : 'Action Step')}
            >
              #{index + 1} {step.name || (isRunStep ? 'Run Command' : 'Action Step')}
            </span>
          </div>
          <div
            className="text-xs text-muted-foreground truncate"
            title={isRunStep ? (step as any).run : (step as any).uses}
          >
            {isRunStep ? (step as any).run?.split('\n')[0] : (step as any).uses}
          </div>
        </div>

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive flex-shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface StepFormProps {
  onAddStep: (step: Step) => void;
}

function StepForm({ onAddStep }: StepFormProps) {
  const [showRunForm, setShowRunForm] = useState(false);
  const [showActionForm, setShowActionForm] = useState(false);
  const [stepName, setStepName] = useState('');
  const [stepCommand, setStepCommand] = useState('');

  const handleAddRunStep = () => {
    const newStep = {
      name: stepName,
      run: stepCommand,
    };

    const parsed = StepSchema.safeParse(newStep);

    if (parsed.success) {
      onAddStep(parsed.data);
    } else {
      // Handle validation errors
      console.error(parsed.error);
    }

    // Reset and hide form
    setStepName('');
    setStepCommand('');
    setShowRunForm(false);
  };

  const handleAddActionStep = () => {
    const newStep = {
      name: stepName,
      uses: stepCommand,
    };

    const parsed = StepSchema.safeParse(newStep);

    if (parsed.success) {
      onAddStep(parsed.data);
    } else {
      // Handle validation errors
      console.error(parsed.error);
    }

    // Reset and hide form
    setStepName('');
    setStepCommand('');
    setShowActionForm(false);
  };

  const cancelForm = () => {
    setStepName('');
    setStepCommand('');
    setShowRunForm(false);
    setShowActionForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Add Step Buttons */}
      {!showRunForm && !showActionForm && (
        <TooltipProvider>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRunForm(true)}
                  className="p-2 flex-1"
                >
                  <Terminal className="size-4 text-pink-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Run Command Step</p>
                <p className="text-xs text-muted-foreground">Execute shell commands or scripts</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowActionForm(true)}
                  className="p-2 flex-1"
                >
                  <Package className="size-4 text-purple-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Action Step</p>
                <p className="text-xs text-muted-foreground">Use pre-built GitHub Actions</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      )}

      {/* Run Command Form */}
      {showRunForm && (
        <div className="h-full flex flex-col rounded-lg overflow-hidden border">
          {/* Header */}
          <div className="flex-shrink-0 p-4 bg-pink-500/10 border-b border-pink-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/10 border-pink-500/20 border">
                  <Terminal className="size-4 text-pink-500" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Run Command Step</h2>
                  <p className="text-xs text-muted-foreground">Execute shell commands or scripts</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={cancelForm}
                className="size-4 p-0 hover:bg-destructive/20"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Form Fields */}
              <div>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-pink-500" />
                  Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Step Name (optional)</label>
                    <Input
                      placeholder="e.g., Install dependencies"
                      value={stepName}
                      onChange={(e) => setStepName(e.target.value)}
                      className="mt-1 bg-background"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Command</label>
                    <Textarea
                      placeholder="e.g., npm install"
                      value={stepCommand}
                      onChange={(e) => setStepCommand(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t">
                <div className="flex gap-2">
                  <Button type="button" className="flex-1" variant="outline" onClick={cancelForm}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddRunStep}
                    className="flex-1"
                    disabled={!stepCommand.trim()}
                  >
                    Add Step
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Form */}
      {showActionForm && (
        <div className="h-full flex flex-col rounded-lg overflow-hidden border">
          {/* Header */}
          <div className="flex-shrink-0 p-4 bg-purple-500/10 border-b border-purple-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 border-purple-500/20 border">
                  <Package className="size-4 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Action Step</h2>
                  <p className="text-xs text-muted-foreground">Use pre-built GitHub Actions</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={cancelForm}
                className="size-4 p-0 hover:bg-destructive/20"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Form Fields */}
              <div>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-500" />
                  Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Step Name (optional)</label>
                    <Input
                      placeholder="e.g., Checkout code"
                      value={stepName}
                      onChange={(e) => setStepName(e.target.value)}
                      className="mt-1 bg-background"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Action</label>
                    <Input
                      placeholder="e.g., actions/checkout@v4"
                      value={stepCommand}
                      onChange={(e) => setStepCommand(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleAddActionStep}
                    className="flex-1"
                    disabled={!stepCommand.trim()}
                  >
                    Add Step
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelForm}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobNodeForm({
  node,
  onUpdate,
}: {
  node: JobNode;
  onUpdate: (nodeId: string, newData: PipelineNodeData) => void;
}) {
  const form = useForm<JobNodeData>({
    resolver: zodResolver(JobNodeDataSchema),
    defaultValues: {
      name: node.data.name || '',
      'runs-on': node.data['runs-on'] || '',
      steps: node.data.steps,
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'steps',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
      }
    }
  };

  const addStep = (step: Step) => {
    append(step);
    // Get current form values and update with the new step
    const currentValues = form.getValues();
    onUpdate(node.id, currentValues);
  };

  const onSubmit = (data: JobNodeData) => {
    console.log('Form submitted with data:', data);
    onUpdate(node.id, data);
  };

  const onError = (errors: any) => {
    console.log('Form errors:', errors);
  };

  const commonRunners = [
    { value: 'ubuntu-latest', label: 'Ubuntu Latest' },
    { value: 'ubuntu-22.04', label: 'Ubuntu 22.04' },
    { value: 'ubuntu-20.04', label: 'Ubuntu 20.04' },
    { value: 'windows-latest', label: 'Windows Latest' },
    { value: 'windows-2022', label: 'Windows 2022' },
    { value: 'windows-2019', label: 'Windows 2019' },
    { value: 'macos-latest', label: 'macOS Latest' },
    { value: 'macos-13', label: 'macOS 13' },
    { value: 'macos-12', label: 'macOS 12' },
  ];

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Name</FormLabel>
                <FormControl>
                  <Input placeholder="build, test, deploy" {...field} />
                </FormControl>
                <FormDescription>A unique identifier for this job</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="runs-on"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Runner Environment</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select runner environment" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {commonRunners.map((runner) => (
                      <SelectItem key={runner.value} value={runner.value}>
                        {runner.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>The type of runner to use for this job</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="steps"
            render={() => (
              <FormItem>
                <div className="grid gap-2">
                  <FormLabel>Steps ({fields.length})</FormLabel>
                  <StepForm onAddStep={addStep} />
                </div>
                <FormControl>
                  {fields.length > 0 && (
                    <div className="overflow-hidden">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToVerticalAxis]}
                      >
                        <SortableContext
                          items={fields.map((field) => field.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {fields.map((field, index) => (
                              <SortableStepDisplay
                                key={field.id}
                                step={{ ...field, id: field.id }}
                                index={index}
                                onRemove={() => remove(index)}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  )}
                </FormControl>
                <FormDescription>Current Steps (drag to reorder)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Update Node
          </Button>
        </form>
      </Form>
    </div>
  );
}
