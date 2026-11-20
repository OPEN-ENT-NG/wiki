import { useNavigate, useParams } from 'react-router-dom';
import { ObjectiveFormValues } from '~/components/AI/AIForm/AIFormObjective/useAIFormObjective';
import { SequenceFormValues } from '~/components/AI/AIForm/AIFormSequence/useAIFormSequence';
import {
  usePagesAssistantActions,
  usePlanFormValuesStore,
} from '~/store/assistant/plan/planStore';

export type AIFormSequenceType = 'program' | 'theme';

export type AIPlanStep2FormValues = SequenceFormValues & ObjectiveFormValues;

export const useAIPlanStep2 = () => {
  // get the Form Values from the Store
  const formValues = usePlanFormValuesStore();
  const { setFormValues } = usePagesAssistantActions();

  const navigate = useNavigate();
  const params = useParams();

  const defaultValues: AIPlanStep2FormValues = {
    sequenceType: formValues.sequenceType,
    sequenceProgram: formValues.sequenceProgram,
    sequenceTheme: formValues.sequenceTheme,
    seancesCount: formValues.seancesCount,
    seancesDuration: formValues.seancesDuration,
    objectives: formValues.objectives,
  };

  // submit function called by react hook form:
  // - add values to store
  // - navigate to wiki generation
  const onSubmit = async (step2FormValues: AIPlanStep2FormValues) => {
    console.log('step2FormValues', step2FormValues);
    setFormValues({ ...formValues, ...step2FormValues });
    // TODO wiki generation
    navigate(`/id/${params.wikiId}/pages/assistant/ai/creation/generate`);
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
