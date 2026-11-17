import { useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import AIForm from '~/components/AI/AIForm/AIForm';
import { AIStepHeader } from '~/components/AI/AIStepHeader/AIStepHeader';
import { AIStepLayout } from '~/components/AI/AIStepLayout/AIStepLayout';
import { useAIPlanStep2 } from './useAIPlanStep2';
import AIFormSequence from '~/components/AI/AIForm/AIFormSequence/AIFormSequence';
import AIFormNavigationButtons from '~/components/AI/AIForm/AIFormNavigationButtons/AIFormNavigationButtons';

export const AIPlanStep2 = () => {
  const { defaultValues, handlePreviousClick, onSubmit } = useAIPlanStep2();

  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <AIStepLayout>
      <AIStepHeader
        title={t('wiki.assistant.ai.step2.title')}
        description={t('wiki.assistant.ai.step2.description')}
        currentStep={1}
        nbSteps={4}
      />
      <AIForm
        id="aiPlanStep2Form"
        defaultValues={defaultValues}
        onSubmit={onSubmit}
      >
        {/* Choose Sequence */}
        <AIFormSequence />

        {/* Previous and Next buttons */}
        <AIFormNavigationButtons handlePreviousClick={handlePreviousClick} />
      </AIForm>
    </AIStepLayout>
  );
};
