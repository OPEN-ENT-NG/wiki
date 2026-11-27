import { ChangeEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  useSequenceFormValuesStore,
  usePagesAssistantActions,
} from '~/store/assistant/sequence/sequenceStore';

export interface SubjectFormValues {
  subject: string;
}

export const useAIFormSubject = () => {
  const { control } = useFormContext<SubjectFormValues>();
  const formValues = useSequenceFormValuesStore();
  const { setFormValues } = usePagesAssistantActions();

  // TODO Dynamic values
  const subjects = ['Maths', 'Français', 'SVT', 'Physique-chimie'];

  const handleSubjectChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      subject: event.target.value,
    });
  };

  const handleSubjectSuggestionClick = () => {
    window.open(
      'https://survey.edifice.io/index.php/679298?newtest=Y&lang=fr',
      '_blank',
    );
  };

  return {
    control,
    subjects,
    handleSubjectChange,
    handleSubjectSuggestionClick,
  };
};
