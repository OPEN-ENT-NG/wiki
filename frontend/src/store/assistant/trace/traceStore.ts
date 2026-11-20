import { createStore, useStore } from 'zustand';
import { AITraceStep1FormValues } from '~/features/wiki/PagesAssistant/AI/Creation/Trace/Steps/Step1/useAITraceStep1';
import { AITraceStep2FormValues } from '~/features/wiki/PagesAssistant/AI/Creation/Trace/Steps/Step2/useAITraceStep2';
import { PageStructure } from '~/services/api/assistant/assistant.types';

export interface AITraceFormValues
  extends AITraceStep1FormValues, AITraceStep2FormValues {}

interface State {
  formValues: AITraceFormValues;
  pagesStructure: PageStructure[];
}

type Action = {
  actions: {
    setFormValues: (formData: AITraceFormValues) => void;
    setPagesStructure: (pagesStructure: PageStructure[]) => void;
  };
};

type Params<U> = Parameters<typeof useStore<typeof store, U>>;

export const DEFAULT_AI_FORM_VALUES: AITraceFormValues = {
  level: '',
  subject: '',
  sequence: '',
  keywords: '',
};

const initialState: State = {
  formValues: DEFAULT_AI_FORM_VALUES,
  pagesStructure: [],
};

const store = createStore<State & Action>()((set) => ({
  ...initialState,
  actions: {
    setFormValues: (formData: AITraceFormValues) =>
      set({ formValues: formData }),
    setPagesStructure: (pagesStructure: PageStructure[]) =>
      set({ pagesStructure }),
  },
}));

// React Store
function useAssistantStore<U>(selector: Params<U>[1]) {
  return useStore(store, selector);
}

// Hooks to access state
export const useTraceFormValuesStore = () =>
  useAssistantStore((state) => state.formValues);
export const usePagesStructureStore = () =>
  useAssistantStore((state) => state.pagesStructure);
export const usePagesAssistantActions = () =>
  useAssistantStore((state) => state.actions);
