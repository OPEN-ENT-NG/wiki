import { Dropdown, useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import AIFormFieldLayout from '../AIFormFieldLayout/AIFormFieldLayout';
import { Controller } from 'react-hook-form';
import { useAIFormJobFamily } from './useAIFormJobFamily';

export const AIFormJobFamily = () => {
  const { control, jobFamilies, handleJobFamilyChange } = useAIFormJobFamily();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <AIFormFieldLayout
      title={t('wiki.assistant.ai.form.jobFamily.title', 'Famille de métiers')}
    >
      <Controller
        name="jobFamily"
        control={control}
        rules={{ required: true }}
        render={({ field: { value, onChange } }) => (
          <Dropdown block data-testid="ai-form-jobFamily-dropdown">
            <Dropdown.Trigger
              size="md"
              label={
                value ||
                t(
                  'wiki.assistant.ai.form.jobFamily.dropdown',
                  '-- Choisir une famille de métiers --',
                )
              }
            />
            <Dropdown.Menu role="listbox">
              {jobFamilies.map((jobFamily) => (
                <Dropdown.Item
                  key={jobFamily}
                  type="action"
                  onClick={() => {
                    onChange(jobFamily);
                    handleJobFamilyChange(jobFamily);
                  }}
                >
                  {jobFamily}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        )}
      />
    </AIFormFieldLayout>
  );
};

export default AIFormJobFamily;
