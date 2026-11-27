import { useNavigate, useParams } from 'react-router-dom';
import { LevelFormValues } from '~/components/AI/AIForm/AIFormLevel/useAIFormLevel';
import { SchoolTypeFormValues } from '~/components/AI/AIForm/AIFormSchoolType/useAIFormSchoolType';
import { SubjectFormValues } from '~/components/AI/AIForm/AIFormSubject/useAIFormSubject';
import {
  usePagesAssistantActions,
  useSequenceFormValuesStore,
} from '~/store/assistant/sequence/sequenceStore';

export type AISequenceStep1FormValues = SchoolTypeFormValues &
  LevelFormValues &
  SubjectFormValues;

export const useAISequenceStep1 = () => {
  // get the Form Values from the Store
  const formValues = useSequenceFormValuesStore();
  const { setFormValues } = usePagesAssistantActions();

  const navigate = useNavigate();
  const params = useParams();

  // form defaultValues (from the FormValues store or initialized)
  const defaultValues: AISequenceStep1FormValues = {
    schoolType: formValues.schoolType,
    level: formValues.level,
    subject: formValues.subject,
  };

  // submit function called by react hook form
  // - add form values to FormValues Store
  // - navigate to step 2
  const onSubmit = async (step1FormValues: AISequenceStep1FormValues) => {
    console.log('step1FormValues', step1FormValues);
    setFormValues({ ...formValues, ...step1FormValues });
    navigate(`/id/${params.wikiId}/pages/assistant/ai/creation/sequence/step2`);
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
