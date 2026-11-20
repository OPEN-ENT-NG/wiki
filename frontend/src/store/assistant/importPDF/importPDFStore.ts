import { createStore, useStore } from 'zustand';
import { PageStructure } from '~/services/api/assistant/assistant.types';

interface State {
  pagesStructure: PageStructure[];
  pdfFileId: string;
}

type Action = {
  actions: {
    setPagesStructure: (pagesStructure: PageStructure[]) => void;
    setPdfFileId: (pdfFileId: string) => void;
  };
};

type Params<U> = Parameters<typeof useStore<typeof store, U>>;

const initialState: State = {
  pagesStructure: [],
  pdfFileId: '',
};

const store = createStore<State & Action>()((set) => ({
  ...initialState,
  actions: {
    setPagesStructure: (pagesStructure: PageStructure[]) =>
      set({ pagesStructure }),
    setPdfFileId: (pdfFileId: string) => set({ pdfFileId }),
  },
}));

// React Store
function useAssistantStore<U>(selector: Params<U>[1]) {
  return useStore(store, selector);
}

// Hooks to access state
export const usePagesStructureStore = () =>
  useAssistantStore((state) => state.pagesStructure);
export const usePdfFileId = () => useAssistantStore((state) => state.pdfFileId);
export const usePagesAssistantActions = () =>
  useAssistantStore((state) => state.actions);
