import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Flex,
  LoadingScreen,
  Stepper,
  useEdificeClient,
  useUser,
} from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import { IconClock } from '@edifice.io/react/icons';
import {
  usePagesAssistantActions,
  useFormValuesStore,
} from '~/store/assistant';
import { assistantService } from '~/services/api/assistant/assistant.service';

export const PagesAssistantAIStructureLoading = () => {
  const [structureLoading, setStructureLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const params = useParams();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const { setPagesStructure } = usePagesAssistantActions();
  const formValues = useFormValuesStore();
  const user = useUser();

  useEffect(() => {
    const fetchPagesStructure = async () => {
      setStructureLoading(true);

      const pagesStructureRequest = {
        ...formValues,
        wikiId: params.wikiId || '',
        userId: user.user?.userId || '',
        session: user.user?.sessionMetadata._id || '',
        browser: navigator.userAgent,
      };
      console.log('pagesStructureRequest', pagesStructureRequest);

      // Call asstistant service to get pages structure
      const pagesStructureResponse = await assistantService.getPagesStructure(
        pagesStructureRequest,
      );

      console.log('pagesStructureResponse', pagesStructureResponse);

      setPagesStructure(pagesStructureResponse?.data?.pages);
      setStructureLoading(false);
      navigate(`/id/${params.wikiId}/pages/assistant/ai/structureResult`);
    };

    fetchPagesStructure();
  }, []);

  return (
    <div className="mx-64 my-24">
      {structureLoading && (
        <div>
          <Stepper currentStep={1} nbSteps={3} />
          <h2 className="mt-16">
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
