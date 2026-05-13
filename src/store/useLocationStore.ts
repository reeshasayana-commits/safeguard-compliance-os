import { create } from 'zustand';
import { apiClient } from '../api/client';
import { type LocationNode } from '../data/location-tree';
import { LOCATION_TREE } from '../data/location-tree';

interface LocationState {
  tree: LocationNode[];
  isLoading: boolean;
  error: string | null;
  fetchTree: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  tree: LOCATION_TREE, // Default to mock tree
  isLoading: false,
  error: null,

  fetchTree: async () => {
    // Only fetch if we haven't already or if we want to refresh
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/locations/tree');
      // If the response is empty or invalid, keep the mock tree
      if (Array.isArray(response.data) && response.data.length > 0) {
        set({ tree: response.data as LocationNode[], isLoading: false });
      } else {
        set({ tree: LOCATION_TREE, isLoading: false });
      }
    } catch (err: any) {
      console.warn('Failed to fetch location tree from API, falling back to mock data');
      set({ tree: LOCATION_TREE, isLoading: false });
    }
  },
}));
