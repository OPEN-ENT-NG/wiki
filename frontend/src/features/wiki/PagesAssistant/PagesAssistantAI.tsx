import { useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';

export const PagesAssistantAI = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();

  return (
    <div className="pages-assistant-ai-wrapper">
      <h2>{t('wiki.assistant.ai.title', { ns: appCode })}</h2>
      <small>{t('wiki.assistant.ai.description', { ns: appCode })}</small>

      <h3>{t('wiki.assistant.ai.level', { ns: appCode })}</h3>
      <h3>{t('wiki.assistant.ai.subject', { ns: appCode })}</h3>
      <h3>{t('wiki.assistant.ai.sequence', { ns: appCode })}</h3>
    </div>
  );
};
