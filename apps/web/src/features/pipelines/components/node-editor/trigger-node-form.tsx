import React, { useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from '@repo/ui/components/base/multi-select';
import { Button } from '@repo/ui/components/base/button';
import {
  PipelineNodeData,
  TriggerEvent,
  TriggerNode,
  TriggerNodeData,
  TriggerNodeDataSchema,
} from '../../schemas/nodes';

export default function TriggerNodeForm({
  node,
  onUpdate,
}: {
  node: TriggerNode;
  onUpdate: (nodeId: string, newData: PipelineNodeData) => void;
}) {
  const id = useId();
  const form = useForm<TriggerNodeData>({
    resolver: zodResolver(TriggerNodeDataSchema),
    defaultValues: {
      event: node.data.event,
      branches: node.data.branches,
    },
  });

  const onSubmit = (data: TriggerNodeData) => {
    console.log('Form submitted with data:', data);
    onUpdate(node.id, data);
  };

  const onError = (errors: any) => {
    console.error('Form errors:', errors);
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-4">
          <FormField
            control={form.control}
            name="event"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={id}>Event Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger id={id} className="[&_*[data-desc]]:hidden w-full">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                    <SelectItem value={TriggerEvent.Push}>
                      Push
                      <span className="text-muted-foreground mt-1 block text-xs" data-desc>
                        Triggers on commits to specified branches
                      </span>
                    </SelectItem>
                    <SelectItem value={TriggerEvent.PullRequest}>
                      Pull Request
                      <span className="text-muted-foreground mt-1 block text-xs" data-desc>
                        Triggers on PR events
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>The GitHub event that triggers this workflow</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="branches"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Branches</FormLabel>
                <MultiSelect 
                  onValuesChange={field.onChange} 
                  values={field.value}
                  allowCustomValues={true}
                >
                  <FormControl>
                    <MultiSelectTrigger className="w-full">
                      <MultiSelectValue placeholder="Select or type branch names" overflowBehavior='wrap'/>
                    </MultiSelectTrigger>
                  </FormControl>
                  <MultiSelectContent search={{ placeholder: "Search or add branches...", emptyMessage: "No branches found. Type to add a new one." }}>
                    <MultiSelectItem value="main">main</MultiSelectItem>
                    <MultiSelectItem value="develop">develop</MultiSelectItem>
                    <MultiSelectItem value="staging">staging</MultiSelectItem>
                    <MultiSelectItem value="feature/*">feature/*</MultiSelectItem>
                    <MultiSelectItem value="hotfix/*">hotfix/*</MultiSelectItem>
                  </MultiSelectContent>
                </MultiSelect>
                <FormDescription>Select existing branches or type new branch names/patterns</FormDescription>
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
