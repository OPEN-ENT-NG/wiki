import { useForm, type DefaultValues, type FieldValues } from 'react-hook-form';

export const useAIForm = <T extends FieldValues>({
  defaultValues,
}: {
  defaultValues: DefaultValues<T>;
}) => {
  return useForm<T>({
    defaultValues,
  });
};
