import { Button, Card, useEdificeClient } from '@edifice.io/react';
import manualCreation from '../icons/manualCreationIcon.svg';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { IconPlus } from '@edifice.io/react/icons';

export const PagesAssistantManualCreationCard = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();

  /**
   * Handle click on New Page card button
   */
  const handleNewPageButtonClick = () => {
    navigate(`/id/${params.wikiId}/page/create`);
  };

  return (
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
  );
};
