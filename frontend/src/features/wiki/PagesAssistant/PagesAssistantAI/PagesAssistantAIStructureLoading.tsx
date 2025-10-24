import { useEffect, useState } from 'react';
import { mockPagesStructureApiCall } from './mockAPI';
import { useNavigate, useParams } from 'react-router-dom';
import { Flex, LoadingScreen, useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import { IconClock } from '@edifice.io/react/icons';

export const PagesAssistantAIStructureLoading = () => {
  const [structureLoading, setStructureLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const params = useParams();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchPagesStructure = async () => {
      setStructureLoading(true);

      const pagesStructureResponse = await mockPagesStructureApiCall();
      console.log('pagesStructureResponse', pagesStructureResponse);

      setStructureLoading(false);

      navigate(`/id/${params.wikiId}/pages/assistant/ai/structureResult`, {
        state: { pagesStructureResponse },
      });
    };

    fetchPagesStructure();
  }, []);

  return (
    <div className="mx-32 my-24">
      {structureLoading && (
        <div>
          <h2>
            {t('wiki.assistant.ai.structure.loading.title', { ns: appCode })}
          </h2>
          <div className="mt-64">
            <h3>
              {t('wiki.assistant.ai.structure.loading.description', {
                ns: appCode,
              })}
            </h3>
            <Flex className="text-gray-700 mt-8" gap="4">
              <IconClock />
              {t('wiki.assistant.ai.structure.loading.subtitle', {
                ns: appCode,
              })}
            </Flex>
            <LoadingScreen />
          </div>
        </div>
      )}
    </div>
  );
};
