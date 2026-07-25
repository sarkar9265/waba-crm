import { Handle, Position } from '@xyflow/react';
import { Webhook } from 'lucide-react';

export function WebhookNode({ data, selected }: any) {
  return (
    <div className={`bg-card text-card-foreground border-2 rounded-md shadow-md min-w-[150px] ${selected ? 'border-primary' : 'border-muted'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-muted-foreground" />
      
      <div className="flex items-center space-x-2 bg-pink-500 text-white p-2 rounded-t-sm">
        <Webhook className="w-4 h-4" />
        <div className="font-semibold text-sm">{data.label || 'Webhook'}</div>
      </div>
      
      <div className="p-2 text-xs text-muted-foreground">
        <p className="truncate max-w-[150px]">{data.webhookUrl || 'No URL configured'}</p>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-muted-foreground" />
    </div>
  );
}
