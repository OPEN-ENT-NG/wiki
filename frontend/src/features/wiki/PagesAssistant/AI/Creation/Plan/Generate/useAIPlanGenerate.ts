import { odeServices } from '@edifice.io/client';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WikiDto } from '~/models';
import { assistantService } from '~/services/api/assistant/assistant.service';
import { GenerateSequenceRequestDto } from '~/services/api/assistant/assistant.types';
import {
  AIPlanFormValues,
  usePagesAssistantActions,
  usePlanFormValuesStore,
} from '~/store/assistant/plan/planStore';

/**
 * Handles the AITGenerate logic:
 * - calls the AI generation API with the form values
 * - polls the wiki to check if generation is over (wiki.aiMetadata.structureGenerated is true)
 * - returns an object with a 'structureLoading' boolean to be used by the component to show loading animation in the button.
 *
 * @returns hook to handle AITraceGenerate logic.
 */
export const useAIPlanGenerate = () => {
  const [structureLoading, setStructureLoading] = useState<boolean>(false);
  const formValues = usePlanFormValuesStore();
  const navigate = useNavigate();
  const params = useParams();
  const { setPagesStructure } = usePagesAssistantActions();

  const formValuesToDto = (formValues: AIPlanFormValues) => {
    return {
      wikiId: params.wikiId || '',
      schoolType: formValues.schoolType,
      level: formValues.level,
      subject: formValues.subject,
      content: formValues.sequenceProgram || formValues.sequenceTheme,
      seanceCount: formValues.seancesCount,
      seanceDuration: formValues.seancesDuration === 1 ? 60 : 120,
      objectives: formValues.objectives,
      priorKnowledge: formValues.previousKnowledge,
      hook: formValues.accroche,
      difficulties: formValues.difficulties,
      inclusion: formValues.inclusion,
      jobFamily: '', // TODO
    };
  };

  useEffect(() => {
    console.log('formValues', formValues);

    let intervalId: NodeJS.Timeout | null = null;

    const generate = async () => {
      setStructureLoading(true);

      const generateSequenceRequestDto: GenerateSequenceRequestDto =
        formValuesToDto(formValues);

      await assistantService.generateSequence(generateSequenceRequestDto);

      intervalId = setInterval(async () => {
        const wikiResponse = await odeServices
          .http()
          .get<WikiDto>(`/wiki/${params.wikiId}`);

        if (wikiResponse.aiMetadata?.structureGenerated) {
          if (intervalId) clearInterval(intervalId);
          setStructureLoading(false);

          setPagesStructure(
            wikiResponse.pages.map((page) => ({ title: page.title })),
          );

          navigate(
            `/id/${params.wikiId}/pages/assistant/ai/creation/plan/results`,
          );
        }
      }, 3000);
    };

    generate();

    // Cleanup: stop interval when component unmounts
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return {
    structureLoading,
    formValues,
  };
};
