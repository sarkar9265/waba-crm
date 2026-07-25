import { create } from 'zustand';
import { api } from '@/lib/api';

export type TemplateComponent = {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  format?: "TEXT" | "IMAGE" | "DOCUMENT" | "VIDEO";
  text?: string;
  buttons?: any[];
};

export type Template = {
  id: string;
  name: string;
  language: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  components?: TemplateComponent[];
  createdAt: string;
  updatedAt: string;
};

interface TemplatesState {
  templates: Template[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  
  fetchTemplates: (query?: { page?: number; limit?: number; search?: string; status?: string; category?: string; language?: string }) => Promise<void>;
  createTemplate: (data: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  syncTemplate: (id: string) => Promise<void>;
}

export const useTemplatesStore = create<TemplatesState>((set, get) => ({
  templates: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
  loading: false,

  fetchTemplates: async (query = {}) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/templates', { params: query });
      set({ 
        templates: data.data,
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        loading: false 
      });
    } catch (error) {
      console.error('Failed to fetch templates', error);
      set({ loading: false });
    }
  },

  createTemplate: async (data) => {
    try {
      await api.post('/templates', data);
      await get().fetchTemplates({ page: 1, limit: get().limit });
    } catch (error) {
      console.error('Failed to create template', error);
      throw error;
    }
  },

  deleteTemplate: async (id) => {
    try {
      await api.delete(`/templates/${id}`);
      set((state) => ({ templates: state.templates.filter(t => t.id !== id) }));
    } catch (error) {
      console.error('Failed to delete template', error);
      throw error;
    }
  },

  syncTemplate: async (id) => {
    try {
      await api.post(`/templates/${id}/sync`);
      await get().fetchTemplates({ page: get().page, limit: get().limit });
    } catch (error) {
      console.error('Failed to sync template', error);
      throw error;
    }
  }
}));
