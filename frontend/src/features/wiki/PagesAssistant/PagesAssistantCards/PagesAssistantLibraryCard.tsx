import {
  Button,
  Card,
  useEdificeClient,
  useLibraryUrl,
} from '@edifice.io/react';
import { IconExternalLink } from '@edifice.io/react/icons';
import inspirationIcon from '../icons/inspirationIcon.svg';
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
    <Card isSelectable={false} isClickable={false} className="h-full">
      <Card.Body>
        <Card.Image imageSrc={inspirationIcon} />
        <div className="text-truncate">
          <Card.Title>
            <p>{t('wiki.assistant.card.library.title', { ns: appCode })}</p>
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
          onClick={handleLibraryButtonClick}
        >
          {t('wiki.assistant.card.library.button', {
            ns: appCode,
          })}
        </Button>
      </Card.Footer>
    </Card>
  );
};
