import { useFormContext } from 'react-hook-form';

export interface DifficultiesFormValues {
  difficulties: string;
}

export const useAIFormDifficulties = () => {
  const { register } = useFormContext<DifficultiesFormValues>();

  return {
    register,
  };
};
