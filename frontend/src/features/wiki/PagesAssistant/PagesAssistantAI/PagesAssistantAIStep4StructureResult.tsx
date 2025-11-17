import {
  Button,
  Flex,
  Grid,
  Stepper,
  useEdificeClient,
} from '@edifice.io/react';
import {
  IconArrowRight,
  IconEdit,
  IconTextPage,
  IconWand,
} from '@edifice.io/react/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  usePagesAssistantActions,
  usePagesStructureStore,
} from '~/store/assistant';
import AIButton from '~/components/AIButton/AIButton';
import { WikiDto } from '~/models';
import { odeServices } from '@edifice.io/client';
import { baseURL } from '~/services';
import aiIconButton from './../icons/aiIconButton.svg';

export const PagesAssistantAIStep4StructureResult = () => {
  const [contentFinished, setContentFinished] = useState(false);
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const pagesStructure = usePagesStructureStore();
  const { setFormValues } = usePagesAssistantActions();
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const wikiResponse = await odeServices
        .http()
        .get<WikiDto>(`/wiki/${params.wikiId}`);

      if (wikiResponse.aiMetadata?.contentGenerated) {
        clearInterval(intervalId);
        setContentFinished(true);
      }
    }, 5000);

    // Cleanup: stop interval when component unmounts
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const handleCancelButtonClick = () => {
    setFormValues({ level: '', subject: '', sequence: '', keywords: '' });
    navigate(`/id/${params.wikiId}/pages/assistant`);
  };

  const handleGoToWiki = () => {
    setFormValues({ level: '', subject: '', sequence: '', keywords: '' });
    window.location.href = `${baseURL}/id/${params.wikiId}`; // need to refresh the page to work properly
  };

  return (
    <div className="mx-64 my-24">
      <Stepper currentStep={2} nbSteps={3} />
      <h2 className="mt-16">
        {t('wiki.assistant.ai.step4.structure.result.title', { ns: appCode })}
      </h2>
      <Grid className="mt-24">
        <Grid.Col sm="5">
          <div
            className="px-16 pt-16 rounded"
            style={{
              border: 'solid 1px #F9BEEF',
              background: 'linear-gradient(to right, #FFF5FD, #FDFAEC)',
            }}
          >
            {pagesStructure.map((page, index) => (
              <div key={index}>
                <p className="mb-16">{page.title}</p>
              </div>
            ))}
          </div>
        </Grid.Col>
        <Grid.Col sm="7">
          <div className="p-16">
            <Flex gap="16" className="mb-24">
              <IconWand />
              <span>
                {t('wiki.assistant.ai.step4.structure.result.info.1', {
                  ns: appCode,
                })}
              </span>
            </Flex>
            <Flex gap="16" className="mb-24">
              <IconTextPage />
              <span>
                {t('wiki.assistant.ai.step4.structure.result.info.2', {
                  ns: appCode,
                })}
              </span>
            </Flex>
            <Flex gap="16">
              <IconEdit />
              <span>
                {t('wiki.assistant.ai.step4.structure.result.info.3', {
                  ns: appCode,
                })}
              </span>
            </Flex>
          </div>
        </Grid.Col>
      </Grid>

      <div className="mt-24">
        <Flex justify="end" className="mb-8">
          {!contentFinished && (
            <span
              className="small"
              style={{ color: '#909090', fontStyle: 'italic' }}
            >
              {t('wiki.assistant.ai.step4.structure.result.wait.info', {
                ns: appCode,
              })}
            </span>
          )}
          {contentFinished && (
            <span className="small" style={{ color: '#7DBF85' }}>
              {t(
                'wiki.assistant.ai.step4.structure.result.wait.info.finished',
                {
                  ns: appCode,
                },
              )}
            </span>
          )}
        </Flex>
        <Flex justify="end" align="center" gap="16" className="loading">
          <Button
            variant="ghost"
            color="tertiary"
            onClick={handleCancelButtonClick}
          >
            {t('cancel')}
          </Button>
          {!contentFinished && (
            <AIButton
              leftIcon={<img src={aiIconButton} alt="AI Assistant Icon" />}
              disabled={true}
            ></AIButton>
          )}
          {contentFinished && (
            <AIButton onClick={handleGoToWiki} rightIcon={<IconArrowRight />}>
              {t(
                'wiki.assistant.ai.step4.structure.result.wait.button.finished',
                {
                  ns: appCode,
                },
              )}
            </AIButton>
          )}
        </Flex>
      </div>
    </div>
  );
};
