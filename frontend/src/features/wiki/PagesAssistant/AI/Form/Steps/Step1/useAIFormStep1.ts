import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { PagesAssistantAIStep1FormValues } from '~/services/api/assistant/assistant.types';
import {
  useFormValuesStore,
  usePagesAssistantActions,
} from '~/store/assistant';
import { useLevels } from './useLevels';
import { useSubjects } from './useSubjects';

export const useAIFormStep1 = () => {
  const navigate = useNavigate();
  const params = useParams();

  const { collegeLevels, lyceeLevels } = useLevels();
  const formValues = useFormValuesStore();
  const { setFormValues } = usePagesAssistantActions();

  const {
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { isValid },
  } = useForm<PagesAssistantAIStep1FormValues>({
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
    navigate(`/id/${params.wikiId}/pages/assistant/ai/step2Form`);
  };

  const handleLevelChange = () => {
    // Reset subject, sequence when level changes
    setValue('subject', '');
  };

  const handleBackButtonClick = () => {
    navigate(`/id/${params.wikiId}/pages/assistant`);
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
