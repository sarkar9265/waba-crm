import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@algo-matrix/ui';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function NodeConfigSidebar({ node, updateNodeData, onClose }: any) {
  const [data, setData] = useState<any>(node?.data || {});

  useEffect(() => {
    setData(node?.data || {});
  }, [node]);

  const handleChange = (field: string, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    updateNodeData(node.id, newData);
  };

  if (!node) return null;

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full absolute right-0 top-0 z-10 shadow-xl">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-lg">{node.type.replace('Node', ' Node')}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-2">
          <Label>Label</Label>
          <Input 
            value={data.label || ''} 
            onChange={(e) => handleChange('label', e.target.value)} 
          />
        </div>

        {node.type === 'triggerNode' && (
          <div className="space-y-2">
            <Label>Keywords (comma separated)</Label>
            <Input 
              value={(data.keywords || []).join(', ')} 
              onChange={(e) => {
                const kws = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                handleChange('keywords', kws);
              }}
              placeholder="e.g. help, support, pricing"
            />
          </div>
        )}

        {node.type === 'actionNode' && data.actionType === 'reply' && (
          <div className="space-y-2">
            <Label>Message Text</Label>
            <Input 
              value={data.text || ''} 
              onChange={(e) => handleChange('text', e.target.value)} 
            />
          </div>
        )}

        {node.type === 'actionNode' && data.actionType === 'delay' && (
          <div className="space-y-2">
            <Label>Delay (Seconds)</Label>
            <Input 
              type="number"
              value={data.delaySeconds || 1} 
              onChange={(e) => handleChange('delaySeconds', parseInt(e.target.value))} 
            />
          </div>
        )}

        {node.type === 'conditionNode' && (
          <>
            <div className="space-y-2">
              <Label>Field</Label>
              <Select value={data.field || 'message.text'} onValueChange={(val) => handleChange('field', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="message.text">Incoming Message Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Operator</Label>
              <Select value={data.operator || 'contains'} onValueChange={(val) => handleChange('operator', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="equals">Equals Exact</SelectItem>
                  <SelectItem value="regex">Matches Regex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              <Input 
                value={data.value || ''} 
                onChange={(e) => handleChange('value', e.target.value)} 
              />
            </div>
          </>
        )}

        {node.type === 'apiRequestNode' && (
          <>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={data.method || 'GET'} onValueChange={(val) => handleChange('method', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input 
                value={data.url || ''} 
                onChange={(e) => handleChange('url', e.target.value)} 
                placeholder="https://api.example.com/data"
              />
            </div>
            <div className="space-y-2">
              <Label>Headers (JSON)</Label>
              <Input 
                value={data.headers || '{}'} 
                onChange={(e) => handleChange('headers', e.target.value)} 
                placeholder='{"Authorization": "Bearer token"}'
              />
            </div>
            <div className="space-y-2">
              <Label>Body (JSON)</Label>
              <Input 
                value={data.body || ''} 
                onChange={(e) => handleChange('body', e.target.value)} 
                placeholder='{"key": "value"}'
              />
            </div>
          </>
        )}

        {node.type === 'webhookNode' && (
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <Input 
              value={data.webhookUrl || ''} 
              onChange={(e) => handleChange('webhookUrl', e.target.value)} 
              placeholder="https://your-server.com/webhook"
            />
          </div>
        )}

      </div>
    </div>
  );
}
