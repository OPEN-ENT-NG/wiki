import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { PagesAssistantAIStep1FormValues } from '~/services/api/assistant/assistant.types';
import { useLevels } from './useLevels';
import { useSubjects } from './useSubjects';
import { LevelFormValues } from '~/components/AI/AIForm/AIFormLevel/useAIFormLevel';
import { SubjectFormValues } from '~/components/AI/AIForm/AIFormSubject/useAIFormSubject';
import {
  usePagesAssistantActions,
  useTraceFormValuesStore,
} from '~/store/assistant/trace/traceStore';

export type AITraceStep1FormValues = LevelFormValues & SubjectFormValues;

export const useAITraceStep1 = () => {
  const navigate = useNavigate();
  const params = useParams();

  const { collegeLevels, lyceeLevels } = useLevels();
  const formValues = useTraceFormValuesStore();
  const { setFormValues } = usePagesAssistantActions();

  const {
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { isValid },
  } = useForm<AITraceStep1FormValues>({
    defaultValues: {
      level: formValues.level || '6ème',
      subject: formValues.subject || '',
    },
  });

  const selectedLevel = watch('level');

  const { subjects } = useSubjects(selectedLevel);

  const onSubmit = async (step1FormValues: PagesAssistantAIStep1FormValues) => {
    // Add values to store
    setFormValues({ ...formValues, ...step1FormValues });
    // Navigate to next step
    navigate(`/id/${params.wikiId}/pages/assistant/ai/creation/trace/step2`);
  };

  const handleLevelChange = () => {
    // Reset subject, sequence when level changes
    setValue('subject', '');
  };

  const handleBackButtonClick = () => {
    navigate(`/id/${params.wikiId}/pages/assistant/ai/creation/choose`);
  };

  const handleSubjectSuggestionClick = () => {
    window.open(
      'https://survey.edifice.io/index.php/679298?newtest=Y&lang=fr',
      '_blank',
    );
  };

  return {
    subjects,
    collegeLevels,
    lyceeLevels,
    control,
    isValid,
    handleLevelChange,
    handleSubjectSuggestionClick,
    handleBackButtonClick,
    handleSubmit,
    onSubmit,
  };
};
