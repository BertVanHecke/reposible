'use client';

import React from 'react';
import { Button } from '@repo/ui/components/base/button';
import { Input } from '@repo/ui/components/base/input';
import { Label } from '@repo/ui/components/base/label';
import { Badge } from '@repo/ui/components/base/badge';
import { Play, Group, Terminal, Package, X, Trash2, GripVertical } from 'lucide-react';
import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableStepItem({ step }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-muted/50 rounded-lg ${
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

      <div className="flex-shrink-0">
        {step.type === 'runNode' ? (
          <Terminal className="w-4 h-4 text-pink-500" />
        ) : (
          <Package className="w-4 h-4 text-purple-500" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {step.data.name || (step.type === 'runNode' ? 'Run Command' : 'Action Step')}
          </span>
          <Badge variant="outline" className="text-xs shrink-0">
            #{step.data.order}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {step.type === 'runNode' ? step.data.run.split('\n')[0] : step.data.uses}
        </div>
      </div>
    </div>
  );
}
import { PipelineNode, JobNodeData, PipelineNodeData } from '../../schemas/nodes';
import { PipelineEdge } from '../../schemas/edges';
import TriggerNodeForm from './trigger-node-form';

interface NodeEditorPanelProps {
  node: PipelineNode;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  onUpdate: (nodeId: string, newData: PipelineNodeData) => void;
  onClose: () => void;
  onDelete: () => void;
}

export function NodeEditorPanel({ node, onUpdate, onClose, onDelete }: NodeEditorPanelProps) {
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getNodeTypeInfo = () => {
    switch (node.type) {
      case 'triggerNode': {
        return {
          icon: Play,
          title: 'Event Trigger',
          description: 'Configure when this workflow should run',
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
        };
      }
      case 'jobNode': {
        return {
          icon: Group,
          title: 'Job Configuration',
          description: 'Set up job properties and dependencies',
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
        };
      }
      default: {
        return {
          icon: Package,
          title: 'Unknown Node',
          description: 'Unknown node type',
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20',
        };
      }
    }
  };

  const nodeTypeInfo = getNodeTypeInfo();
  const IconComponent = nodeTypeInfo.icon;

  const renderFormFields = () => {
    switch (node.type) {
      case 'triggerNode': {
        return <TriggerNodeForm node={node} onUpdate={onUpdate} />;
      }
      case 'jobNode': {
        const jobData = node.data as JobNodeData;

        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Job Name</Label>
              <Input
                id="name"
                value={jobData.name || ''}
                placeholder="build, test, deploy"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">A unique identifier for this job</p>
            </div>
            <div>
              <Label htmlFor="runs-on">Runner Environment</Label>
              <Input
                id="runs-on"
                value={jobData['runs-on'] || ''}
                placeholder="ubuntu-latest, windows-latest, macos-latest"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The type of runner to use for this job
              </p>
            </div>
          </div>
        );
      }
      default: {
        return (
          <div className="text-center text-muted-foreground py-8">
            <p>No editable fields for this node type.</p>
          </div>
        );
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className={`flex-shrink-0 p-4 ${nodeTypeInfo.bgColor} border-b ${nodeTypeInfo.borderColor}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${nodeTypeInfo.bgColor} ${nodeTypeInfo.borderColor} border`}
            >
              <IconComponent className={`size-4 ${nodeTypeInfo.color}`} />
            </div>
            <div>
              <h2 className="text-sm font-semibold">{nodeTypeInfo.title}</h2>
              <p className="text-xs text-muted-foreground">{nodeTypeInfo.description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
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
              <IconComponent className={`h-4 w-4 ${nodeTypeInfo.color}`} />
              Configuration
            </h3>
            {renderFormFields()}
          </div>

          {/* Delete Button */}
          <div className="pt-4 border-t">
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="w-full flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Node
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
