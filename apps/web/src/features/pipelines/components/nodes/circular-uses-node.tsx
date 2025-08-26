import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Package } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@repo/ui/components/base/hover-card';

interface UsesNodeData {
  uses: string;
  with?: Record<string, number | string | object>;
}

const CircularUsesNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as UsesNodeData;

  return (
    <HoverCard>
      <div className="relative group">
        <HoverCardTrigger asChild>
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-16 h-16 rounded-full bg-purple-500 border-4 border-purple-600 shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
              <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 !bg-purple-500 border-2 border-white !left-[-4px]"
              />
              <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 !bg-purple-500 border-2 border-white !right-[-4px]"
              />
              <Package className="w-8 h-8 text-white" />
            </div>
            <span className="text-xs font-semibold text-foreground">Action</span>
          </div>
        </HoverCardTrigger>

        <HoverCardContent className="w-96">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-semibold">GitHub Action</h4>
                <p className="text-xs text-muted-foreground">External action</p>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-purple-600">1.2s</div>
                <div className="text-xs text-muted-foreground">Avg duration</div>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">ACTION</span>
                  <div className="bg-muted p-2 rounded-md font-mono text-xs mt-1">
                    {nodeData.uses}
                  </div>
                </div>

                {nodeData.with && Object.keys(nodeData.with).length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">PARAMETERS</span>
                    <div className="bg-muted p-3 rounded-md mt-1 space-y-1">
                      {Object.entries(nodeData.with).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center text-xs">
                          <span className="font-mono text-muted-foreground">{key}:</span>
                          <span className="font-mono ml-2">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </HoverCardContent>
      </div>
    </HoverCard>
  );
};

export default CircularUsesNode;
