import { useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import { AIStepHeader } from '~/components/AI/AIStepHeader/AIStepHeader';
import { AIStepLayout } from '~/components/AI/AIStepLayout/AIStepLayout';

export interface AIPlanStep2FormValues {
  sequence: string;
  keywords?: string;
}

export const AIPlanStep2 = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <AIStepLayout>
      <AIStepHeader
        title={t('wiki.assistant.ai.step1.title')}
        description={t('wiki.assistant.ai.step1.description')}
        currentStep={1}
        nbSteps={4}
      />
      {/* <AIForm
        id="aiPlanForm"
        key="aiPlanForm"
        defaultValues={defaultValues}
        onSubmit={onSubmit}
      >
        <AIFormSchoolType />
        <AIFormLevel />
      </AIForm> */}
    </AIStepLayout>
  );
};
