import {
  Button,
  Flex,
  Select,
  Stepper,
  useEdificeClient,
} from '@edifice.io/react';
import { IconRafterLeft, IconRafterRight } from '@edifice.io/react/icons';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Form, useNavigate, useParams } from 'react-router-dom';
import { usePagesAssistantAI } from './usePagesAssistantAI';
import {
  useFormValuesStore,
  usePagesAssistantActions,
} from '~/store/assistant';
import { PagesAssistantAIStep1FormValues as PagesAssistantAIStep1FormValues } from '~/services/api/assistant/assistant.types';

export const PagesAssistantAIStep1Form = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();

  const { levelsData } = usePagesAssistantAI();
  const formValues = useFormValuesStore();
  const { setFormValues } = usePagesAssistantActions();

  const defaultValues: PagesAssistantAIStep1FormValues = {
    level: formValues.level || '',
    subject: formValues.subject || '',
    sequence: formValues.sequence || '',
  };

  const {
    watch,
    handleSubmit,
    setValue,
    control,
    formState: { isValid },
  } = useForm<PagesAssistantAIStep1FormValues>({
    defaultValues,
  });

  const selectedLevel = watch('level');
  const selectedSubject = watch('subject');

  const availableSubjects =
    levelsData.find((lvl) => lvl.value === selectedLevel)?.subjects ?? [];

  const availableSequences =
    availableSubjects.find((subj) => subj.value === selectedSubject)
      ?.sequences ?? [];

  const onSubmit = async (step1FormValues: PagesAssistantAIStep1FormValues) => {
    console.log('Form Data:', step1FormValues);
    // TODO: add values to local storage
    // Add values to store
    setFormValues(step1FormValues);
    // navigate to next step
    navigate(`/id/${params.wikiId}/pages/assistant/ai/step2Form`);
  };

  const handleLevelChange = () => {
    // Reset subject, sequence and keywords when level changes
    setValue('subject', '');
    setValue('sequence', '');
  };

  const handleSubjectChange = () => {
    // Reset sequence when subject changes
    setValue('sequence', '');
  };

  const handleBackButtonClick = () => {
    navigate(`/id/${params.wikiId}/pages/assistant`);
  };

  return (
    <div className="pages-assistant-ai-wrapper mx-64 my-24">
      <div>
        <Stepper currentStep={0} nbSteps={3} />
        <h2 className="mt-16">
          {t('wiki.assistant.ai.step1.title', { ns: appCode })}
        </h2>
        <p className="text-gray-700">
          {t('wiki.assistant.ai.step1.description', { ns: appCode })}
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
                {t('wiki.assistant.ai.step1.level', { ns: appCode })}
              </h3>
              <Controller
                name="level"
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <Select
                    data-testid="wiki.assistant.ai.step1.select.level"
                    size="md"
                    selectedValue={value}
                    onValueChange={(v) => {
                      onChange(v);
                      handleLevelChange();
                    }}
                    options={levelsData.map((level) => level.value)}
                    placeholderOption={t(
                      'wiki.assistant.ai.step1.select.level',
                      {
                        ns: appCode,
                      },
                    )}
                  />
                )}
              />
            </div>

            <div>
              <h3 className="mb-12">
                {t('wiki.assistant.ai.step1.subject', { ns: appCode })}
              </h3>
              <Controller
                name="subject"
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <Select
                    data-testid="wiki.assistant.ai.step1.select.subject"
                    size="md"
                    selectedValue={value}
                    onValueChange={(v) => {
                      onChange(v);
                      handleSubjectChange();
                    }}
                    options={availableSubjects.map(
                      (availableSubject) => availableSubject.value,
                    )}
                    placeholderOption={t(
                      'wiki.assistant.ai.step1.select.subject',
                      {
                        ns: appCode,
                      },
                    )}
                    disabled={watch('level')?.length === 0}
                  />
                )}
              />
            </div>

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
                    disabled={watch('subject')?.length === 0}
                  />
                )}
              />
            </div>
          </Flex>

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
