import { create } from 'zustand';
import { api } from '@/lib/api';

export type Contact = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  phone: string;
  email?: string | null;
  tags: string[];
  status: "OPTED_IN" | "OPTED_OUT";
  lastActive?: string | null;
  attributes?: Record<string, string>;
  notes?: string | null;
  customFields?: Record<string, any> | null;
};

interface ContactsState {
  contacts: Contact[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  
  fetchContacts: (query?: { page?: number; limit?: number; search?: string; tags?: string; status?: string }) => Promise<void>;
  bulkAction: (ids: string[], action: string, data?: any) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  createContact: (data: any) => Promise<void>;
  updateContact: (id: string, data: any) => Promise<void>;
  mergeContacts: (primaryId: string, secondaryId: string) => Promise<void>;
  importContacts: (file: File) => Promise<void>;
  exportContacts: () => Promise<string>;
}

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
  loading: false,

  fetchContacts: async (query = {}) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/contacts', { params: query });
      set({ 
        contacts: data.data,
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        loading: false 
      });
    } catch (error) {
      console.error('Failed to fetch contacts', error);
      set({ loading: false });
    }
  },

  bulkAction: async (ids, action, data = {}) => {
    try {
      await api.patch('/contacts/bulk', { ids, action, ...data });
      // Refresh list
      await get().fetchContacts({ page: get().page, limit: get().limit });
    } catch (error) {
      console.error('Failed bulk action', error);
      throw error;
    }
  },

  deleteContact: async (id) => {
    try {
      await api.delete(`/contacts/${id}`);
      set((state) => ({ contacts: state.contacts.filter(c => c.id !== id) }));
    } catch (error) {
      console.error('Failed to delete contact', error);
    }
  },

  createContact: async (data) => {
    try {
      await api.post('/contacts', data);
      await get().fetchContacts({ page: get().page, limit: get().limit });
    } catch (error) {
      console.error('Failed to create contact', error);
      throw error;
    }
  },

  updateContact: async (id, data) => {
    try {
      await api.put(`/contacts/${id}`, data);
      set((state) => ({
        contacts: state.contacts.map(c => c.id === id ? { ...c, ...data } : c)
      }));
    } catch (error) {
      console.error('Failed to update contact', error);
      throw error;
    }
  },

  mergeContacts: async (primaryId, secondaryId) => {
    try {
      await api.post('/contacts/merge', { primaryId, secondaryId });
      await get().fetchContacts({ page: get().page, limit: get().limit });
    } catch (error) {
      console.error('Failed to merge contacts', error);
      throw error;
    }
  },

  importContacts: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post('/contacts/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await get().fetchContacts();
    } catch (error) {
      console.error('Failed to import contacts', error);
      throw error;
    }
  },

  exportContacts: async () => {
    try {
      const { data } = await api.get('/contacts/export');
      return data.data;
    } catch (error) {
      console.error('Failed to export contacts', error);
      throw error;
    }
  }
}));
