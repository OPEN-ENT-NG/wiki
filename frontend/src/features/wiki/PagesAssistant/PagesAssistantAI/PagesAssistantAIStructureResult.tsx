import { Button, Flex, Grid, useEdificeClient } from '@edifice.io/react';
import {
  IconArrowRight,
  IconEdit,
  IconTextPage,
  IconWand,
} from '@edifice.io/react/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { usePagesStructureStore } from '~/store/assistant';
import { assistantService } from '~/services/api/assistant/assistant.service';
import { PagesContentResponse } from '~/services/api/assistant/assistant.types';

export const PagesAssistantAIStructureResult = () => {
  const [contentFinished, setContentFinished] = useState(false);
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const pagesStructure = usePagesStructureStore();
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPagesContent = async () => {
      const pagesContentResponse: PagesContentResponse =
        await assistantService.getPagesContent();
      console.log('pagesContentResponse', pagesContentResponse);
      setContentFinished(true);
    };

    fetchPagesContent();
  }, []);

  const handleCancelButtonClick = () => {
    navigate(`/id/${params.wikiId}/pages/assistant`);
  };

  const handleGoToWiki = () => {
    navigate(`/id/${params.wikiId}`);
  };

  return (
    <div className="mx-64 my-40">
      <h2>{t('wiki.assistant.ai.structure.result.title', { ns: appCode })}</h2>
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
                {t('wiki.assistant.ai.structure.result.info.1', {
                  ns: appCode,
                })}
              </span>
            </Flex>
            <Flex gap="16" className="mb-24">
              <IconTextPage />
              <span>
                {t('wiki.assistant.ai.structure.result.info.2', {
                  ns: appCode,
                })}
              </span>
            </Flex>
            <Flex gap="16">
              <IconEdit />
              <span>
                {t('wiki.assistant.ai.structure.result.info.3', {
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
              {t('wiki.assistant.ai.structure.result.wait.info', {
                ns: appCode,
              })}
            </span>
          )}
          {contentFinished && (
            <span className="small" style={{ color: '#7DBF85' }}>
              {t('wiki.assistant.ai.structure.result.wait.info.finished', {
                ns: appCode,
              })}
            </span>
          )}
        </Flex>
        <Flex justify="end" align="center" gap="16">
          <Button
            variant="ghost"
            color="tertiary"
            onClick={handleCancelButtonClick}
          >
            {t('cancel')}
          </Button>
          {!contentFinished && (
            <Flex
              align="center"
              gap="8"
              className="px-16 py-8"
              style={{
                border: 'solid 1px #F9BEEF',
                borderRadius: '120px',
                background: 'linear-gradient(to right, #FFF5FD, #FDFAEC)',
              }}
            >
              <span>
                {t('wiki.assistant.ai.structure.result.wait.button', {
                  ns: appCode,
                })}
              </span>
              <IconWand />
            </Flex>
          )}
          {contentFinished && (
            <Button onClick={handleGoToWiki} rightIcon={<IconArrowRight />}>
              {t('wiki.assistant.ai.structure.result.wait.button.finished', {
                ns: appCode,
              })}
            </Button>
          )}
        </Flex>
      </div>
    </div>
  );
};
