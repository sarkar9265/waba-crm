import { Handle, Position } from '@xyflow/react';
import { Globe } from 'lucide-react';

export function ApiRequestNode({ data, selected }: any) {
  return (
    <div className={`bg-card text-card-foreground border-2 rounded-md shadow-md min-w-[200px] ${selected ? 'border-primary' : 'border-muted'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-muted-foreground" />
      
      <div className="flex items-center space-x-2 bg-indigo-500 text-white p-2 rounded-t-sm">
        <Globe className="w-4 h-4" />
        <div className="font-semibold text-sm">{data.label || 'API Request'}</div>
      </div>
      
      <div className="p-2 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">{data.method || 'GET'}</p>
        <p className="truncate max-w-[180px]">{data.url || 'No URL configured'}</p>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-muted-foreground" />
    </div>
  );
}
