import { FormControl, TextArea, useEdificeClient } from '@edifice.io/react';
import AIFormFieldLayout from '../../AIFormFieldLayout/AIFormFieldLayout';
import { MAX_AI_OPTIONAL_FIELDS_LENGTH } from '~/config';
import { useFormContext } from 'react-hook-form';
import { AccrocheFormValues } from './useAIFormAccroche';
import { useTranslation } from 'react-i18next';

const AIFormAccroche = () => {
  const { register } = useFormContext<AccrocheFormValues>();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <AIFormFieldLayout
      number={4}
      title={t(
        'wiki.assistant.ai.form.accroche.title',
        'Accroche de la séquence',
      )}
      description={t(
        'wiki.assistant.ai.form.accroche.description',
        'L\'accroche initiale : la "situation" qui éveille l\'intérêt des élèves, qui aide à déclencher leur mise en action et leur participation.',
      )}
    >
      <FormControl id="ai-form-accroche" isOptional>
        <TextArea
          data-testid="ai-form-accroche-textarea"
          placeholder={t(
            'wiki.assistant.ai.form.accroche.textarea.placeholder',
            "Ex. : Partir d'une photo de jumeaux et demander pourquoi ils se ressemblent",
          )}
          size="md"
          maxLength={MAX_AI_OPTIONAL_FIELDS_LENGTH}
          {...register('accroche', {
            required: false,
            maxLength: MAX_AI_OPTIONAL_FIELDS_LENGTH,
          })}
          showCounter
        />
      </FormControl>
    </AIFormFieldLayout>
  );
};

export default AIFormAccroche;
