import { createStore, useStore } from 'zustand';

interface ToastMessage {
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
}

interface State {
  toastMessages: ToastMessage[];
}

type Action = {
  actions: {
    addToastMessage: (message: Omit<ToastMessage, 'id'>) => void;
    clearToastMessages: () => void;
  };
};

type ExtractState<S> = S extends {
  getState: () => infer T;
}
  ? T
  : never;

type Params<U> = Parameters<typeof useStore<typeof toastStore, U>>;

const initialState = {
  toastMessages: [],
};

const toastStore = createStore<State & Action>()((set) => ({
  ...initialState,
  actions: {
    addToastMessage: (message: Omit<ToastMessage, 'id'>) =>
      set((state) => ({
        toastMessages: [...state.toastMessages, { ...message }],
      })),
    clearToastMessages: () => set({ toastMessages: [] }),
  },
}));

// Selectors
const selectToastMessages = (state: State) => state.toastMessages;
const actionsSelector = (state: ExtractState<typeof toastStore>) =>
  state.actions;

// Getters
export const getToastActions = () => {
  const { addToastMessage } = toastStore.getState().actions;
  return { addToastMessage };
};

// React Store
function useToastStore<U>(selector: Params<U>[1]) {
  return useStore(toastStore, selector);
}

// Hooks
export const useToastMessages = () => useStore(toastStore, selectToastMessages);
export const useToastActions = () => useToastStore(actionsSelector);
