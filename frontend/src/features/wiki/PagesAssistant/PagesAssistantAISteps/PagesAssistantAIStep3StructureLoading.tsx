import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Flex, Stepper, useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import { IconClock } from '@edifice.io/react/icons';
import {
  usePagesAssistantActions,
  useFormValuesStore,
} from '~/store/assistant';
import { assistantService } from '~/services/api/assistant/assistant.service';
import { odeServices } from '@edifice.io/client';
import { WikiDto } from '~/models';
import Lottie from 'lottie-react';
import loadingAnimation from '../animations/loading.json';

export const PagesAssistantAIStep3StructureLoading = () => {
  const [structureLoading, setStructureLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const params = useParams();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
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

          navigate(
            `/id/${params.wikiId}/pages/assistant/ai/step4StructureResult`,
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

  return (
    <div className="mx-64 my-24">
      {structureLoading && (
        <div>
          <Stepper currentStep={1} nbSteps={3} />
          <h2 className="mt-16">
            {t('wiki.assistant.ai.step3.structure.loading.title', {
              ns: appCode,
            })}
          </h2>
          <div className="text-center">
            <Flex justify="center" align="center">
              <Lottie
                animationData={loadingAnimation}
                loop={true}
                style={{ width: 250 }}
              />
            </Flex>
            <h3 className="mt-16">
              {t('wiki.assistant.ai.step3.structure.loading.description', {
                ns: appCode,
              })}
            </h3>
            <Flex justify="center" className="text-gray-700 mt-8" gap="4">
              <IconClock />
              {t('wiki.assistant.ai.step3.structure.loading.subtitle', {
                ns: appCode,
              })}
            </Flex>
          </div>
        </div>
      )}
    </div>
  );
};
