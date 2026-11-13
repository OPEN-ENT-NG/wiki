import { Flex, useEdificeClient } from '@edifice.io/react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import SimpleRadioCard from '~/components/SimpleRadioCard/SimpleRadioCard';
import { useAIFormLevel } from './useAIFormLevel';
import './AIFormLevel.css';

const AIFormLevel = () => {
  const { control, levels, handleLevelChange } = useAIFormLevel();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <div className="ai-form-level">
      <h3 className="ai-form-level__title">
        {t('wiki.assistant.ai.step1.level', { ns: appCode })}
      </h3>
      <Flex gap="8">
        {levels.map((level) => (
          <Controller
            key={level}
            name="level"
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <SimpleRadioCard
                label={level}
                value={level}
                groupName="level"
                selectedValue={value}
                onChange={(v) => {
                  onChange(v);
                  handleLevelChange(v);
                }}
              />
            )}
          />
        ))}
      </Flex>
    </div>
  );
};

export default AIFormLevel;
