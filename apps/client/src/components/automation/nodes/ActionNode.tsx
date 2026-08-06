import { Handle, Position } from '@xyflow/react';
import { MessageSquare, Bot, Clock, UserPlus } from 'lucide-react';

export function ActionNode({ data, selected }: any) {
  let Icon = MessageSquare;
  let bgColor = 'bg-blue-500';
  
  if (data.actionType === 'ai_reply') {
    Icon = Bot;
    bgColor = 'bg-purple-500';
  } else if (data.actionType === 'delay') {
    Icon = Clock;
    bgColor = 'bg-yellow-500';
  } else if (data.actionType === 'assign_agent') {
    Icon = UserPlus;
    bgColor = 'bg-green-500';
  }

  const getSubtext = () => {
    if (data.actionType === 'reply') return data.text || 'No message';
    if (data.actionType === 'delay') return `${data.delaySeconds || 1} seconds`;
    if (data.actionType === 'ai_reply') return 'System Prompt set';
    if (data.actionType === 'assign_agent') return data.agentId ? 'Agent Assigned' : 'Unassigned';
    return '';
  };

  return (
    <div className={`bg-card text-card-foreground border rounded-xl shadow-lg min-w-[220px] flex items-center p-3 relative transition-all ${selected ? 'ring-2 ring-primary border-transparent' : 'border-border hover:border-primary/50'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-muted-foreground !border-background top-[-6px]" />
      
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white mr-3 shadow-inner ${bgColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="font-semibold text-sm truncate">{data.label || 'Action'}</div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[140px]">
          {getSubtext()}
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-muted-foreground !border-background bottom-[-6px]" />
    </div>
  );
}
