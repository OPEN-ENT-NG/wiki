import { useFormContext } from 'react-hook-form';

export interface AccrocheFormValues {
  accroche: string;
}

export const useAIFormAccroche = () => {
  const { register } = useFormContext<AccrocheFormValues>();

  return {
    register,
  };
};
