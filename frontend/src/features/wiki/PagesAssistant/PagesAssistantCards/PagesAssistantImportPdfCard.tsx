import {
  MediaLibrary,
  PromotionCard,
  useEdificeClient,
} from '@edifice.io/react';
import { IconAiFill, IconUpload } from '@edifice.io/react/icons';
import { useTranslation } from 'react-i18next';
import AIButton from '~/components/AIButton/AIButton';
import { usePagesAssistantImportPdfCard } from '~/features/wiki/PagesAssistant/PagesAssistantCards/usePagesAssistantImportPdfCard';

export const PagesAssistantImportPDFCard = () => {
  const {
    mediaLibraryRef,
    handleImportButtonClick,
    handleMediaLibrarySuccess,
    handleMediaLibraryCancel,
  } = usePagesAssistantImportPdfCard();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();

  return (
    <>
      <PromotionCard className="ai-border-gradient">
        <PromotionCard.Icon
          className="ai-background-gradient"
          icon={<IconUpload color="#C232AA" />}
        />
        <PromotionCard.Body>
          <PromotionCard.Title>
            {t('wiki.assistant.card.import.title', { ns: appCode })}
          </PromotionCard.Title>
          <PromotionCard.Description>
            {t('wiki.assistant.card.import.description', {
              ns: appCode,
            })}
          </PromotionCard.Description>
        </PromotionCard.Body>
        <PromotionCard.Footer>
          <AIButton
            size="sm"
            leftIcon={<IconAiFill color="#C232AA" />}
            onClick={handleImportButtonClick}
          >
            {t('wiki.assistant.card.import.button', {
              ns: appCode,
            })}
          </AIButton>
        </PromotionCard.Footer>
      </PromotionCard>
      <MediaLibrary
        ref={mediaLibraryRef}
        appCode={appCode}
        multiple={false}
        pdfOnly={true}
        visibility="protected"
        onSuccess={handleMediaLibrarySuccess}
        onCancel={handleMediaLibraryCancel}
      />
    </>
  );
};
