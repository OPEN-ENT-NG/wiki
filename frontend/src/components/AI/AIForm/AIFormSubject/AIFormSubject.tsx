import { Button, Flex, useEdificeClient } from '@edifice.io/react';
import { useAIFormSubject } from './useAIFormSubject';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import SimpleRadioCard from '~/components/SimpleRadioCard/SimpleRadioCard';
import { IconQuestion } from '@edifice.io/react/icons';
import AIFormFieldLayout from '../AIFormFieldLayout/AIFormFieldLayout';

const AIFormSubject = ({ data }: { data: string[] }) => {
  const { control, handleSubjectChange, handleSubjectSuggestionClick } =
    useAIFormSubject();

  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <AIFormFieldLayout
      title={t('wiki.assistant.ai.step1.subject', { ns: appCode })}
    >
      <Flex gap="8">
        {data.map((subject) => (
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
    </AIFormFieldLayout>
  );
};

export default AIFormSubject;
