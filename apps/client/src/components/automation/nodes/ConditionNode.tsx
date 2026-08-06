import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export function ConditionNode({ data, selected }: any) {
  return (
    <div className={`bg-card text-card-foreground border rounded-xl shadow-lg min-w-[220px] flex items-center p-3 relative transition-all ${selected ? 'ring-2 ring-primary border-transparent' : 'border-border hover:border-primary/50'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-muted-foreground !border-background top-[-6px]" />
      
      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white mr-3 shadow-inner bg-orange-500">
        <GitBranch className="w-5 h-5" />
      </div>
      
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="font-semibold text-sm truncate">{data.label || 'Condition'}</div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[140px]">
          {data.field || 'message.text'} {data.operator || 'contains'} "{data.value || ''}"
        </div>
      </div>
      
      {/* True Handle */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="true"
        style={{ left: '25%' }} 
        className="w-3 h-3 !bg-green-500 !border-background bottom-[-6px]" 
      />
      <div className="absolute -bottom-5 left-[25%] -translate-x-1/2 text-[10px] text-green-500 font-bold">True</div>

      {/* False Handle */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="false"
        style={{ left: '75%' }} 
        className="w-3 h-3 !bg-red-500 !border-background bottom-[-6px]" 
      />
      <div className="absolute -bottom-5 left-[75%] -translate-x-1/2 text-[10px] text-red-500 font-bold">False</div>
    </div>
  );
}
