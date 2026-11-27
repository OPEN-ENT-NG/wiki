import { FormControl, TextArea, useEdificeClient } from '@edifice.io/react';
import AIFormFieldLayout from '../../AIFormFieldLayout/AIFormFieldLayout';
import { useTranslation } from 'react-i18next';
import { useAIFormDifficulties } from './useAIFormDifficulties';
import { MAX_AI_OPTIONAL_FIELDS_LENGTH } from '~/config';

const AIFormDifficulties = () => {
  const { register } = useAIFormDifficulties();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <AIFormFieldLayout
      number={5}
      title={t(
        'wiki.assistant.ai.form.difficulties.title',
        'Difficultés fréquentes',
      )}
      description={t(
        'wiki.assistant.ai.form.difficulties.description',
        'Les points sur lesquels les élèves butent souvent.',
      )}
      withBorder={true}
    >
      <FormControl id="ai-form-difficulties" isOptional>
        <TextArea
          data-testid="ai-form-difficulties-textarea"
          placeholder={t(
            'wiki.assistant.ai.form.difficulties.textarea.placeholder',
            'Ex. : confusion fréquente entre mitose et méiose, difficulté à se représenter les chromosomes...',
          )}
          size="md"
          maxLength={MAX_AI_OPTIONAL_FIELDS_LENGTH}
          {...register('difficulties', {
            required: false,
            maxLength: MAX_AI_OPTIONAL_FIELDS_LENGTH,
          })}
          showCounter
        />
      </FormControl>
    </AIFormFieldLayout>
  );
};

export default AIFormDifficulties;
