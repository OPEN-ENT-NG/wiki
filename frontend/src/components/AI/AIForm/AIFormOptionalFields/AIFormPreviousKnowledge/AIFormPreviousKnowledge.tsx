import { FormControl, TextArea, useEdificeClient } from '@edifice.io/react';
import { MAX_AI_OPTIONAL_FIELDS_LENGTH } from '~/config';
import { useAIFormPreviousKnowledge } from './useAIFormPreviousKnowledge';
import { useTranslation } from 'react-i18next';
import AIFormFieldLayout from '../../AIFormFieldLayout/AIFormFieldLayout';

const AIFormPreviousKnowledge = () => {
  const { register } = useAIFormPreviousKnowledge();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <AIFormFieldLayout
      number={3}
      title={t(
        'wiki.assistant.ai.form.previousKnowledge.title',
        'Connaisssances antérieures',
      )}
      description={t(
        'wiki.assistant.ai.form.previousKnowledge.description',
        'Les prérequis indispensables et acquis mobilisables qui vont aider à calibrer la séquence.',
      )}
    >
      <FormControl id="ai-form-previousKnowledge" isOptional>
        <TextArea
          data-testid="ai-form-previousKnowledge-textarea"
          placeholder={t(
            'wiki.assistant.ai.form.previousKnowledge.textarea.placeholder',
            'Ex.: La division cellulaire de la mitose et de la méiose',
          )}
          size="md"
          maxLength={MAX_AI_OPTIONAL_FIELDS_LENGTH}
          {...register('previousKnowledge', {
            required: false,
            maxLength: MAX_AI_OPTIONAL_FIELDS_LENGTH,
          })}
          showCounter
        />
      </FormControl>
    </AIFormFieldLayout>
  );
};

export default AIFormPreviousKnowledge;
