import { Flex, Grid, useEdificeClient } from '@edifice.io/react';
import { ChangeEvent } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import SimpleRadioCard from '~/components/SimpleRadioCard/SimpleRadioCard';
import { AIPlanStep1FormValues } from '~/features/wiki/PagesAssistant/AI/AssistedCreation/Plan/Steps/Step1/useAIPlanStep1';
import {
  useFormValuesStore,
  usePagesAssistantActions,
} from '~/store/assistant';

const AIFormSchoolType = () => {
  const { control } = useFormContext<AIPlanStep1FormValues>();
  const formValues = useFormValuesStore();
  const { setFormValues } = usePagesAssistantActions();

  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  const schoolTypes = [
    'Collège',
    'Lycée général et techno.',
    'Lycée professionnel',
    'Lycée agricole',
  ];

  const handleSchoolTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      schoolType: event.target.value,
    });
  };

  return (
    <div className="ai-form-school-type">
      <h3 className="ai-form-school-type__title">
        {t('wiki.assistant.ai.step1.schoolType', { ns: appCode })}
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
