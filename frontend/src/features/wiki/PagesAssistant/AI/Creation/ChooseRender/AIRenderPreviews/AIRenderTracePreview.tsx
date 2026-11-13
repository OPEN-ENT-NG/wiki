import { useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import { AIRenderPreview } from '~/components/AI/AIRenderPreview/AIRenderPreview';

export const AIRenderTracePreview = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <>
      <AIRenderPreview
        title={t('wiki.assistant.ai.render.trace.chapter1', 'Chapitre 1')}
      />
      <AIRenderPreview
        title={t('wiki.assistant.ai.render.trace.chapter2', 'Chapitre 2')}
      />
      <AIRenderPreview
        title={t('wiki.assistant.ai.render.trace.chapter3', 'Chapitre 3')}
      />
    </>
  );
};
