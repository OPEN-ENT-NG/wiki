import { useEffect, useState } from 'react';
import { usePlanFormValuesStore } from '~/store/assistant/plan/planStore';

/**
 * Handles the AITGenerate logic:
 * - calls the AI generation API with the form values
 * - polls the wiki to check if generation is over (wiki.aiMetadata.structureGenerated is true)
 * - returns an object with a 'structureLoading' boolean to be used by the component to show loading animation in the button.
 *
 * @returns hook to handle AITraceGenerate logic.
 */
export const useAIGenerate = () => {
  const [structureLoading] = useState<boolean>(false);
  const formValues = usePlanFormValuesStore();

  useEffect(() => {
    console.log('formValues', formValues);
  }, []);

  return {
    structureLoading,
    formValues,
  };
};
