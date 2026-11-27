import { createStore, useStore } from 'zustand';
import { AISequenceStep1FormValues } from '~/features/wiki/PagesAssistant/AI/Creation/Sequence/Steps/Step1/useAISequenceStep1';
import { AISequenceStep2FormValues } from '~/features/wiki/PagesAssistant/AI/Creation/Sequence/Steps/Step2/useAISequenceStep2';
import { PageStructure } from '~/services/api/assistant/assistant.types';

export interface AISequenceFormValues
  extends AISequenceStep1FormValues, AISequenceStep2FormValues {}

interface State {
  formValues: AISequenceFormValues;
  pagesStructure: PageStructure[];
}

type Action = {
  actions: {
    setFormValues: (formData: AISequenceFormValues) => void;
    setPagesStructure: (pagesStructure: PageStructure[]) => void;
  };
};

type Params<U> = Parameters<typeof useStore<typeof store, U>>;

export const DEFAULT_AI_FORM_VALUES: AISequenceFormValues = {
  schoolType: '',
  level: '',
  jobFamily: '',
  subject: '',
  sequenceType: 'program',
  sequenceContentProgram: '',
  sequenceContentTheme: '',
  seancesCount: 3,
  seancesDuration: 1,
  objectives: [{ verb: '', text: '' }],
  priorKnowledge: '',
  accroche: '',
  difficulties: '',
  inclusion: '',
};

const initialState: State = {
  formValues: DEFAULT_AI_FORM_VALUES,
  pagesStructure: [],
};

const store = createStore<State & Action>()((set) => ({
  ...initialState,
  actions: {
    setFormValues: (formData: AISequenceFormValues) =>
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
export const useSequenceFormValuesStore = () =>
  useAssistantStore((state) => state.formValues);
export const usePagesStructureStore = () =>
  useAssistantStore((state) => state.pagesStructure);
export const usePagesAssistantActions = () =>
  useAssistantStore((state) => state.actions);
