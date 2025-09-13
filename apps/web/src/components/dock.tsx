'use client';

import { Button, buttonVariants } from '@repo/ui/components/base/button';
import { Dock, DockIcon } from '@repo/ui/components/base/dock';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@repo/ui/components/base/tooltip';
import { cn } from '@repo/ui/lib/utils';
import { FlipHorizontal, FlipVertical, Play, Group } from 'lucide-react';
import React from 'react';
import { Node } from '@xyflow/react';

export type IconProps = React.HTMLAttributes<SVGElement>;

const NODE_TYPE_OPTIONS = {
  triggerNode: [
    {
      icon: Group,
      label: 'Add Job',
      color: 'text-blue-500',
      hoverBg: 'hover:bg-blue-500',
      hoverBorder: 'hover:border-blue-600',
      nodeType: 'jobNode' as const,
    },
  ],
  jobNode: [
    {
      icon: Group,
      label: 'Add Job',
      color: 'text-blue-500',
      hoverBg: 'hover:bg-blue-500',
      hoverBorder: 'hover:border-blue-600',
      nodeType: 'jobNode' as const,
    },
  ],
};

const DATA = {
  nodeTypes: [
    {
      icon: Play,
      label: 'Trigger',
      color: 'text-green-500',
      hoverBg: 'hover:bg-green-500',
      hoverBorder: 'hover:border-green-600',
      nodeType: 'triggerNode' as const,
    },
  ],
  actions: [
    { icon: FlipHorizontal, label: 'Vertical Layout', value: 'TB' },
    { icon: FlipVertical, label: 'Horizontal Layout', value: 'LR' },
  ],
};

export function FlowDock({
  onLayout,
  onAddNode,
  onAddNodeAfter,
  hasNodes = false,
  selectedNode = null,
}: {
  onLayout: (direction: 'TB' | 'LR') => void;
  onAddNode: (nodeType: 'triggerNode') => void;
  onAddNodeAfter: (sourceNodeId: string, nodeType: 'jobNode') => void;
  hasNodes?: boolean;
  selectedNode?: Node | null;
}) {
  // Get available node types for the selected node
  const getAvailableNodeTypes = () => {
    if (!selectedNode) return [];

    if (selectedNode.type && selectedNode.type in NODE_TYPE_OPTIONS) {
      const nodeType = selectedNode.type as keyof typeof NODE_TYPE_OPTIONS;
      return NODE_TYPE_OPTIONS[nodeType] || [];
    }
    return [];
  };

  const availableNodeTypes = getAvailableNodeTypes();

  return (
    <div className="flex flex-col items-center justify-center">
      <TooltipProvider>
        <Dock direction="middle">
          {!hasNodes
            ? // Show trigger button when no nodes exist
              DATA.nodeTypes.map((item) => (
                <DockIcon key={item.label}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={'link'}
                        onClick={() => onAddNode(item.nodeType)}
                        aria-label={item.label}
                        className={cn(
                          'group size-12 rounded-full transition-all duration-200 flex items-center justify-center border-2 border-transparent',
                          item.hoverBg,
                          item.hoverBorder
                        )}
                      >
                        <item.icon
                          className={cn(
                            'size-4 transition-colors duration-200',
                            item.color,
                            'group-hover:text-white'
                          )}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="dark">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </DockIcon>
              ))
            : selectedNode && availableNodeTypes.length > 0
              ? // Show node addition options when a node is selected
                availableNodeTypes.map((item) => (
                  <DockIcon key={item.label}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={'link'}
                          onClick={() => onAddNodeAfter(selectedNode.id, item.nodeType)}
                          aria-label={item.label}
                          className={cn(
                            'group size-12 rounded-full transition-all duration-200 flex items-center justify-center border-2 border-transparent',
                            item.hoverBg,
                            item.hoverBorder
                          )}
                        >
                          <item.icon
                            className={cn(
                              'size-4 transition-colors duration-200',
                              item.color,
                              'group-hover:text-white'
                            )}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="dark">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </DockIcon>
                ))
              : // Show layout controls when nodes exist but no node is selected
                DATA.actions.map((item) => (
                  <DockIcon key={item.label}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={'ghost'}
                          onClick={() => onLayout(item.value as 'TB' | 'LR')}
                          aria-label={item.label}
                          className={cn(
                            buttonVariants({ variant: 'ghost', size: 'icon' }),
                            'size-12 rounded-full'
                          )}
                        >
                          <item.icon className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="dark">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </DockIcon>
                ))}
        </Dock>
      </TooltipProvider>
    </div>
  );
}
