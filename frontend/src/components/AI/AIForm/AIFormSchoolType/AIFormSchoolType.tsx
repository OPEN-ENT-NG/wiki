import { Flex, useEdificeClient } from '@edifice.io/react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import SimpleRadioCard from '~/components/SimpleRadioCard/SimpleRadioCard';
import { useAIFormSchoolType } from './useAIFormSchoolType';
import './AIFormSchoolType.css';

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
    </div>
  );
};

export default AIFormSchoolType;
