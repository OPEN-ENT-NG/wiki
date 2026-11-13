import { useFormContext } from 'react-hook-form';

export interface InclusionFormValues {
  inclusion: string;
}

export const useAIFormInclusion = () => {
  const { register } = useFormContext<InclusionFormValues>();

  return {
    register,
  };
};
