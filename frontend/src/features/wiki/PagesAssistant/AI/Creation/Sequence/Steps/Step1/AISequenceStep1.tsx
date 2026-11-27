import { useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import AIForm from '~/components/AI/AIForm/AIForm';
import AIFormSchoolType from '~/components/AI/AIForm/AIFormSchoolType/AIFormSchoolType';
import { AIStepHeader } from '~/components/AI/AIStepHeader/AIStepHeader';
import { AIStepLayout } from '~/components/AI/AIStepLayout/AIStepLayout';
import { useAISequenceStep1 } from './useAISequenceStep1';
import AIFormLevel from '~/components/AI/AIForm/AIFormLevel/AIFormLevel';
import AIFormSubject from '~/components/AI/AIForm/AIFormSubject/AIFormSubject';
import AIFormNavigation from '~/components/AI/AIForm/AIFormNavigation/AIFormNavigation';

export const AISequenceStep1 = () => {
  const { formValues, defaultValues, onSubmit, handlePreviousClick } =
    useAISequenceStep1();

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
      {/* AI Sequence Step 1 Form */}
      <AIForm
        id="aiSequenceStep1Form"
        defaultValues={defaultValues}
        onSubmit={onSubmit}
      >
        {/* Choose School Type */}
        <AIFormSchoolType />

        {/* Choose Level */}
        {formValues.schoolType && <AIFormLevel />}

        {/* Choose Subject */}
        {formValues.level && <AIFormSubject />}

        {/* Previous and Next buttons */}
        <AIFormNavigation handlePreviousClick={handlePreviousClick} />
      </AIForm>
    </AIStepLayout>
  );
};
