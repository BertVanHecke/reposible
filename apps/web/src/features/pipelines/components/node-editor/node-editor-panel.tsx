'use client';

import React from 'react';
import { Button } from '@repo/ui/components/base/button';
import { Play, Group, Package, X, Trash2 } from 'lucide-react';

import { PipelineNode, PipelineNodeData } from '../../schemas/nodes';
import { PipelineEdge } from '../../schemas/edges';
import TriggerNodeForm from './trigger-node-form';
import JobNodeForm from './job-node-form';

interface NodeEditorPanelProps {
  node: PipelineNode;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  onUpdate: (nodeId: string, newData: PipelineNodeData) => void;
  onClose: () => void;
  onDelete: () => void;
}

export function NodeEditorPanel({ node, onUpdate, onClose, onDelete }: NodeEditorPanelProps) {
  const getNodeTypeInfo = () => {
    switch (node.type) {
      case 'triggerNode': {
        return {
          icon: Play,
          title: 'Trigger Config',
          description: 'Configure when this workflow should run',
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
        };
      }
      case 'jobNode': {
        return {
          icon: Group,
          title: 'Job Config',
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
        return <JobNodeForm node={node} onUpdate={onUpdate} />;
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
