import { type ReactNode } from 'react';
import {
  FormProvider,
  type DefaultValues,
  type FieldValues,
} from 'react-hook-form';
import { Form } from 'react-router-dom';
import { useAIForm } from './useAIForm';

export interface AIFormProps<T extends FieldValues> {
  id: string;
  key: string;
  defaultValues: DefaultValues<T>;
  onSubmit: (formValues: T) => Promise<void>;
  children: ReactNode;
}

const AIForm = <T extends FieldValues>({
  id,
  defaultValues,
  onSubmit,
  children,
}: AIFormProps<T>) => {
  const formMethods = useAIForm<T>({ defaultValues });

  return (
    <FormProvider {...formMethods}>
      <Form id={id} role="form" onSubmit={formMethods.handleSubmit(onSubmit)}>
        {children}
      </Form>
    </FormProvider>
  );
};

export default AIForm;
