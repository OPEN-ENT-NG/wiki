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
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router-dom';
import SimpleRadioCard from '~/components/SimpleRadioCard/SimpleRadioCard';
import { useAIFormStep1 } from './useAIFormStep1';

export const AIFormStep1 = () => {
  const {
    subjects,
    collegeLevels,
    lyceeLevels,
    control,
    isValid,
    handleLevelChange,
    handleSubjectSuggestionClick,
    handleBackButtonClick,
    handleSubmit,
    onSubmit,
  } = useAIFormStep1();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();

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
                        {collegeLevels.map((level) => (
                          <Controller
                            key={level.value}
                            name="level"
                            control={control}
                            rules={{ required: true }}
                            render={({ field: { value, onChange } }) => (
                              <SimpleRadioCard
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
                        {lyceeLevels.map((level) => (
                          <Controller
                            key={level.value}
                            name="level"
                            control={control}
                            rules={{ required: true }}
                            render={({ field: { value, onChange } }) => (
                              <SimpleRadioCard
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
                    {subjects.map((subject) => (
                      <Grid.Col key={subject.value} sm="2" md="4" lg="4" xl="4">
                        <Controller
                          name="subject"
                          control={control}
                          rules={{ required: true }}
                          render={({ field: { value, onChange } }) => (
                            <SimpleRadioCard
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
