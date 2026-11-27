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

  // TODO Dynamic values
  const schoolTypes: SchoolType[] = [
    { label: 'Collège', value: 'college' },
    { label: 'Lycée général et techno.', value: 'lycee_general_techno' },
    { label: 'Lycée professionnel', value: 'lycee_pro' },
    { label: 'Lycée agricole', value: 'lycee_agricole' },
  ];

  const handleSchoolTypeChange = (schoolType: SchoolTypeValue) => {
    setFormValues({
      ...formValues,
      schoolType,
    });
  };

  return {
    control,
    schoolTypes,
    handleSchoolTypeChange,
  };
};
