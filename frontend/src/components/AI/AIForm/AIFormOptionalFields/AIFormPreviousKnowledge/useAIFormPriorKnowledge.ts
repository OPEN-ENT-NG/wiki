import { useFormContext } from 'react-hook-form';

export interface PriorKnowledgeFormValues {
  priorKnowledge: string;
}

export const useAIFormPriorKnowledge = () => {
  const { register } = useFormContext<PriorKnowledgeFormValues>();

  return {
    register,
  };
};
