"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@algo-matrix/ui';
import { Plus, Play, Pause, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AutomationListPage() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      const res = await api.get('/automation');
      setAutomations(res.data);
    } catch (error) {
      toast.error('Failed to fetch automations');
    } finally {
      setLoading(false);
    }
  };

  const createAutomation = async () => {
    try {
      const res = await api.post('/automation', {
        name: 'New Workflow',
        triggerType: 'INCOMING_MESSAGE',
      });
      router.push(`/automation/${res.data.id}`);
    } catch (error) {
      toast.error('Failed to create automation');
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/automation/${id}`, { isActive: !currentStatus });
      fetchAutomations();
      toast.success(currentStatus ? 'Automation paused' : 'Automation activated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteAutomation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;
    try {
      await api.delete(`/automation/${id}`);
      fetchAutomations();
      toast.success('Automation deleted');
    } catch (error) {
      toast.error('Failed to delete automation');
    }
  };

  if (loading) return <div className="p-8">Loading automations...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automations</h1>
          <p className="text-muted-foreground mt-2">Build visual workflows to automate your WhatsApp messaging.</p>
        </div>
        <Button onClick={createAutomation}>
          <Plus className="mr-2 h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      {automations.length === 0 ? (
        <Card className="text-center p-12 border-dashed">
          <CardContent>
            <div className="mb-4 flex justify-center">
              <div className="bg-primary/10 p-4 rounded-full">
                <Play className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Automations Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Create your first visual workflow to automatically reply to messages, assign agents, and more.
            </p>
            <Button onClick={createAutomation}>Get Started</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {automations.map((auto) => (
            <Card key={auto.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-1">{auto.name}</CardTitle>
                    <CardDescription>Trigger: {auto.triggerType.replace('_', ' ')}</CardDescription>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full font-medium ${auto.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                    {auto.isActive ? 'Active' : 'Paused'}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {auto.nodes?.length || 0} nodes • {auto.edges?.length || 0} edges
                </p>
              </CardContent>
              <div className="p-4 border-t flex justify-end space-x-2 bg-muted/20">
                <Button variant="outline" size="sm" onClick={() => toggleStatus(auto.id, auto.isActive)}>
                  {auto.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push(`/automation/${auto.id}`)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => deleteAutomation(auto.id)} className="text-red-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
