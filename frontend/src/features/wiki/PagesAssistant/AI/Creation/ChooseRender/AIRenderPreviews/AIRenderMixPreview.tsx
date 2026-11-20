import { useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import { AIRenderPlanPreview } from './AIRenderPlanPreview';
import { AIRenderTracePreview } from './AIRenderTracePreview';

export const AIRenderMixPreview = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();

  return (
    <div className="border">
      <div>{t('wiki.assistant.ai.render.mix.plan', { ns: appCode })}</div>
      <AIRenderPlanPreview />
      <div>{t('wiki.assistant.ai.render.mix.traces', { ns: appCode })}</div>
      <AIRenderTracePreview />
    </div>
  );
};
