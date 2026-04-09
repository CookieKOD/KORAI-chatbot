// app/GlobalState.js
import { create } from 'zustand';

export const useGlobalStore = create((set) => ({
  lastOtoResult: null,
  setLastOtoResult: (result) => set({ lastOtoResult: result }),
}));