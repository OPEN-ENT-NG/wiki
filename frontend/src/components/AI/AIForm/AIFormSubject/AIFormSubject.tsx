import { Button, Flex, Grid, useEdificeClient } from '@edifice.io/react';
import { useAIFormSubject } from './useAIFormSubject';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import SimpleRadioCard from '~/components/SimpleRadioCard/SimpleRadioCard';
import { IconQuestion } from '@edifice.io/react/icons';

const AIFormSubject = () => {
  const {
    control,
    subjects,
    handleSubjectChange,
    handleSubjectSuggestionClick,
  } = useAIFormSubject();

  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <div className="ai-form-subject">
      <h3 className="ai-form-subject__title">
        {t('wiki.assistant.ai.step1.subject', { ns: appCode })}
      </h3>
      <Grid className="ai-form-subject__radios gap-8">
        <Grid.Col sm="8" md="8" lg="8" xl="12">
          <Flex gap="8">
            {subjects.map((subject) => (
              <Controller
                key={subject}
                name="subject"
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <SimpleRadioCard
                    label={subject}
                    value={subject}
                    // TODO image={}
                    groupName="subject"
                    selectedValue={value}
                    onChange={(v) => {
                      onChange(v);
                      handleSubjectChange(v);
                    }}
                  />
                )}
              />
            ))}
          </Flex>
        </Grid.Col>
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
  );
};

export default AIFormSubject;
