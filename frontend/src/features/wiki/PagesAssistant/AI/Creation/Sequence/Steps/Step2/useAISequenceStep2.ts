import { useNavigate, useParams } from 'react-router-dom';
import { ObjectivesFormValues } from '~/components/AI/AIForm/AIFormObjectives/useAIFormObjectives';
import { OptionalFieldsFormValues } from '~/components/AI/AIForm/AIFormOptionalFields/AIFormOptionalFields';
import { SequenceFieldFormValues } from '~/components/AI/AIForm/AIFormSequenceField/useAIFormSequenceField';
import {
  usePagesAssistantActions,
  useSequenceFormValuesStore,
} from '~/store/assistant/sequence/sequenceStore';

export type AIFormSequenceType = 'program' | 'theme';

export type AISequenceStep2FormValues = SequenceFieldFormValues &
  ObjectivesFormValues &
  OptionalFieldsFormValues;

export const useAISequenceStep2 = () => {
  // get the Form Values from the Store
  const formValues = useSequenceFormValuesStore();
  const { setFormValues } = usePagesAssistantActions();

  const navigate = useNavigate();
  const params = useParams();

  const defaultValues: AISequenceStep2FormValues = {
    sequenceType: formValues.sequenceType,
    sequenceContentProgram: formValues.sequenceContentProgram,
    sequenceContentTheme: formValues.sequenceContentTheme,
    seancesCount: formValues.seancesCount,
    seancesDuration: formValues.seancesDuration,
    objectives: formValues.objectives,
    previousKnowledge: formValues.previousKnowledge,
    accroche: formValues.accroche,
    difficulties: formValues.difficulties,
    inclusion: formValues.inclusion,
  };

  // submit function called by react hook form:
  // - add values to store
  // - navigate to wiki generation
  const onSubmit = async (step2FormValues: AISequenceStep2FormValues) => {
    console.log('step2FormValues', step2FormValues);
    setFormValues({ ...formValues, ...step2FormValues });
    navigate(
      `/id/${params.wikiId}/pages/assistant/ai/creation/sequence/generate`,
    );
  };

  const handlePreviousClick = () => {
    navigate(`/id/${params.wikiId}/pages/assistant/ai/creation/sequence/step1`);
  };

  return {
    defaultValues,
    handlePreviousClick,
    onSubmit,
  };
};
