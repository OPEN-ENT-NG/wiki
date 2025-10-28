import { Button, Card, Flex, Grid, useEdificeClient } from '@edifice.io/react';
import {
  IconCheck,
  IconClose,
  IconExternalLink,
  IconPlus,
  IconWand,
} from '@edifice.io/react/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import assistantAIIcon from './icons/assistantAIIcon.svg';
import importIcon from './icons/importIcon.svg';
import inspirationIcon from './icons/inspirationIcon.svg';
import manualCreation from './icons/manualCreationIcon.svg';

export const PagesAssistantRoot = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();

  const handleNewPageButtonClick = () => {
    navigate(`/id/${params.wikiId}/page/create`);
  };

  const handleAssitantAIButtonClick = () => {
    navigate('ai');
  };

  return (
    <div className="pages-assistant-wrapper mx-64 my-40">
      <h2 className="my-32">{t('wiki.assistant.title', { ns: appCode })}</h2>
      <Grid>
        {/* MANUAL CREATION */}
        <Grid.Col sm="2" md="4" lg="4" xl="6">
          <Card isSelectable={false} isClickable={false} className="h-full">
            <Card.Body>
              <Card.Image imageSrc={manualCreation}></Card.Image>
              <div className="text-truncate">
                <Card.Title>
                  {t('wiki.assistant.card.manual.title', { ns: appCode })}
                </Card.Title>
                <Card.Text className="white-space-normal">
                  {t('wiki.assistant.card.manual.description', {
                    ns: appCode,
                  })}
                </Card.Text>
              </div>
            </Card.Body>
            <Card.Footer>
              <Button
                color="tertiary"
                variant="ghost"
                size="sm"
                onClick={handleNewPageButtonClick}
                leftIcon={<IconPlus />}
              >
                {t('wiki.assistant.card.manual.button', {
                  ns: appCode,
                })}
              </Button>
            </Card.Footer>
          </Card>
        </Grid.Col>

        {/* AI ASSISTANT */}
        <Grid.Col sm="2" md="4" lg="4" xl="6">
          <Card
            isSelectable={false}
            isClickable={false}
            className="card-assistant-ai h-full"
          >
            <Card.Body>
              <Card.Image imageSrc={assistantAIIcon} />
              <div className="text-truncate">
                <Card.Title>
                  <p>{t('wiki.assistant.card.ai.title', { ns: appCode })}</p>
                </Card.Title>
                <Card.Text className="white-space-normal">
                  {t('wiki.assistant.card.ai.description', {
                    ns: appCode,
                  })}
                </Card.Text>
              </div>
            </Card.Body>
            <Card.Footer>
              <Button
                className="card-assistant-ai-button"
                color="tertiary"
                variant="ghost"
                size="sm"
                leftIcon={<IconWand />}
                onClick={handleAssitantAIButtonClick}
              >
                {t('wiki.assistant.card.ai.button', {
                  ns: appCode,
                })}
              </Button>
            </Card.Footer>
          </Card>
        </Grid.Col>

        {/* LIBRARY INSPIRATION */}
        <Grid.Col sm="2" md="4" lg="4" xl="6">
          <Card isSelectable={false} isClickable={false} className="h-full">
            <Card.Body>
              <Card.Image imageSrc={inspirationIcon} />
              <div className="text-truncate">
                <Card.Title>
                  <p>
                    {t('wiki.assistant.card.library.title', { ns: appCode })}
                  </p>
                </Card.Title>
                <Card.Text className="white-space-normal">
                  {t('wiki.assistant.card.library.description', {
                    ns: appCode,
                  })}
                </Card.Text>
              </div>
            </Card.Body>
            <Card.Footer>
              <Button
                color="tertiary"
                variant="ghost"
                size="sm"
                leftIcon={<IconExternalLink />}
              >
                {t('wiki.assistant.card.library.button', {
                  ns: appCode,
                })}
              </Button>
            </Card.Footer>
          </Card>
        </Grid.Col>

        {/* IMPORT */}
        <Grid.Col sm="2" md="4" lg="4" xl="6">
          <Card
            isSelectable={false}
            isClickable={false}
            className="card-import h-full"
          >
            <Card.Body>
              <Card.Image imageSrc={importIcon} />
              <div className="text-truncate">
                <Card.Title>
                  <p>
                    {t('wiki.assistant.card.import.title', { ns: appCode })}
                  </p>
                </Card.Title>
                <Card.Text className="white-space-normal">
                  {t('wiki.assistant.card.import.description', {
                    ns: appCode,
                  })}
                </Card.Text>
              </div>
            </Card.Body>
            <Card.Footer>
              <Flex gap="12" justify="center">
                <Button
                  color="tertiary"
                  variant="ghost"
                  size="sm"
                  leftIcon={<IconCheck />}
                >
                  {t('wiki.assistant.card.import.button.yes', {
                    ns: appCode,
                  })}
                </Button>
                <Button
                  color="tertiary"
                  variant="ghost"
                  size="sm"
                  leftIcon={<IconClose />}
                >
                  {t('wiki.assistant.card.import.button.no', {
                    ns: appCode,
                  })}
                </Button>
              </Flex>
            </Card.Footer>
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  );
};
