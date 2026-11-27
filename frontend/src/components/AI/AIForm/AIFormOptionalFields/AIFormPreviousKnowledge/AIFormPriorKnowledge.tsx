import { FormControl, TextArea, useEdificeClient } from '@edifice.io/react';
import { MAX_AI_OPTIONAL_FIELDS_LENGTH } from '~/config';
import { useAIFormPriorKnowledge } from './useAIFormPriorKnowledge';
import { useTranslation } from 'react-i18next';
import AIFormFieldLayout from '../../AIFormFieldLayout/AIFormFieldLayout';

const AIFormPriorKnowledge = () => {
  const { register } = useAIFormPriorKnowledge();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <AIFormFieldLayout
      number={3}
      title={t(
        'wiki.assistant.ai.form.priorKnowledge.title',
        'Connaisssances antérieures',
      )}
      description={t(
        'wiki.assistant.ai.form.priorKnowledge.description',
        'Les prérequis indispensables et acquis mobilisables qui vont aider à calibrer la séquence.',
      )}
      withBorder={true}
    >
      <FormControl id="ai-form-priorKnowledge" isOptional>
        <TextArea
          data-testid="ai-form-priorKnowledge-textarea"
          placeholder={t(
            'wiki.assistant.ai.form.priorKnowledge.textarea.placeholder',
            'Ex.: La division cellulaire de la mitose et de la méiose',
          )}
          size="md"
          maxLength={MAX_AI_OPTIONAL_FIELDS_LENGTH}
          {...register('priorKnowledge', {
            required: false,
            maxLength: MAX_AI_OPTIONAL_FIELDS_LENGTH,
          })}
          showCounter
        />
      </FormControl>
    </AIFormFieldLayout>
  );
};

export default AIFormPriorKnowledge;
