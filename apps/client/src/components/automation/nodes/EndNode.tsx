import { Handle, Position } from '@xyflow/react';
import { Octagon } from 'lucide-react';

export function EndNode({ data, selected }: any) {
  return (
    <div className={`bg-card text-card-foreground border-2 rounded-md shadow-md min-w-[100px] ${selected ? 'border-primary' : 'border-muted'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-muted-foreground" />
      
      <div className="flex items-center space-x-2 bg-slate-800 text-white p-2 rounded-t-sm">
        <Octagon className="w-4 h-4" />
        <div className="font-semibold text-sm">{data.label || 'End'}</div>
      </div>
    </div>
  );
}
