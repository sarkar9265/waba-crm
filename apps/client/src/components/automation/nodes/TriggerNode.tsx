import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';

export function TriggerNode({ data, selected }: any) {
  return (
    <div className={`bg-card text-card-foreground border rounded-xl shadow-lg min-w-[220px] flex items-center p-3 relative transition-all ${selected ? 'ring-2 ring-primary border-transparent' : 'border-border hover:border-primary/50'}`}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white mr-3 shadow-inner bg-primary">
        <Zap className="w-5 h-5" />
      </div>
      
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="font-semibold text-sm truncate">{data.label || 'Trigger'}</div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[140px]">
          {data.keywords && data.keywords.length > 0 
            ? `Keywords: ${data.keywords.join(', ')}` 
            : 'Any message'}
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-muted-foreground !border-background bottom-[-6px]" />
    </div>
  );
}
