import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export function ConditionNode({ data, selected }: any) {
  return (
    <div className={`bg-card text-card-foreground border-2 rounded-md shadow-md min-w-[200px] ${selected ? 'border-primary' : 'border-muted'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-muted-foreground" />
      
      <div className="flex items-center space-x-2 bg-orange-500 text-white p-2 rounded-t-sm">
        <GitBranch className="w-4 h-4" />
        <div className="font-semibold text-sm">{data.label || 'Condition'}</div>
      </div>
      
      <div className="p-2 text-xs text-muted-foreground">
        <p>If <span className="font-medium text-foreground">{data.field || 'message.text'}</span></p>
        <p className="italic">{data.operator || 'contains'}</p>
        <p className="font-medium text-foreground">"{data.value || ''}"</p>
      </div>
      
      {/* True Handle */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="true"
        style={{ left: '25%', background: '#22c55e' }} 
        className="w-3 h-3" 
      />
      <div className="absolute -bottom-5 left-[25%] -translate-x-1/2 text-[10px] text-green-500 font-bold">True</div>

      {/* False Handle */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="false"
        style={{ left: '75%', background: '#ef4444' }} 
        className="w-3 h-3" 
      />
      <div className="absolute -bottom-5 left-[75%] -translate-x-1/2 text-[10px] text-red-500 font-bold">False</div>
    </div>
  );
}
