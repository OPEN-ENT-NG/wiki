import { PromotionCard, useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import AIButton from '~/components/AIButton/AIButton';
import { useNavigate } from 'react-router-dom';
import { IconAiFill, IconExercizerAi } from '@edifice.io/react/icons';

export const PagesAssistantAICard = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const navigate = useNavigate();

  /**
   * Handle click on AI Assistant card button
   */
  const handleAssistantAIButtonClick = () => {
    navigate('ai/step1Form');
  };

  return (
    <PromotionCard className="ai-border-gradient">
      <PromotionCard.Header backgroundColor="#FAEA9C">
        {t('wiki.assistant.card.ai.header', { ns: appCode })}
      </PromotionCard.Header>
      <PromotionCard.Icon
        className="ai-background-gradient"
        icon={<IconExercizerAi color="#C232AA" />}
      />
      <PromotionCard.Body>
        <PromotionCard.Title>
          {t('wiki.assistant.card.ai.title', { ns: appCode })}
        </PromotionCard.Title>
        <PromotionCard.Description>
          {t('wiki.assistant.card.ai.description', {
            ns: appCode,
          })}
        </PromotionCard.Description>
      </PromotionCard.Body>
      <PromotionCard.Footer>
        <AIButton
          size="sm"
          leftIcon={<IconAiFill color="#C232AA" />}
          onClick={handleAssistantAIButtonClick}
        >
          {t('wiki.assistant.card.ai.button', {
            ns: appCode,
          })}
        </AIButton>
      </PromotionCard.Footer>
    </PromotionCard>
  );
};
