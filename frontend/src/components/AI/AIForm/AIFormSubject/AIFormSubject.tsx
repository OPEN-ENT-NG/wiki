import { Button, Flex, useEdificeClient } from '@edifice.io/react';
import { useAIFormSubject } from './useAIFormSubject';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import SimpleRadioCard from '~/components/SimpleRadioCard/SimpleRadioCard';
import { IconQuestion } from '@edifice.io/react/icons';
import './AIFormSubject.css';

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

      {/* Subject suggestion "card" button */}
      <Flex>
        <Button
          variant="outline"
          color="tertiary"
          leftIcon={<IconQuestion />}
          onClick={handleSubjectSuggestionClick}
          className="border-gray-400 mt-12"
          style={{ height: '65px' }}
        >
          {t('wiki.assistant.ai.step1.subject.suggestion', {
            ns: appCode,
          })}
        </Button>
      </Flex>
    </div>
  );
};

export default AIFormSubject;
