import { ChangeEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import { AIFormSequenceType } from '~/features/wiki/PagesAssistant/AI/Creation/Sequence/Steps/Step2/useAISequenceStep2';
import {
  useSequenceFormValuesStore,
  usePagesAssistantActions,
} from '~/store/assistant/sequence/sequenceStore';

export interface SequenceFieldFormValues {
  sequenceType: AIFormSequenceType;
  sequenceContentProgram: string;
  sequenceContentTheme: string;
  seancesCount: number;
  seancesDuration: number;
}

export const useAIFormSequenceField = () => {
  const { control, register } = useFormContext<SequenceFieldFormValues>();
  const formValues = useSequenceFormValuesStore();
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
