import { ChangeEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  useFormValuesStore,
  usePagesAssistantActions,
} from '~/store/assistant';

export interface SchoolTypeFormValues {
  schoolType: string;
}

export const useAIFormSchoolType = () => {
  const { control, formState } = useFormContext<SchoolTypeFormValues>();
  const formValues = useFormValuesStore();
  const { setFormValues } = usePagesAssistantActions();

  // TODO Dynamic values
  const schoolTypes = [
    'Collège',
    'Lycée général et techno.',
    'Lycée professionnel',
    'Lycée agricole',
  ];

  const handleSchoolTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      schoolType: event.target.value,
    });
  };

  return {
    control,
    formState,
    schoolTypes,
    handleSchoolTypeChange,
  };
};
