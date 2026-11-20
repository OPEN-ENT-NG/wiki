import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { PagesAssistantAIStep2FormValues } from '~/services/api/assistant/assistant.types';
import { useSubjects } from '../Step1/useSubjects';
import {
  usePagesAssistantActions,
  useTraceFormValuesStore,
} from '~/store/assistant/trace/traceStore';

export interface AITraceStep2FormValues {
  sequence: string;
  keywords?: string;
}

export const useAITraceStep2 = () => {
  const navigate = useNavigate();
  const params = useParams();

  const formValues = useTraceFormValuesStore();
  const { subjects } = useSubjects(formValues.level);
  const { setFormValues } = usePagesAssistantActions();

  const {
    watch,
    handleSubmit,
    register,
    control,
    formState: { isValid },
  } = useForm<PagesAssistantAIStep2FormValues>({
    defaultValues: {
      sequence: formValues.sequence || '',
      keywords: formValues.keywords || '',
    },
  });

  const availableSequences =
    useMemo(
      () =>
        subjects.find((subj) => subj.value === formValues.subject)?.sequences ??
        [],
      [subjects, formValues.subject],
    ) || [];

  const onSubmit = async (step2FormValues: PagesAssistantAIStep2FormValues) => {
    // Add values to store
    setFormValues({ ...formValues, ...step2FormValues });
    // Navigate to pages structure loading step
    navigate(`/id/${params.wikiId}/pages/assistant/ai/creation/trace/generate`);
  };

  const handleBackButtonClick = () => {
    const keywords = watch('keywords');
    setFormValues({ ...formValues, keywords });
    navigate(`/id/${params.wikiId}/pages/assistant/ai/creation/trace/step1`);
  };

  return {
    availableSequences,
    control,
    isValid,
    watch,
    register,
    handleBackButtonClick,
    handleSubmit,
    onSubmit,
  };
};
