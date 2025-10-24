import {
  Button,
  Flex,
  FormControl,
  Input,
  Label,
  Select,
  useEdificeClient,
} from '@edifice.io/react';
import { IconRafterLeft, IconRafterRight } from '@edifice.io/react/icons';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Form, useNavigate, useParams } from 'react-router-dom';

export interface PagesAssistantAIFormData {
  level: string;
  subject: string;
  sequence: string;
  keywords: string;
}

export const PagesAssistantAI = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();

  const levels = ['6ème', '5ème', '4ème', '3ème'];
  const subjects = ['Histoire', 'SVT', 'Technologie'];
  const sequences = [
    'La simulation numérique : tester avant de construire',
    'Séquence 2',
    'Séquence 3',
  ];

  const defaultValues: PagesAssistantAIFormData = {
    level: '6ème',
    subject: 'Histoire',
    sequence: sequences[0],
    keywords: '',
  };

  const {
    watch,
    register,
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm<PagesAssistantAIFormData>({
    defaultValues,
  });

  const onSubmit = async (data: PagesAssistantAIFormData) => {
    console.log('Form Data:', data);
    navigate(`/id/${params.wikiId}/pages/assistant/ai/structureLoading`);
  };

  const handleBackButtonClick = () => {
    navigate(`/id/${params.wikiId}/pages/assistant`);
  };

  return (
    <div className="pages-assistant-ai-wrapper mx-32 my-24">
      <div>
        <h2>{t('wiki.assistant.ai.title', { ns: appCode })}</h2>
        <p className="text-gray-700">
          {t('wiki.assistant.ai.description', { ns: appCode })}
        </p>
      </div>

      <div className="mt-24">
        <Form
          id="wikiAIForm"
          key="wikiAIForm"
          role="form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <h3 className="mb-12">
              {t('wiki.assistant.ai.level', { ns: appCode })}
            </h3>
            <Controller
              name="level"
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Select
                  data-testid="wiki.assistant.ai.select.level"
                  size="md"
                  value={value}
                  onValueChange={(v) => {
                    onChange(v);
                  }}
                  options={levels}
                  placeholderOption={t('wiki.assistant.ai.select.level', {
                    ns: appCode,
                  })}
                />
              )}
            />
          </div>

          <div className="mt-24">
            <h3 className="mb-12">
              {t('wiki.assistant.ai.subject', { ns: appCode })}
            </h3>
            <Controller
              name="subject"
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Select
                  data-testid="wiki.assistant.ai.select.subject"
                  size="md"
                  value={value}
                  onValueChange={(v) => {
                    onChange(v);
                  }}
                  options={subjects}
                  placeholderOption={t('wiki.assistant.ai.select.subject', {
                    ns: appCode,
                  })}
                />
              )}
            />
          </div>

          <div className="mt-24">
            <h3 className="mb-12">
              {t('wiki.assistant.ai.sequence', { ns: appCode })}
            </h3>
            <Controller
              name="sequence"
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Select
                  data-testid="wiki.assistant.ai.select.sequence"
                  size="md"
                  value={value}
                  onValueChange={(v) => {
                    onChange(v);
                  }}
                  options={sequences}
                  placeholderOption={t('wiki.assistant.ai.select.sequence', {
                    ns: appCode,
                  })}
                />
              )}
            />
          </div>

          <div className="mt-24">
            <h3 className="mb-12">
              {t('wiki.assistant.ai.keywords', { ns: appCode })}
            </h3>
            <FormControl id="keywords" className="mb-24">
              <Flex justify="between">
                <Label>
                  {t('wiki.assistant.ai.keywords.input.label', { ns: appCode })}
                </Label>
                <p className="small text-gray-700 p-2">
                  {`${watch('keywords', '').length || 0} / 80`}
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
                placeholder={t('wiki.assistant.ai.keywords.input.placeholder', {
                  ns: appCode,
                })}
              />
            </FormControl>
          </div>

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
