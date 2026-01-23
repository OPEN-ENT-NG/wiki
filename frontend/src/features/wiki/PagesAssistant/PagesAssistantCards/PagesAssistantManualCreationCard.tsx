import { Button, PromotionCard, useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { IconPlus, IconWrite } from '@edifice.io/react/icons';

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
    <PromotionCard>
      <PromotionCard.Icon
        backgroundColor="#FFEFE3"
        icon={<IconWrite color="#FF8D2E" />}
      />
      <PromotionCard.Body>
        <PromotionCard.Title>
          {t('wiki.assistant.card.manual.title', { ns: appCode })}
        </PromotionCard.Title>
        <PromotionCard.Description>
          {t('wiki.assistant.card.manual.description', {
            ns: appCode,
          })}
        </PromotionCard.Description>
      </PromotionCard.Body>
      <PromotionCard.Footer>
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
      </PromotionCard.Footer>
    </PromotionCard>
  );
};
