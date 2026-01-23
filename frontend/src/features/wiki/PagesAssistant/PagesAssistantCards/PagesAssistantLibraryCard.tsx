import {
  Button,
  PromotionCard,
  useEdificeClient,
  useLibraryUrl,
} from '@edifice.io/react';
import { IconExternalLink, IconTeacher } from '@edifice.io/react/icons';
import { useTranslation } from 'react-i18next';

export const PagesAssistantLibraryCard = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const libraryUrl = useLibraryUrl();

  /**
   * Handle click on Library Inspiration card button
   */
  const handleLibraryButtonClick = () => {
    if (libraryUrl) {
      window.open(libraryUrl, '_blank');
    }
  };

  return (
    <PromotionCard>
      <PromotionCard.Icon
        backgroundColor="#F6ECF9"
        icon={<IconTeacher color="#823AA1" />}
      />
      <PromotionCard.Body>
        <PromotionCard.Title>
          {t('wiki.assistant.card.library.title', { ns: appCode })}
        </PromotionCard.Title>
        <PromotionCard.Description>
          {t('wiki.assistant.card.library.description', {
            ns: appCode,
          })}
        </PromotionCard.Description>
      </PromotionCard.Body>
      <PromotionCard.Footer>
        <Button
          color="tertiary"
          variant="ghost"
          size="sm"
          leftIcon={<IconExternalLink />}
          onClick={handleLibraryButtonClick}
        >
          {t('wiki.assistant.card.library.button', {
            ns: appCode,
          })}
        </Button>
      </PromotionCard.Footer>
    </PromotionCard>
  );
};
