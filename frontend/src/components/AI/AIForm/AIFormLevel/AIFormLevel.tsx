import { Flex, Grid, useEdificeClient } from '@edifice.io/react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import SimpleRadioCard from '~/components/SimpleRadioCard/SimpleRadioCard';
import { useAIFormLevel } from './useAIFormLevel';

const AIFormLevel = () => {
  const { control, levels, handleLevelChange } = useAIFormLevel();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <div className="ai-form-level">
      <h3 className="ai-form-level__title">
        {t('wiki.assistant.ai.step1.level', { ns: appCode })}
      </h3>
      <Grid className="ai-form-level__radios gap-8">
        <Grid.Col sm="8" md="8" lg="8" xl="12">
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
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default AIFormLevel;
