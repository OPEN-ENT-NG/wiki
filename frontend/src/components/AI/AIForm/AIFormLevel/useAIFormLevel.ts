import { ChangeEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  useSequenceFormValuesStore,
  usePagesAssistantActions,
} from '~/store/assistant/sequence/sequenceStore';

export interface LevelFormValues {
  level: string;
}

export const useAIFormLevel = () => {
  const { control } = useFormContext<LevelFormValues>();
  const formValues = useSequenceFormValuesStore();
  const { setFormValues } = usePagesAssistantActions();

  const handleLevelChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      level: event.target.value,
    });
  };

  return {
    control,
    handleLevelChange,
  };
};
