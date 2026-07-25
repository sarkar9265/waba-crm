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

  return (
    <div className={`bg-card text-card-foreground border-2 rounded-md shadow-md min-w-[150px] ${selected ? 'border-primary' : 'border-muted'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-muted-foreground" />
      
      <div className={`flex items-center space-x-2 ${bgColor} text-white p-2 rounded-t-sm`}>
        <Icon className="w-4 h-4" />
        <div className="font-semibold text-sm">{data.label || 'Action'}</div>
      </div>
      
      <div className="p-2 text-xs text-muted-foreground">
        {data.actionType === 'reply' && <p className="truncate max-w-[150px]">{data.text || 'No message'}</p>}
        {data.actionType === 'delay' && <p>{data.delaySeconds || 1} seconds</p>}
        {data.actionType === 'ai_reply' && <p>System Prompt set</p>}
        {data.actionType === 'assign_agent' && <p>{data.agentId ? 'Agent Assigned' : 'Unassigned'}</p>}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-muted-foreground" />
    </div>
  );
}
