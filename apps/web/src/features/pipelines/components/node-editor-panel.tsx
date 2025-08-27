'use client';

import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { Button } from '@repo/ui/components/base/button';
import { Input } from '@repo/ui/components/base/input';
import { Label } from '@repo/ui/components/base/label';
import { Separator } from '@repo/ui/components/base/separator';
import { Play, Briefcase, Terminal, Package, X } from 'lucide-react';

interface NodeEditorPanelProps {
  node: Node;
  onUpdate: (nodeId: string, newData: Record<string, any>) => void;
  onClose: () => void;
}

export function NodeEditorPanel({ node, onUpdate, onClose }: NodeEditorPanelProps) {
  const [formData, setFormData] = useState<Record<string, any>>(node.data);

  const handleInputChange = (key: string, value: any) => {
    const newData = { ...formData, [key]: value };
    setFormData(newData);
    onUpdate(node.id, newData);
  };

  const getNodeTypeInfo = () => {
    switch (node.type) {
      case 'triggerNode':
        return {
          icon: Play,
          title: 'Event Trigger',
          description: 'Configure when this workflow should run',
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
        };
      case 'jobNode':
        return {
          icon: Briefcase,
          title: 'Job Configuration',
          description: 'Set up job properties and dependencies',
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
        };
      case 'runNode':
        return {
          icon: Terminal,
          title: 'Run Command',
          description: 'Execute shell commands and scripts',
          color: 'text-pink-500',
          bgColor: 'bg-pink-500/10',
          borderColor: 'border-pink-500/20',
        };
      case 'usesNode':
        return {
          icon: Package,
          title: 'Action Step',
          description: 'Use a GitHub Action with parameters',
          color: 'text-purple-500',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/20',
        };
      default:
        return {
          icon: Package,
          title: 'Unknown Node',
          description: 'Unknown node type',
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20',
        };
    }
  };

  const nodeTypeInfo = getNodeTypeInfo();
  const IconComponent = nodeTypeInfo.icon;

  const renderFormFields = () => {
    switch (node.type) {
      case 'triggerNode':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="event">Event Type</Label>
              <Input
                id="event"
                value={(formData.event as string) || ''}
                onChange={(e) => handleInputChange('event', e.target.value)}
                placeholder="push, pull_request, workflow_dispatch"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The GitHub event that triggers this workflow
              </p>
            </div>
            <div>
              <Label htmlFor="branches">Target Branches</Label>
              <Input
                id="branches"
                value={(formData.branches as string[])?.join(', ') || ''}
                onChange={(e) =>
                  handleInputChange('branches', e.target.value.split(', ').filter(Boolean))
                }
                placeholder="main, develop, feature/*"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated list of branches (optional)
              </p>
            </div>
          </div>
        );

      case 'jobNode':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Job Name</Label>
              <Input
                id="name"
                value={(formData.name as string) || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="build, test, deploy"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">A unique identifier for this job</p>
            </div>
            <div>
              <Label htmlFor="runs-on">Runner Environment</Label>
              <Input
                id="runs-on"
                value={(formData['runs-on'] as string) || ''}
                onChange={(e) => handleInputChange('runs-on', e.target.value)}
                placeholder="ubuntu-latest, windows-latest, macos-latest"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The type of runner to use for this job
              </p>
            </div>
            <div>
              <Label htmlFor="needs">Job Dependencies</Label>
              <Input
                id="needs"
                value={(formData.needs as string[])?.join(', ') || ''}
                onChange={(e) =>
                  handleInputChange('needs', e.target.value.split(', ').filter(Boolean))
                }
                placeholder="build, test"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Jobs that must complete before this job runs
              </p>
            </div>
          </div>
        );

      case 'runNode':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="run">Shell Command</Label>
              <textarea
                id="run"
                value={(formData.run as string) || ''}
                onChange={(e) => handleInputChange('run', e.target.value)}
                placeholder="npm install&#10;npm run build&#10;echo 'Build complete!'"
                className="w-full min-h-[120px] p-3 border rounded-md resize-vertical font-mono text-sm mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Shell commands to execute (supports multi-line)
              </p>
            </div>
          </div>
        );

      case 'usesNode':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="uses">Action</Label>
              <Input
                id="uses"
                value={(formData.uses as string) || ''}
                onChange={(e) => handleInputChange('uses', e.target.value)}
                placeholder="actions/checkout@v4"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The GitHub Action to use (owner/repo@version)
              </p>
            </div>
            <div>
              <Label htmlFor="with">Parameters</Label>
              <textarea
                id="with"
                value={formData.with ? JSON.stringify(formData.with, null, 2) : ''}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value || '{}');
                    handleInputChange('with', parsed);
                  } catch {
                    // Invalid JSON, don't update
                  }
                }}
                placeholder='{&#10;  "node-version": "18",&#10;  "cache": "npm"&#10;}'
                className="w-full min-h-[120px] p-3 border rounded-md resize-vertical font-mono text-sm mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                JSON object with action parameters
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-muted-foreground py-8">
            <p>No editable fields for this node type.</p>
          </div>
        );
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
            className="size-(icon) p-0 hover:bg-destructive/20"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Node Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Node ID</h3>
              <p className="text-sm font-mono bg-muted/50 px-2 py-1 rounded border">{node.id}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Node Type</h3>
              <p className="text-sm bg-muted/50 px-2 py-1 rounded border">{node.type}</p>
            </div>
          </div>

          <Separator />

          {/* Form Fields */}
          <div>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <IconComponent className={`h-4 w-4 ${nodeTypeInfo.color}`} />
              Configuration
            </h3>
            {renderFormFields()}
          </div>
        </div>
      </div>
    </div>
  );
}
