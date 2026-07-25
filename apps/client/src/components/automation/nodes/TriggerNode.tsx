import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';

export function TriggerNode({ data, selected }: any) {
  return (
    <div className={`bg-card text-card-foreground border-2 rounded-md shadow-lg min-w-[200px] ${selected ? 'border-primary' : 'border-muted'}`}>
      <div className="flex items-center space-x-2 bg-primary text-primary-foreground p-3 rounded-t-sm">
        <Zap className="w-5 h-5" />
        <div className="font-semibold">{data.label || 'Trigger'}</div>
      </div>
      
      <div className="p-3">
        {data.keywords && data.keywords.length > 0 ? (
          <div className="text-xs text-muted-foreground mt-1">
            <span className="font-medium text-foreground">Keywords:</span> {data.keywords.join(', ')}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">Any incoming message</div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary" />
    </div>
  );
}
