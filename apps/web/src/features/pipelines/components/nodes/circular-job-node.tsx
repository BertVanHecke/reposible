import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Group } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@repo/ui/components/base/hover-card';

interface JobNodeData {
  name: string;
  'runs-on': string;
  needs?: string[];
}

const CircularJobNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as JobNodeData;

  return (
    <HoverCard>
      <div className="relative group">
        <HoverCardTrigger asChild>
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-16 h-16 rounded-full bg-blue-500 border-4 border-blue-600 shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
              <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 !bg-blue-500 border-2 border-white !left-[-4px]"
              />
              <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 !bg-blue-500 border-2 border-white !right-[-4px]"
              />
              <Group className="w-8 h-8 text-white" />
            </div>
            <span className="text-xs font-semibold text-foreground">Job</span>
          </div>
        </HoverCardTrigger>

        <HoverCardContent className="w-80">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <Group className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-semibold">{nodeData.name}</h4>
                <p className="text-xs text-muted-foreground">CI/CD Job</p>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-blue-600">92%</div>
                <div className="text-xs text-muted-foreground">Success rate</div>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-muted-foreground">RUNNER</span>
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                  {nodeData['runs-on']}
                </span>
              </div>
              {nodeData.needs && (
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-muted-foreground">DEPENDS ON</span>
                  <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                    {nodeData.needs.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </HoverCardContent>
      </div>
    </HoverCard>
  );
};

export default CircularJobNode;
