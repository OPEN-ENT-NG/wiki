import { Flex, useEdificeClient } from '@edifice.io/react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import SimpleRadioCard from '~/components/SimpleRadioCard/SimpleRadioCard';
import { SchoolTypeValue, useAIFormSchoolType } from './useAIFormSchoolType';
import AIFormFieldLayout from '../AIFormFieldLayout/AIFormFieldLayout';

const AIFormSchoolType = ({ data }: { data: SchoolTypeValue[] }) => {
  const { control, handleSchoolTypeChange } = useAIFormSchoolType();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <AIFormFieldLayout
      title={t('wiki.assistant.ai.step1.schoolType', "Type d'établissement")}
    >
      <Flex gap="8">
        {data.map((schoolType) => (
          <Controller
            key={schoolType}
            name="schoolType"
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <SimpleRadioCard
                label={t(schoolType)}
                value={schoolType}
                groupName="schoolType"
                selectedValue={value}
                onChange={() => {
                  onChange(schoolType);
                  handleSchoolTypeChange(schoolType);
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
