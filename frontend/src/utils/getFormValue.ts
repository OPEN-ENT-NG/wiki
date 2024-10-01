export const getFormValue = (formData: FormData, key: string) =>
  formData.get(key) as string;
