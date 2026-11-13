import { useFormContext } from 'react-hook-form';

export interface PreviousKnowledgeFormValues {
  previousKnowledge: string;
}

export const useAIFormPreviousKnowledge = () => {
  const { register } = useFormContext<PreviousKnowledgeFormValues>();

  return {
    register,
  };
};
