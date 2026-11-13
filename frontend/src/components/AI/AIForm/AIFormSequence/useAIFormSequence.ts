import { ChangeEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import { AIFormSequenceType } from '~/features/wiki/PagesAssistant/AI/AssistedCreation/Plan/Steps/Step2/useAIPlanStep2';
import {
  useFormValuesStore,
  usePagesAssistantActions,
} from '~/store/assistant';

export interface SequenceFormValues {
  sequenceType: AIFormSequenceType;
  sequence: string;
}

export const useAIFormSequence = () => {
  const { control, register } = useFormContext<SequenceFormValues>();
  const formValues = useFormValuesStore();
  const { setFormValues } = usePagesAssistantActions();

  // TODO Dynamic values
  const sequences = [
    'Sequence 1',
    'Sequence 2',
    'Sequence 3',
    'Sequence 4',
    'Sequence 5',
  ];

  const handleSequenceTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      sequenceType: event.target.value as AIFormSequenceType,
    });
  };

  return {
    control,
    sequences,
    formValues,
    register,
    handleSequenceTypeChange,
  };
};
