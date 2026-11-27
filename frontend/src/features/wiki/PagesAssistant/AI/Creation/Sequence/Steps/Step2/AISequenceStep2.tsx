import { useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import AIForm from '~/components/AI/AIForm/AIForm';
import { AIStepHeader } from '~/components/AI/AIStepHeader/AIStepHeader';
import { AIStepLayout } from '~/components/AI/AIStepLayout/AIStepLayout';
import { useAISequenceStep2 } from './useAISequenceStep2';
import AIFormSequenceField from '~/components/AI/AIForm/AIFormSequenceField/AIFormSequenceField';
import AIFormNavigation from '~/components/AI/AIForm/AIFormNavigation/AIFormNavigation';
import AIFormObjectives from '~/components/AI/AIForm/AIFormObjectives/AIFormObjectives';
import AIFormOptionalFields from '~/components/AI/AIForm/AIFormOptionalFields/AIFormOptionalFields';
import { useReferentiel } from '../useReferentiel';

export const AISequenceStep2 = () => {
  const { defaultValues, handlePreviousClick, onSubmit } = useAISequenceStep2();
  const { sequenceValues } = useReferentiel();

  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <AIStepLayout>
      <AIStepHeader
        title={t('wiki.assistant.ai.step2.title')}
        description={t('wiki.assistant.ai.step2.description')}
        currentStep={2}
        nbSteps={4}
      />
      <AIForm
        id="aiSequenceStep2Form"
        defaultValues={defaultValues}
        onSubmit={onSubmit}
      >
        {/* Choose Sequence */}
        <AIFormSequenceField data={sequenceValues} />

        {/* Choose Objective */}
        <AIFormObjectives />

        {/* Facultatives fields */}
        <AIFormOptionalFields />

        {/* Previous and Next buttons */}
        <AIFormNavigation
          isFinalStep={true}
          handlePreviousClick={handlePreviousClick}
        />
      </AIForm>
    </AIStepLayout>
  );
};
