import { FormControl, TextArea, useEdificeClient } from '@edifice.io/react';
import AIFormFieldLayout from '../../AIFormFieldLayout/AIFormFieldLayout';
import { useAIFormInclusion } from './useAIFormInclusion';
import { useTranslation } from 'react-i18next';
import { MAX_AI_OPTIONAL_FIELDS_LENGTH } from '~/config';

const AIFormInclusion = () => {
  const { register } = useAIFormInclusion();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <AIFormFieldLayout
      number={6}
      title={t(
        'wiki.assistant.ai.form.inclusion.title',
        'Inclusion et différenciation',
      )}
      description={t(
        'wiki.assistant.ai.form.inclusion.description',
        "Pour des suggestions d'adaptation intégrées au plan (formulation, variantes d'activité).",
      )}
    >
      <FormControl id="ai-form-inclusion" isOptional>
        <TextArea
          data-testid="ai-form-inclusion-textarea"
          placeholder={t(
            'wiki.assistant.ai.form.inclusion.textarea.placeholder',
            "Ex. : Élèves allophones, présence d'un AESH, écarts de niveau importants dans la classe...",
          )}
          size="md"
          maxLength={MAX_AI_OPTIONAL_FIELDS_LENGTH}
          {...register('inclusion', {
            required: false,
            maxLength: MAX_AI_OPTIONAL_FIELDS_LENGTH,
          })}
          showCounter
        />
      </FormControl>
    </AIFormFieldLayout>
  );
};

export default AIFormInclusion;
