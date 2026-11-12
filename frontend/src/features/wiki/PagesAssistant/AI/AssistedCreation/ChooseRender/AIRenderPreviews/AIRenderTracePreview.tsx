import { useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import { AIRenderPreview } from '~/components/AI/AIRenderPreview/AIRenderPreview';

export const AIRenderTracePreview = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();

  return (
    <>
      <AIRenderPreview
        title={t('wiki.assistant.ai.render.plan.chapter1', {
          ns: appCode,
        })}
      />
      <AIRenderPreview
        title={t('wiki.assistant.ai.render.plan.chapter2', {
          ns: appCode,
        })}
      />
      <AIRenderPreview
        title={t('wiki.assistant.ai.render.plan.chapter3', {
          ns: appCode,
        })}
      />
    </>
  );
};
