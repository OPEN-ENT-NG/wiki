import { createStore, useStore } from 'zustand';
import { AIPlanStep1FormValues } from '~/features/wiki/PagesAssistant/AI/Creation/Plan/Steps/Step1/useAIPlanStep1';
import { AIPlanStep2FormValues } from '~/features/wiki/PagesAssistant/AI/Creation/Plan/Steps/Step2/useAIPlanStep2';
import { PageStructure } from '~/services/api/assistant/assistant.types';

export interface AIPlanFormValues
  extends AIPlanStep1FormValues, AIPlanStep2FormValues {}

interface State {
  formValues: AIPlanFormValues;
  pagesStructure: PageStructure[];
}

type Action = {
  actions: {
    setFormValues: (formData: AIPlanFormValues) => void;
    setPagesStructure: (pagesStructure: PageStructure[]) => void;
  };
};

type Params<U> = Parameters<typeof useStore<typeof store, U>>;

export const DEFAULT_AI_FORM_VALUES: AIPlanFormValues = {
  schoolType: '',
  level: '',
  subject: '',
  sequenceType: 'program',
  sequenceProgram: '',
  sequenceTheme: '',
  seancesCount: 3,
  seancesDuration: 1,
  objectives: [{ verb: '', text: '' }],
};

const initialState: State = {
  formValues: DEFAULT_AI_FORM_VALUES,
  pagesStructure: [],
};

const store = createStore<State & Action>()((set) => ({
  ...initialState,
  actions: {
    setFormValues: (formData: AIPlanFormValues) =>
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
export const usePlanFormValuesStore = () =>
  useAssistantStore((state) => state.formValues);
export const usePagesStructureStore = () =>
  useAssistantStore((state) => state.pagesStructure);
export const usePagesAssistantActions = () =>
  useAssistantStore((state) => state.actions);
