import { useFormContext } from 'react-hook-form';
import {
  useSequenceFormValuesStore,
  usePagesAssistantActions,
} from '~/store/assistant/sequence/sequenceStore';

export type SchoolTypeValue =
  | ''
  | 'college'
  | 'lycee_general_techno'
  | 'lycee_pro'
  | 'lycee_agricole';

export interface SchoolType {
  label: string;
  value: SchoolTypeValue;
}

export interface SchoolTypeFormValues {
  schoolType: SchoolTypeValue;
}

export const useAIFormSchoolType = () => {
  const { control } = useFormContext<SchoolTypeFormValues>();
  const formValues = useSequenceFormValuesStore();
  const { setFormValues } = usePagesAssistantActions();

  const handleSchoolTypeChange = (schoolType: SchoolTypeValue) => {
    setFormValues({
      ...formValues,
      schoolType,
    });
  };

  return {
    control,
    handleSchoolTypeChange,
  };
};
