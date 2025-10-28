import {
  Button,
  Flex,
  FormControl,
  Grid,
  Input,
  Label,
  Select,
  useEdificeClient,
} from '@edifice.io/react';
import { IconRafterLeft, IconRafterRight } from '@edifice.io/react/icons';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Form, useNavigate, useParams } from 'react-router-dom';
import { usePagesAssistantAI } from './usePagesAssistantAI';
import { usePagesAssistantActions } from '~/store/assistant';
import { PagesAssistantAIFormValues } from '~/services/api/assistant/assistant.types';

export const PagesAssistantAIForm = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();

  const { levelsData } = usePagesAssistantAI();
  const { setFormValues } = usePagesAssistantActions();

  const defaultValues: PagesAssistantAIFormValues = {
    level: '',
    subject: '',
    sequence: '',
    keywords: '',
  };

  const {
    watch,
    register,
    handleSubmit,
    setValue,
    control,
    formState: { isValid },
  } = useForm<PagesAssistantAIFormValues>({
    defaultValues,
  });

  const selectedLevel = watch('level');
  const selectedSubject = watch('subject');

  const availableSubjects =
    levelsData.find((lvl) => lvl.value === selectedLevel)?.subjects ?? [];

  const availableSequences =
    availableSubjects.find((subj) => subj.value === selectedSubject)
      ?.sequences ?? [];

  const onSubmit = async (data: PagesAssistantAIFormValues) => {
    console.log('Form Data:', data);
    setFormValues(data);
    navigate(`/id/${params.wikiId}/pages/assistant/ai/structureLoading`);
  };

  const handleLevelChange = () => {
    // Reset subject, sequence and keywords when level changes
    setValue('subject', '');
    setValue('sequence', '');
    setValue('keywords', '');
  };

  const handleSubjectChange = () => {
    // Reset sequence and keywords when subject changes
    setValue('sequence', '');
    setValue('keywords', '');
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
          <Flex direction="column" gap="24">
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
                    selectedValue={value}
                    onValueChange={(v) => {
                      onChange(v);
                      handleLevelChange();
                    }}
                    options={levelsData.map((level) => level.value)}
                    placeholderOption={t('wiki.assistant.ai.select.level', {
                      ns: appCode,
                    })}
                  />
                )}
              />
            </div>

            <div>
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
                    selectedValue={value}
                    onValueChange={(v) => {
                      onChange(v);
                      handleSubjectChange();
                    }}
                    options={availableSubjects.map(
                      (availableSubject) => availableSubject.value,
                    )}
                    placeholderOption={t('wiki.assistant.ai.select.subject', {
                      ns: appCode,
                    })}
                    disabled={watch('level')?.length === 0}
                  />
                )}
              />
            </div>

            <div>
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
                    selectedValue={value}
                    onValueChange={(v) => {
                      onChange(v);
                    }}
                    options={availableSequences}
                    placeholderOption={t('wiki.assistant.ai.select.sequence', {
                      ns: appCode,
                    })}
                    disabled={watch('subject')?.length === 0}
                  />
                )}
              />
            </div>
          </Flex>

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
                placeholder={t('wiki.assistant.ai.keywords.input.placeholder', {
                  ns: appCode,
                })}
                disabled={watch('sequence')?.length === 0}
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
