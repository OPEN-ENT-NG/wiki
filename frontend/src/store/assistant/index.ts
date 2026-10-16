import { createStore, useStore } from 'zustand';
import {
  PagesAssistantAIFormValues,
  PageStructure,
} from '~/services/api/assistant/assistant.types';

interface State {
  formValues: PagesAssistantAIFormValues;
  pagesStructure: PageStructure[];
  pdfFileId: string;
}

type Action = {
  actions: {
    setFormValues: (formData: PagesAssistantAIFormValues) => void;
    setPagesStructure: (pagesStructure: PageStructure[]) => void;
    setPdfFileId: (pdfFileId: string) => void;
  };
};

type Params<U> = Parameters<typeof useStore<typeof store, U>>;

const initialState: State = {
  formValues: { level: '', subject: '', sequence: '', keywords: '' },
  pagesStructure: [],
  pdfFileId: '',
};

const store = createStore<State & Action>()((set) => ({
  ...initialState,
  actions: {
    setFormValues: (formData: PagesAssistantAIFormValues) =>
      set({ formValues: formData }),
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
export const useFormValuesStore = () =>
  useAssistantStore((state) => state.formValues);
export const usePagesStructureStore = () =>
  useAssistantStore((state) => state.pagesStructure);
export const usePdfFileId = () => useAssistantStore((state) => state.pdfFileId);
export const usePagesAssistantActions = () =>
  useAssistantStore((state) => state.actions);
