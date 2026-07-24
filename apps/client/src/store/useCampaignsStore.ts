import { create } from 'zustand';
import { api } from '@/lib/api';
import { Template } from './useTemplatesStore';

export type CampaignStatus = "DRAFT" | "SCHEDULED" | "RUNNING" | "PAUSED" | "COMPLETED" | "FAILED";

export type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  templateId?: string;
  template?: Template;
  audience?: any;
  variables?: any;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
};

interface CampaignsState {
  campaigns: Campaign[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  
  fetchCampaigns: (query?: { page?: number; limit?: number; search?: string }) => Promise<void>;
  createCampaign: (data: Partial<Campaign>) => Promise<Campaign>;
  updateCampaign: (id: string, data: Partial<Campaign>) => Promise<void>;
  launchCampaign: (id: string) => Promise<void>;
  pauseCampaign: (id: string) => Promise<void>;
  resumeCampaign: (id: string) => Promise<void>;
  retryCampaign: (id: string) => Promise<void>;
}

export const useCampaignsStore = create<CampaignsState>((set, get) => ({
  campaigns: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
  loading: false,

  fetchCampaigns: async (query = {}) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/campaigns', { params: query });
      set({ 
        campaigns: data.data,
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        loading: false 
      });
    } catch (error) {
      console.error('Failed to fetch campaigns', error);
      set({ loading: false });
    }
  },

  createCampaign: async (data) => {
    try {
      const response = await api.post('/campaigns', data);
      await get().fetchCampaigns({ page: 1, limit: get().limit });
      return response.data;
    } catch (error) {
      console.error('Failed to create campaign', error);
      throw error;
    }
  },

  updateCampaign: async (id, data) => {
    try {
      await api.put(`/campaigns/${id}`, data);
      await get().fetchCampaigns({ page: get().page, limit: get().limit });
    } catch (error) {
      console.error('Failed to update campaign', error);
      throw error;
    }
  },

  launchCampaign: async (id) => {
    try {
      await api.post(`/campaigns/${id}/launch`);
      await get().fetchCampaigns({ page: get().page, limit: get().limit });
    } catch (error) {
      console.error('Failed to launch campaign', error);
      throw error;
    }
  },

  pauseCampaign: async (id) => {
    try {
      await api.post(`/campaigns/${id}/pause`);
      await get().fetchCampaigns({ page: get().page, limit: get().limit });
    } catch (error) {
      console.error('Failed to pause campaign', error);
      throw error;
    }
  },

  resumeCampaign: async (id) => {
    try {
      await api.post(`/campaigns/${id}/resume`);
      await get().fetchCampaigns({ page: get().page, limit: get().limit });
    } catch (error) {
      console.error('Failed to resume campaign', error);
      throw error;
    }
  },

  retryCampaign: async (id) => {
    try {
      await api.post(`/campaigns/${id}/retry`);
      await get().fetchCampaigns({ page: get().page, limit: get().limit });
    } catch (error) {
      console.error('Failed to retry campaign', error);
      throw error;
    }
  }
}));
