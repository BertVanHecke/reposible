import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Terminal } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@repo/ui/components/base/hover-card';

interface RunNodeData {
  run: string;
}

const CircularRunNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as RunNodeData;
  
  return (
    <HoverCard>
    <div className="relative group">
      <HoverCardTrigger asChild>
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-16 h-16 rounded-full bg-pink-500 border-4 border-pink-600 shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
            <Handle
              type="target"
              position={Position.Left}
              className="w-3 h-3 !bg-pink-500 border-2 border-white !left-[-4px]"
            />
            <Handle
              type="source"
              position={Position.Right}
              className="w-3 h-3 !bg-pink-500 border-2 border-white !right-[-4px]"
            />
            <Terminal className="w-8 h-8 text-white" />
          </div>
          <span className="text-xs font-semibold text-foreground">Command</span>
        </div>
      </HoverCardTrigger>

      <HoverCardContent className="w-96">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-semibold">Run Command</h4>
              <p className="text-xs text-muted-foreground">Shell execution</p>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-pink-600">2.3s</div>
              <div className="text-xs text-muted-foreground">Avg duration</div>
            </div>
          </div>
          
          <div className="border-t pt-3">
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">COMMAND</span>
              <div className="bg-muted p-3 rounded-md font-mono text-xs overflow-x-auto">
                <pre className="whitespace-pre-wrap break-words">{nodeData.run}</pre>
              </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </div>
    </HoverCard>
  );
};

export default CircularRunNode;
