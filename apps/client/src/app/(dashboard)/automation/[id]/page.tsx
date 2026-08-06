"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, Connection, Edge, Node, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { api } from '@/lib/api';
import { Button, Card } from '@algo-matrix/ui';
import { ArrowLeft, Save, MessageSquare, Clock, Zap, Bot, UserPlus, GitBranch, Globe, Webhook, Octagon, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { 
  TriggerNode, 
  ActionNode, 
  ConditionNode, 
  ApiRequestNode, 
  WebhookNode, 
  EndNode,
  TemplateNode 
} from '@/components/automation/nodes';
import { NodeConfigSidebar } from '@/components/automation/NodeConfigSidebar';

const initialNodes: Node[] = [
  {
    id: 'trigger-1',
    type: 'triggerNode',
    data: { label: 'Incoming Message' },
    position: { x: 250, y: 5 },
  },
];

function FlowCanvas({ automationId }: { automationId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [automation, setAutomation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const nodeTypes = useMemo(() => ({
    triggerNode: TriggerNode,
    actionNode: ActionNode,
    conditionNode: ConditionNode,
    apiRequestNode: ApiRequestNode,
    webhookNode: WebhookNode,
    endNode: EndNode,
    templateNode: TemplateNode,
  }), []);

  useEffect(() => {
    fetchAutomation();
  }, [automationId]);

  const fetchAutomation = async () => {
    try {
      const res = await api.get(`/automation/${automationId}`);
      setAutomation(res.data);
      if (res.data.nodes?.length > 0) {
        setNodes(res.data.nodes);
        setEdges(res.data.edges || []);
      } else {
        // Init trigger node based on triggerType
        setNodes([{
          id: 'trigger-1',
          type: 'triggerNode',
          data: { label: res.data.triggerType.replace('_', ' ') },
          position: { x: 250, y: 50 },
        }]);
      }
    } catch (error) {
      toast.error('Failed to load automation');
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = {
        x: event.clientX - (reactFlowWrapper.current?.getBoundingClientRect().left || 0) - 50,
        y: event.clientY - (reactFlowWrapper.current?.getBoundingClientRect().top || 0) - 20,
      };
      
      let label = 'Action';
      let actionType = '';
      
      let typeNode = 'actionNode';
      
      switch (type) {
        case 'reply':
          label = 'Send Message';
          actionType = 'reply';
          break;
        case 'ai_reply':
          label = 'AI Assistant';
          actionType = 'ai_reply';
          break;
        case 'delay':
          label = 'Wait';
          actionType = 'delay';
          break;
        case 'template':
          typeNode = 'templateNode';
          label = 'Send Template';
          break;
        case 'assign_agent':
          label = 'Assign Agent';
          actionType = 'assign_agent';
          break;
        case 'condition':
          typeNode = 'conditionNode';
          label = 'Condition';
          break;
        case 'api_request':
          typeNode = 'apiRequestNode';
          label = 'API Request';
          break;
        case 'webhook':
          typeNode = 'webhookNode';
          label = 'Webhook';
          break;
        case 'end_flow':
          typeNode = 'endNode';
          label = 'End Flow';
          break;
      }

      const newNode: Node = {
        id: `node_${new Date().getTime()}`,
        type: typeNode,
        position,
        data: { label, actionType, text: type === 'reply' ? 'Hello from automation!' : undefined },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes],
  );

  const saveWorkflow = async () => {
    try {
      await api.put(`/automation/${automationId}`, {
        nodes,
        edges,
      });
      toast.success('Workflow saved successfully');
    } catch (error) {
      toast.error('Failed to save workflow');
    }
  };

  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          node.data = { ...node.data, ...data };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId]);

  if (loading) return <div className="p-8">Loading builder...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <div className="flex justify-between items-center p-4 border-b bg-background">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/automation')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{automation?.name}</h1>
            <p className="text-xs text-muted-foreground">Workflow Builder</p>
          </div>
        </div>
        <Button onClick={saveWorkflow}>
          <Save className="mr-2 h-4 w-4" />
          Save Workflow
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r bg-muted/10 p-4 flex flex-col space-y-4">
          <h3 className="font-semibold text-sm uppercase text-muted-foreground">Actions</h3>
          
          <div 
            className="flex items-center p-3 bg-[var(--card)] border border-[var(--border)] rounded-lg cursor-grab hover:border-primary transition-all shadow-sm hover:shadow-md"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'reply')}
          >
            <MessageSquare className="h-5 w-5 mr-3 text-blue-500" />
            <span className="font-medium">Send Message</span>
          </div>

          <div 
            className="flex items-center p-3 bg-[var(--card)] border border-[var(--border)] rounded-lg cursor-grab hover:border-primary transition-all shadow-sm hover:shadow-md"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'ai_reply')}
          >
            <Bot className="h-5 w-5 mr-3 text-purple-500" />
            <span className="font-medium">AI Assistant</span>
          </div>

          <div 
            className="flex items-center p-3 bg-[var(--card)] border border-[var(--border)] rounded-lg cursor-grab hover:border-primary transition-all shadow-sm hover:shadow-md"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'template')}
          >
            <FileText className="h-5 w-5 mr-3 text-teal-500" />
            <span className="font-medium">Send Template</span>
          </div>

          <div 
            className="flex items-center p-3 bg-[var(--card)] border border-[var(--border)] rounded-lg cursor-grab hover:border-primary transition-all shadow-sm hover:shadow-md"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'delay')}
          >
            <Clock className="h-5 w-5 mr-3 text-yellow-500" />
            <span className="font-medium">Delay / Wait</span>
          </div>

          <div 
            className="flex items-center p-3 bg-[var(--card)] border border-[var(--border)] rounded-lg cursor-grab hover:border-primary transition-all shadow-sm hover:shadow-md"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'assign_agent')}
          >
            <UserPlus className="h-5 w-5 mr-3 text-green-500" />
            <span className="font-medium">Assign Agent</span>
          </div>

          <div 
            className="flex items-center p-3 bg-[var(--card)] border border-[var(--border)] rounded-lg cursor-grab hover:border-primary transition-all shadow-sm hover:shadow-md"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'condition')}
          >
            <GitBranch className="h-5 w-5 mr-3 text-orange-500" />
            <span className="font-medium">Condition</span>
          </div>

          <div 
            className="flex items-center p-3 bg-[var(--card)] border border-[var(--border)] rounded-lg cursor-grab hover:border-primary transition-all shadow-sm hover:shadow-md"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'api_request')}
          >
            <Globe className="h-5 w-5 mr-3 text-indigo-500" />
            <span className="font-medium">API Request</span>
          </div>

          <div 
            className="flex items-center p-3 bg-[var(--card)] border border-[var(--border)] rounded-lg cursor-grab hover:border-primary transition-all shadow-sm hover:shadow-md"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'webhook')}
          >
            <Webhook className="h-5 w-5 mr-3 text-pink-500" />
            <span className="font-medium">Webhook</span>
          </div>

          <div 
            className="flex items-center p-3 bg-[var(--card)] border border-[var(--border)] rounded-lg cursor-grab hover:border-primary transition-all shadow-sm hover:shadow-md"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'end_flow')}
          >
            <Octagon className="h-5 w-5 mr-3 text-slate-800 dark:text-slate-200" />
            <span className="font-medium">End Flow</span>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-300">
            <p><strong>Tip:</strong> Drag actions from this panel onto the canvas to build your workflow.</p>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={() => setSelectedNodeId(null)}
            proOptions={{ hideAttribution: true }}
            fitView
          >
            <Controls className="bg-[var(--card)] border border-[var(--border)] shadow-md rounded-md overflow-hidden [&>button]:border-b [&>button]:border-[var(--border)] [&>button]:bg-[var(--card)] [&>button]:text-[var(--foreground)] [&>button:hover]:bg-[var(--accent)] [&>button>svg]:fill-[var(--foreground)]" />
            <MiniMap 
              style={{ backgroundColor: 'var(--card)' }}
              maskColor="rgba(0, 0, 0, 0.4)"
              nodeColor="var(--primary)"
              className="bg-[var(--card)] border border-[var(--border)] rounded-md shadow-md"
            />
            <Background gap={16} size={1} color="var(--border)" />
          </ReactFlow>
          
          {selectedNode && (
            <NodeConfigSidebar 
              node={selectedNode} 
              updateNodeData={updateNodeData} 
              onClose={() => setSelectedNodeId(null)} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function AutomationBuilderPage({ params }: { params: { id: string } }) {
  return (
    <ReactFlowProvider>
      <FlowCanvas automationId={params.id} />
    </ReactFlowProvider>
  );
}
