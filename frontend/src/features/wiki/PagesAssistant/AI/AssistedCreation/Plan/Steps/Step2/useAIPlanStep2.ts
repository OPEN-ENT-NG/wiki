import {
  useFormValuesStore,
  usePagesAssistantActions,
} from '~/store/assistant';

export type AIFormSequenceType = 'program' | 'theme';

export interface AIPlanStep2FormValues {
  sequenceType: AIFormSequenceType;
  sequence: string;
  keywords?: string;
}

export const useAIPlanStep2 = () => {
  // get the Form Values from the Store
  const formValues = useFormValuesStore();
  const { setFormValues } = usePagesAssistantActions();

  const defaultValues: AIPlanStep2FormValues = {
    sequenceType: formValues.sequenceType,
    sequence: formValues.sequence,
  };

  // submit function called by react hook form:
  // - add values to store
  // - navigate to wiki generation
  const onSubmit = async (step2FormValues: AIPlanStep2FormValues) => {
    setFormValues({ ...formValues, ...step2FormValues });
    // TODO wiki generation
  };

  return {
    defaultValues,
    onSubmit,
  };
};
