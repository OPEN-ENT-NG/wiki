import { ChangeEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  usePlanFormValuesStore,
  usePagesAssistantActions,
} from '~/store/assistant/plan/planStore';

export interface LevelFormValues {
  level: string;
}

export const useAIFormLevel = () => {
  const { control } = useFormContext<LevelFormValues>();
  const formValues = usePlanFormValuesStore();
  const { setFormValues } = usePagesAssistantActions();

  // TODO Dynamic values
  const levels = ['6ème', '5ème', '4ème', '3ème'];

  const handleLevelChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      level: event.target.value,
    });
  };

  return {
    control,
    levels,
    handleLevelChange,
  };
};
