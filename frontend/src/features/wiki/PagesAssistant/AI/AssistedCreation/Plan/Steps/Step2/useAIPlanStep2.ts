import { useNavigate, useParams } from 'react-router-dom';
import {
  useFormValuesStore,
  usePagesAssistantActions,
} from '~/store/assistant';

export type AIFormSequenceType = 'program' | 'theme';

export interface AIPlanStep2FormValues {
  sequenceType: AIFormSequenceType;
  sequence: string;
  sessionCount: number;
  keywords?: string;
}

export const useAIPlanStep2 = () => {
  // get the Form Values from the Store
  const formValues = useFormValuesStore();
  const { setFormValues } = usePagesAssistantActions();

  const navigate = useNavigate();
  const params = useParams();

  const defaultValues: AIPlanStep2FormValues = {
    sequenceType: formValues.sequenceType,
    sequence: formValues.sequence,
    sessionCount: formValues.sessionCount,
  };

  // submit function called by react hook form:
  // - add values to store
  // - navigate to wiki generation
  const onSubmit = async (step2FormValues: AIPlanStep2FormValues) => {
    setFormValues({ ...formValues, ...step2FormValues });
    console.log('step2FormValues', step2FormValues);

    // TODO wiki generation
  };

  const handlePreviousClick = () => {
    navigate(`/id/${params.wikiId}/pages/assistant/ai/creation/plan/step1`);
  };

  return {
    defaultValues,
    handlePreviousClick,
    onSubmit,
  };
};
