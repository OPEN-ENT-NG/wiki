import { odeServices } from '@edifice.io/client';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WikiDto } from '~/models';
import { assistantService } from '~/services/api/assistant/assistant.service';
import {
  useFormValuesStore,
  usePagesAssistantActions,
} from '~/store/assistant';

/**
 * Handles the AIFormGenerate logic:
 * - calls the AI generation API with the form values
 * - polls the wiki to check if generation is over (wiki.aiMetadata.structureGenerated is true)
 * - returns an object with a 'structureLoading' boolean to be used by the component to show loading animation in the button.
 *
 * @returns hook to handle AIFormGenerate logic.
 */
export const useAIFormGenerate = () => {
  const [structureLoading, setStructureLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const params = useParams();
  const { setPagesStructure } = usePagesAssistantActions();
  const formValues = useFormValuesStore();

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const generate = async () => {
      setStructureLoading(true);

      const generateRequestPayload = {
        ...formValues,
        wikiId: params.wikiId || '',
      };

      await assistantService.generate(generateRequestPayload);

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

          navigate(`/id/${params.wikiId}/pages/assistant/ai/formResults`);
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
  };
};
