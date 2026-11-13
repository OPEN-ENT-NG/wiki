import { useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import AIForm from '~/components/AI/AIForm/AIForm';
import AIFormSchoolType from '~/components/AI/AIForm/AIFormSchoolType/AIFormSchoolType';
import { AIStepHeader } from '~/components/AI/AIStepHeader/AIStepHeader';
import { AIStepLayout } from '~/components/AI/AIStepLayout/AIStepLayout';
import { useAIPlanStep1 } from './useAIPlanStep1';
import AIFormLevel from '~/components/AI/AIForm/AIFormLevel/AIFormLevel';
import AIFormSubject from '~/components/AI/AIForm/AIFormSubject/AIFormSubject';
import AIFormNavigationButtons from '~/components/AI/AIForm/AIFormNavigationButtons/AIFormNavigationButtons';

export const AIPlanStep1 = () => {
  const { formValues, defaultValues, onSubmit, handlePreviousClick } =
    useAIPlanStep1();

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
      {/* AI PLAN Step 1 Form */}
      <AIForm
        id="aiPlanForm"
        key="aiPlanForm"
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
        <AIFormNavigationButtons handlePreviousClick={handlePreviousClick} />
      </AIForm>
    </AIStepLayout>
  );
};
