import { create } from 'zustand';
import { api } from '@/lib/api';

export interface DashboardMetrics {
  activeConversations: number;
  totalContacts: number;
  activeCampaigns: number;
  messagesToday: number;
}

export interface ChartDataPoint {
  name: string;
  messages: number;
  inbound: number;
  outbound: number;
}

export interface ActiveCampaign {
  id: string;
  name: string;
  status: string;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  audience?: any;
}

export interface AgentStat {
  name: string;
  solved: number;
  csat: number;
}

interface AnalyticsState {
  metrics: DashboardMetrics | null;
  charts: ChartDataPoint[];
  campaigns: ActiveCampaign[];
  agents: AgentStat[];
  loading: boolean;
  
  fetchDashboardData: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  metrics: null,
  charts: [],
  campaigns: [],
  agents: [],
  loading: true,

  fetchDashboardData: async () => {
    set({ loading: true });
    try {
      const [metricsRes, chartsRes, campaignsRes, agentsRes] = await Promise.all([
        api.get('/analytics/metrics'),
        api.get('/analytics/charts'),
        api.get('/analytics/campaigns'),
        api.get('/analytics/agents')
      ]);

      set({ 
        metrics: metricsRes.data,
        charts: chartsRes.data,
        campaigns: campaignsRes.data,
        agents: agentsRes.data,
        loading: false 
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
      set({ loading: false });
    }
  },
}));
