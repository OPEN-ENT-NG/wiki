import { ChangeEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  useFormValuesStore,
  usePagesAssistantActions,
} from '~/store/assistant';

export interface SubjectFormValues {
  subject: string;
}

export const useAIFormSubject = () => {
  const { control } = useFormContext<SubjectFormValues>();
  const formValues = useFormValuesStore();
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
