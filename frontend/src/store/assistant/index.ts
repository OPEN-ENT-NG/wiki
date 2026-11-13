import { createStore, useStore } from 'zustand';
import { AIPlanStep1FormValues } from '~/features/wiki/PagesAssistant/AI/AssistedCreation/Plan/Steps/Step1/useAIPlanStep1';
import { AIPlanStep2FormValues } from '~/features/wiki/PagesAssistant/AI/AssistedCreation/Plan/Steps/Step2/useAIPlanStep2';
import { PageStructure } from '~/services/api/assistant/assistant.types';

export interface AIFormValues
  extends AIPlanStep1FormValues, AIPlanStep2FormValues {}

interface State {
  formValues: AIFormValues;
  pagesStructure: PageStructure[];
  pdfFileId: string;
}

type Action = {
  actions: {
    setFormValues: (formData: AIFormValues) => void;
    setPagesStructure: (pagesStructure: PageStructure[]) => void;
    setPdfFileId: (pdfFileId: string) => void;
  };
};

type Params<U> = Parameters<typeof useStore<typeof store, U>>;

const initialState: State = {
  formValues: {
    schoolType: '',
    level: '',
    subject: '',
    sequenceType: 'program',
    sequence: '',
    keywords: '',
  },
  pagesStructure: [],
  pdfFileId: '',
};

const store = createStore<State & Action>()((set) => ({
  ...initialState,
  actions: {
    setFormValues: (formData: AIFormValues) => set({ formValues: formData }),
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
