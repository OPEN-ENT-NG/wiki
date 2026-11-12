import { useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import { AIRenderPreview } from '~/components/AI/AIRenderPreview/AIRenderPreview';

export const AIRenderPlanPreview = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();

  return (
    <>
      <AIRenderPreview
        title={t('wiki.assistant.ai.render.plan.preview.sujet', {
          ns: appCode,
        })}
      />
      <AIRenderPreview
        title={t('wiki.assistant.ai.render.plan.preview.interest', {
          ns: appCode,
        })}
      />
      <AIRenderPreview
        title={t('wiki.assistant.ai.render.plan.preview.skills', {
          ns: appCode,
        })}
      />
      <AIRenderPreview
        title={t('wiki.assistant.ai.render.plan.preview.amorce', {
          ns: appCode,
        })}
      />
      <AIRenderPreview
        title={t('wiki.assistant.ai.render.plan.preview.activities', {
          ns: appCode,
        })}
      />
    </>
  );
};
