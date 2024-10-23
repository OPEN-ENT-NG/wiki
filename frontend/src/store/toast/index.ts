import { createStore, useStore } from 'zustand';

interface ToastMessage {
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
}

interface ToastState {
  toastMessages: ToastMessage[];
  addToastMessage: (message: Omit<ToastMessage, 'id'>) => void;
  clearToastMessages: () => void;
}

const toastStore = createStore<ToastState>()((set) => ({
  toastMessages: [],
  addToastMessage: (message: Omit<ToastMessage, 'id'>) =>
    set((state) => ({
      toastMessages: [...state.toastMessages, { ...message }],
    })),
  clearToastMessages: () => set({ toastMessages: [] }),
}));

// Selectors
const selectToastMessages = (state: ToastState) => state.toastMessages;

// Getters
export const getToastActions = () => toastStore.getState();

// Hooks
export const useToastMessages = () => useStore(toastStore, selectToastMessages);
