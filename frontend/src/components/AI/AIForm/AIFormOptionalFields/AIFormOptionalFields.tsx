import { Alert, useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import AIFormPreviousKnowledge from './AIFormPreviousKnowledge/AIFormPreviousKnowledge';
import { PreviousKnowledgeFormValues } from './AIFormPreviousKnowledge/useAIFormPreviousKnowledge';
import './AIFormOptionalFields.css';
import { AccrocheFormValues } from './AIFormAccroche/useAIFormAccroche';
import AIFormAccroche from './AIFormAccroche/AIFormAccroche';
import AIFormDifficulties from './AIFormDifficulties/AIFormDifficulties';
import AIFormInclusion from './AIFormInclusion/AIFormInclusion';
import { DifficultiesFormValues } from './AIFormDifficulties/useAIFormDifficulties';
import { InclusionFormValues } from './AIFormInclusion/useAIFormInclusion';

export type OptionalFieldsFormValues = PreviousKnowledgeFormValues &
  AccrocheFormValues &
  DifficultiesFormValues &
  InclusionFormValues;

const AIFormOptionalFields = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <div className="ai-form-optional">
      {/* Information message */}
      <Alert type="info" className="ai-form-optional__alert">
        {t(
          'wiki.assistant.ai.form.optional.alert.info',
          "Les champs ci-dessous sont facultatifs. Vous connaissez vos élèves mieux que personne. Si vous le souhaitez, quelques précisions permettront d'ajuster la séquence à vos élèves.",
        )}
      </Alert>

      {/* Optional fields */}
      <AIFormPreviousKnowledge />
      <AIFormAccroche />
      <AIFormDifficulties />
      <AIFormInclusion />
    </div>
  );
};

export default AIFormOptionalFields;
