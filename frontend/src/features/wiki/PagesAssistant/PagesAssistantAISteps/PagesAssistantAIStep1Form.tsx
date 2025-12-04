import {
  Button,
  Flex,
  Select,
  Stepper,
  useEdificeClient,
} from '@edifice.io/react';
import {
  IconQuestion,
  IconRafterLeft,
  IconRafterRight,
} from '@edifice.io/react/icons';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Form, useNavigate, useParams } from 'react-router-dom';
import { usePagesAssistantAI } from './usePagesAssistantAI';
import {
  useFormValuesStore,
  usePagesAssistantActions,
} from '~/store/assistant';
import { PagesAssistantAIStep1FormValues as PagesAssistantAIStep1FormValues } from '~/services/api/assistant/assistant.types';
import SimpleRadioCard from '~/components/SimpleRadioCard/SimpleRadioCard';

export const PagesAssistantAIStep1Form = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();

  const { levelsData } = usePagesAssistantAI();
  const formValues = useFormValuesStore();
  const { setFormValues } = usePagesAssistantActions();

  const defaultValues: PagesAssistantAIStep1FormValues = {
    level: formValues.level || '5ème',
    subject: formValues.subject || '',
    sequence: formValues.sequence || '',
  };

  const {
    handleSubmit,
    setValue,
    watch,
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
    // Add values to store
    setFormValues({ ...formValues, ...step1FormValues });
    // Navigate to next step
    navigate(`/id/${params.wikiId}/pages/assistant/ai/step2Form`);
  };

  const handleLevelChange = () => {
    // Reset subject, sequence when level changes
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

  const handleSubjectSuggestionClick = () => {
    window.open(
      'https://survey.edifice.io/index.php/679298?newtest=Y&lang=fr',
      '_blank',
    );
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
            {/* LEVEL */}
            <div>
              <h3 className="mb-12">
                {t('wiki.assistant.ai.step1.level', { ns: appCode })}
              </h3>
              {/* TODO: Improve layout of level radio cards */}
              <Flex direction="row">
                <span className="fw-bold pb-8" style={{ width: '385px' }}>
                  Collège
                </span>
                <span className="fw-bold pb-8">Lycée</span>
              </Flex>
              <Flex gap="8">
                {levelsData.map((level, index) => (
                  <Controller
                    key={index}
                    name="level"
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <SimpleRadioCard
                        key={index}
                        label={level.value}
                        value={level.value}
                        groupName="levels"
                        selectedValue={value}
                        onChange={(v) => {
                          onChange(v);
                          handleLevelChange();
                        }}
                      />
                    )}
                  />
                ))}
              </Flex>
            </div>

            {/* SUBJECT */}
            <div>
              <h3 className="mb-12">
                {t('wiki.assistant.ai.step1.subject', { ns: appCode })}
              </h3>
              <Flex gap="8" align="center">
                {availableSubjects.map((subject, index) => (
                  <Controller
                    key={index}
                    name="subject"
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <SimpleRadioCard
                        key={index}
                        label={subject.value}
                        value={subject.value}
                        image={subject.image}
                        groupName="subjects"
                        selectedValue={value}
                        onChange={(v) => {
                          onChange(v);
                          handleSubjectChange();
                        }}
                      />
                    )}
                  />
                ))}
                <Button
                  variant="outline"
                  color="tertiary"
                  leftIcon={<IconQuestion />}
                  onClick={handleSubjectSuggestionClick}
                  className="border-gray-400"
                  style={{ height: '65px' }}
                >
                  {t('wiki.assistant.ai.step1.subject.suggestion', {
                    ns: appCode,
                  })}
                </Button>
              </Flex>
            </div>

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
                    disabled={selectedSubject.length === 0}
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
