import {
  Button,
  Flex,
  FormControl,
  Input,
  Label,
  Select,
  Stepper,
  useEdificeClient,
} from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import { PagesAssistantAIStep2FormValues } from '~/services/api/assistant/assistant.types';
import {
  useFormValuesStore,
  usePagesAssistantActions,
} from '~/store/assistant';
import { Controller, useForm } from 'react-hook-form';
import { IconRafterLeft, IconRafterRight } from '@edifice.io/react/icons';
import { Form, useNavigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useSubjects } from './useSubjects';

export const PagesAssistantAIStep2Form = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();

  const formValues = useFormValuesStore();
  const { subjects } = useSubjects(formValues.level);
  const { setFormValues } = usePagesAssistantActions();

  const {
    watch,
    handleSubmit,
    register,
    control,
    formState: { isValid },
  } = useForm<PagesAssistantAIStep2FormValues>({
    defaultValues: {
      sequence: formValues.sequence || '',
      keywords: formValues.keywords || '',
    },
  });

  const availableSequences =
    useMemo(
      () =>
        subjects.find((subj) => subj.value === formValues.subject)?.sequences ??
        [],
      [subjects, formValues.subject],
    ) || [];

  const onSubmit = async (step2FormValues: PagesAssistantAIStep2FormValues) => {
    // Add values to store
    setFormValues({ ...formValues, ...step2FormValues });
    // Navigate to pages structure loading step
    navigate(`/id/${params.wikiId}/pages/assistant/ai/step3StructureLoading`);
  };

  const handleBackButtonClick = () => {
    const keywords = watch('keywords');
    setFormValues({ ...formValues, keywords });
    navigate(`/id/${params.wikiId}/pages/assistant/ai/step1Form`);
  };

  return (
    <Flex justify="center">
      <div className="col-12 col-md-10 col-lg-8">
        <div className="pages-assistant-ai-wrapper my-24">
          <div>
            <Stepper currentStep={1} nbSteps={3} />
            <h2 className="mt-16">
              {t('wiki.assistant.ai.step2.title', { ns: appCode })}
            </h2>
            <p className="text-gray-700">
              {t('wiki.assistant.ai.step2.description', { ns: appCode })}
            </p>
          </div>
          <div className="mt-24">
            <Form
              id="wikiAIForm"
              key="wikiAIForm"
              role="form"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* SEQUENCE */}
              <div>
                <h3 className="mb-12">
                  {t('wiki.assistant.ai.step1.sequence', { ns: appCode })}
                </h3>
                <Controller
                  name="sequence"
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      data-testid="wiki.assistant.ai.step1.select.sequence"
                      size="md"
                      selectedValue={value}
                      onValueChange={(v) => {
                        onChange(v);
                      }}
                      options={availableSequences}
                      placeholderOption={t(
                        'wiki.assistant.ai.step1.select.sequence',
                        {
                          ns: appCode,
                        },
                      )}
                    />
                  )}
                />
              </div>
              <FormControl id="keywords" className="mb-24">
                <Flex justify="between">
                  <Label>
                    {t('wiki.assistant.ai.step2.keywords.input.label', {
                      ns: appCode,
                    })}{' '}
                    -{' '}
                    <span className="text-gray-700 fst-italic ">
                      {t('optional')}
                    </span>
                  </Label>
                  <p className="small text-gray-700 p-2">
                    {`${watch('keywords', '')?.length || 0} / 80`}
                  </p>
                </Flex>
                <Input
                  data-testid="communities-create-input-title"
                  type="text"
                  {...register('keywords', {
                    maxLength: 80,
                    pattern: {
                      value: /[^ ]/,
                      message: 'invalid title',
                    },
                  })}
                  size="md"
                  maxLength={80}
                  placeholder={t(
                    'wiki.assistant.ai.step2.keywords.input.placeholder',
                    {
                      ns: appCode,
                    },
                  )}
                />
                <div className="mt-4 text-gray-700 fst-italic small">
                  {t('wiki.assistant.ai.step2.keywords.legend', {
                    ns: appCode,
                  })}
                </div>
              </FormControl>
              <div>
                <Flex className="mt-auto" justify="end">
                  <Button
                    variant="ghost"
                    color="tertiary"
                    leftIcon={<IconRafterLeft />}
                    onClick={handleBackButtonClick}
                  >
                    {t('previous')}
                  </Button>
                  <Button
                    type="submit"
                    rightIcon={<IconRafterRight />}
                    disabled={!isValid}
                  >
                    {t('next')}
                  </Button>
                </Flex>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </Flex>
  );
};
