import { ChangeEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  useSequenceFormValuesStore,
  usePagesAssistantActions,
} from '~/store/assistant/sequence/sequenceStore';

export interface SchoolTypeFormValues {
  schoolType: string;
}

export const useAIFormSchoolType = () => {
  const { control } = useFormContext<SchoolTypeFormValues>();
  const formValues = useSequenceFormValuesStore();
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
    schoolTypes,
    handleSchoolTypeChange,
  };
};
