import { useEdificeClient } from '@edifice.io/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { usePlanFormValuesStore } from '~/store/assistant/plan/planStore';

export interface Objective {
  verb: string;
  text: string;
}

export interface ObjectiveFormValues {
  objectives: Objective[];
}

export const useAIFormObjective = () => {
  const { control, register } = useFormContext<ObjectiveFormValues>();
  const formValues = usePlanFormValuesStore();

  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  const objectives: string[] = [
    t('wiki.assistant.ai.form.objectives.dropdown.memoriser', 'Mémoriser'),
    t('wiki.assistant.ai.form.objectives.dropdown.comprendre', 'Comprendre'),
    t('wiki.assistant.ai.form.objectives.dropdown.appliquer', 'Appliquer'),
    t('wiki.assistant.ai.form.objectives.dropdown.analyser', 'Analyser'),
    t('wiki.assistant.ai.form.objectives.dropdown.evaluer', 'Evaluer'),
    t('wiki.assistant.ai.form.objectives.dropdown.creer', 'Créer'),
  ];

  return {
    control,
    formValues,
    objectives,
    register,
  };
};
