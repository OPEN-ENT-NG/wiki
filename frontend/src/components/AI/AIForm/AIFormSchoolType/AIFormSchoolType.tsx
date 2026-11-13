import { Flex, Grid, useEdificeClient } from '@edifice.io/react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import SimpleRadioCard from '~/components/SimpleRadioCard/SimpleRadioCard';
import { useAIFormSchoolType } from './useAIFormSchoolType';

const AIFormSchoolType = () => {
  const { control, schoolTypes, handleSchoolTypeChange } =
    useAIFormSchoolType();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <div className="ai-form-school-type">
      <h3 className="ai-form-school-type__title">
        {t('wiki.assistant.ai.step1.schoolType')}
      </h3>
      <Grid className="ai-form-school-type__radios gap-8">
        <Grid.Col sm="8" md="8" lg="8" xl="12">
          <Flex gap="8">
            {schoolTypes.map((schoolType) => (
              <Controller
                key={schoolType}
                name="schoolType"
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <SimpleRadioCard
                    label={schoolType}
                    value={schoolType}
                    groupName="schoolType"
                    selectedValue={value}
                    onChange={(v) => {
                      onChange(v);
                      handleSchoolTypeChange(v);
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

export default AIFormSchoolType;
