import {
  Button,
  Flex,
  Grid,
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
import { useLevels } from './useLevels';
import {
  useFormValuesStore,
  usePagesAssistantActions,
} from '~/store/assistant';
import { PagesAssistantAIStep1FormValues as PagesAssistantAIStep1FormValues } from '~/services/api/assistant/assistant.types';
import SimpleRadioCard from '~/components/SimpleRadioCard/SimpleRadioCard';
import { useSubjects } from './useSubjects';

export const PagesAssistantAIStep1Form = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();

  const { collegeLevels, lyceeLevels } = useLevels();
  const formValues = useFormValuesStore();
  const { setFormValues } = usePagesAssistantActions();

  const {
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { isValid },
  } = useForm<PagesAssistantAIStep1FormValues>({
    defaultValues: {
      level: formValues.level || '6ème',
      subject: formValues.subject || '',
    },
  });

  const selectedLevel = watch('level');

  const { subjects } = useSubjects(selectedLevel);

  const onSubmit = async (step1FormValues: PagesAssistantAIStep1FormValues) => {
    // Add values to store
    setFormValues({ ...formValues, ...step1FormValues });
    // Navigate to next step
    navigate(`/id/${params.wikiId}/pages/assistant/ai/step2Form`);
  };

  const handleLevelChange = () => {
    // Reset subject, sequence when level changes
    setValue('subject', '');
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
    <Flex justify="center">
      <div className="col-12 col-md-10 col-lg-8">
        <div className="pages-assistant-ai-wrapper my-24">
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
                {/* LEVELS */}
                <div>
                  <h3 className="mb-12">
                    {t('wiki.assistant.ai.step1.level', { ns: appCode })}
                  </h3>
                  <Grid className="gap-8">
                    {/* COLLEGE LEVELS */}
                    <Grid.Col sm="5" md="5" lg="5" xl="7">
                      <p className="fw-bold pb-8">
                        {t('wiki.assistant.ai.step1.level.college', {
                          ns: appCode,
                        })}
                      </p>
                      <Flex gap="8">
                        {collegeLevels.map((level, index) => (
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
                    </Grid.Col>

                    {/* LYCEE LEVELS */}
                    <Grid.Col sm="3" md="3" lg="3" xl="5">
                      <p className="fw-bold pb-8">
                        {t('wiki.assistant.ai.step1.level.lycee', {
                          ns: appCode,
                        })}
                      </p>
                      <Flex gap="8">
                        {lyceeLevels.map((level, index) => (
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
                    </Grid.Col>
                  </Grid>
                </div>

                {/* SUBJECTS */}
                <div>
                  <h3 className="mb-12">
                    {t('wiki.assistant.ai.step1.subject', { ns: appCode })}
                  </h3>
                  <Grid className="gap-12">
                    {subjects.map((subject, index) => (
                      <Grid.Col sm="2" md="4" lg="4" xl="4">
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
                              }}
                            />
                          )}
                        />
                      </Grid.Col>
                    ))}
                  </Grid>

                  {/* Subject suggestion "card" button */}
                  <Grid className="gap-12">
                    <Grid.Col sm="2" md="4" lg="4" xl="4">
                      <Button
                        variant="outline"
                        color="tertiary"
                        leftIcon={<IconQuestion />}
                        onClick={handleSubjectSuggestionClick}
                        className="d-flex justify-content-start border-gray-400 mt-12 w-100"
                        style={{ height: '65px' }}
                      >
                        {t('wiki.assistant.ai.step1.subject.suggestion', {
                          ns: appCode,
                        })}
                      </Button>
                    </Grid.Col>
                  </Grid>
                </div>
              </Flex>

              <div>
                <Flex className="mt-24" justify="end">
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
