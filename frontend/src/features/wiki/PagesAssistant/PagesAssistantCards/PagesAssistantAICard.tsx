import { Card, useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import AIButton from '~/components/AIButton/AIButton';
import aiIconButton from '../icons/aiIconButton.svg';
import assistantAIIcon from '../icons/assistantAIIcon.svg';
import { useNavigate } from 'react-router-dom';

export const PagesAssistantAICard = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const navigate = useNavigate();

  /**
   * Handle click on AI Assistant card button
   */
  const handleAssitantAIButtonClick = () => {
    navigate('ai/step1Form');
  };

  return (
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
        <AIButton
          size="sm"
          leftIcon={<img src={aiIconButton} alt="AI Assistant Icon" />}
          onClick={handleAssitantAIButtonClick}
        >
          {t('wiki.assistant.card.ai.button', {
            ns: appCode,
          })}
        </AIButton>
      </Card.Footer>
    </Card>
  );
};
