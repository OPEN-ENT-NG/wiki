import { createStore, useStore } from 'zustand';
import {
  PageContent,
  PagesAssistantAIFormValues,
  PageStructure,
} from '~/services/api/assistant/assistant.types';

interface State {
  formValues: PagesAssistantAIFormValues;
  pagesStructure: PageStructure[];
  pagesContent: PageContent[];
}

type Action = {
  actions: {
    setFormValues: (formData: PagesAssistantAIFormValues) => void;
    setPagesStructure: (pagesStructure: PageStructure[]) => void;
    setPagesContent: (pagesContent: PageContent[]) => void;
  };
};

type Params<U> = Parameters<typeof useStore<typeof store, U>>;

const initialState: State = {
  formValues: { level: '', subject: '', sequence: '', keywords: '' },
  pagesStructure: [],
  pagesContent: [],
};

const store = createStore<State & Action>()((set) => ({
  ...initialState,
  actions: {
    setFormValues: (formData: PagesAssistantAIFormValues) =>
      set({ formValues: formData }),
    setPagesStructure: (pagesStructure: PageStructure[]) =>
      set({ pagesStructure }),
    setPagesContent: (pagesContent: PageContent[]) => set({ pagesContent }),
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
export const usePagesContent = () =>
  useAssistantStore((state) => state.pagesContent);
export const usePagesAssistantActions = () =>
  useAssistantStore((state) => state.actions);
