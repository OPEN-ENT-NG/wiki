import {
  Button,
  Flex,
  FormControl,
  Input,
  Label,
  Stepper,
  useEdificeClient,
} from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import { PagesAssistantAIStep2FormValues } from '~/services/api/assistant/assistant.types';
import {
  useFormValuesStore,
  usePagesAssistantActions,
} from '~/store/assistant';
import { useForm } from 'react-hook-form';
import { IconRafterLeft, IconRafterRight } from '@edifice.io/react/icons';
import { Form, useNavigate, useParams } from 'react-router-dom';

export const PagesAssistantAIStep2Form = () => {
  const formValues = useFormValuesStore();
  const { setFormValues } = usePagesAssistantActions();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();

  const defaultValues: PagesAssistantAIStep2FormValues = {
    keywords: formValues.keywords || '',
  };

  const {
    watch,
    handleSubmit,
    register,
    formState: { isValid },
  } = useForm<PagesAssistantAIStep2FormValues>({
    defaultValues,
  });

  const onSubmit = async (step2FormValues: PagesAssistantAIStep2FormValues) => {
    // Add values to store
    setFormValues({ ...formValues, ...step2FormValues });
    // Navigate to pages structure loading step
    navigate(`/id/${params.wikiId}/pages/assistant/ai/step3StructureLoading`);
  };

  const handleBackButtonClick = () => {
    const keywords = watch('keywords');
    console.log('keywords', keywords);

    setFormValues({ ...formValues, keywords });
    navigate(`/id/${params.wikiId}/pages/assistant/ai/step1Form`);
  };

  return (
    <div className="pages-assistant-ai-wrapper mx-64 my-24">
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
              {t('wiki.assistant.ai.step2.keywords.legend', { ns: appCode })}
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
  );
};
