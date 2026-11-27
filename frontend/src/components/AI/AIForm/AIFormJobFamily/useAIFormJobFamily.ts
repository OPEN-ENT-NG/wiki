import { useFormContext } from 'react-hook-form';
import {
  usePagesAssistantActions,
  useSequenceFormValuesStore,
} from '~/store/assistant/sequence/sequenceStore';

export interface JobFamilyFormValues {
  jobFamily: string;
}

export const useAIFormJobFamily = () => {
  const { control } = useFormContext<JobFamilyFormValues>();
  const formValues = useSequenceFormValuesStore();
  const { setFormValues } = usePagesAssistantActions();

  // TODO dynamic values
  const jobFamilies = ['Profession 1', 'Profession 2', 'Profession 3'];

  const handleJobFamilyChange = (jobFamily: string) => {
    setFormValues({
      ...formValues,
      jobFamily,
    });
  };

  return {
    control,
    jobFamilies,
    handleJobFamilyChange,
  };
};
