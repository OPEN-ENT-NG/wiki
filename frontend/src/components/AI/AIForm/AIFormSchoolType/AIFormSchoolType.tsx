import { Flex, useEdificeClient } from '@edifice.io/react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import SimpleRadioCard from '~/components/SimpleRadioCard/SimpleRadioCard';
import { useAIFormSchoolType } from './useAIFormSchoolType';
import AIFormFieldLayout from '../AIFormFieldLayout/AIFormFieldLayout';

const AIFormSchoolType = () => {
  const { control, schoolTypes, handleSchoolTypeChange } =
    useAIFormSchoolType();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <AIFormFieldLayout
      title={t('wiki.assistant.ai.step1.schoolType', "Type d'établissement")}
    >
      <Flex gap="8">
        {schoolTypes.map((schoolType) => (
          <Controller
            key={schoolType.value}
            name="schoolType"
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <SimpleRadioCard
                label={schoolType.label}
                value={schoolType.value}
                groupName="schoolType"
                selectedValue={value}
                onChange={() => {
                  onChange(schoolType.value);
                  handleSchoolTypeChange(schoolType.value);
                }}
              />
            )}
          />
        ))}
      </Flex>
    </AIFormFieldLayout>
  );
};

export default AIFormSchoolType;
