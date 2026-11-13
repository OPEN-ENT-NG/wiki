import { useNavigate, useParams } from 'react-router-dom';
import {
  useFormValuesStore,
  usePagesAssistantActions,
} from '~/store/assistant';

export interface AIPlanStep1FormValues {
  schoolType: string;
  level: string;
  subject: string;
}

export const useAIPlanStep1 = () => {
  // get the Form Values from the Store
  const formValues = useFormValuesStore();
  const { setFormValues } = usePagesAssistantActions();

  const navigate = useNavigate();
  const params = useParams();

  // form defaultValues (from the FormValues store or initialized)
  const defaultValues: AIPlanStep1FormValues = {
    schoolType: formValues.schoolType,
    level: formValues.level,
    subject: formValues.subject,
  };

  // submit function called by react hook form
  // - add form values to FormValues Store
  // - navigate to next step
  const onSubmit = async (step1FormValues: AIPlanStep1FormValues) => {
    setFormValues({ ...formValues, ...step1FormValues });
    navigate(`/id/${params.wikiId}/pages/assistant/ai/creation/plan/step2`);
  };

  const handlePreviousClick = () => {
    navigate(`/id/${params.wikiId}/pages/assistant/ai/creation/choose`);
  };

  return {
    defaultValues,
    formValues,
    handlePreviousClick,
    onSubmit,
  };
};
