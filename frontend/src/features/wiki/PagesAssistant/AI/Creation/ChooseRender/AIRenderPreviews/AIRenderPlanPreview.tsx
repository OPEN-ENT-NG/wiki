import { useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import { AIRenderPreview } from '~/components/AI/AIRenderPreview/AIRenderPreview';

export const AIRenderPlanPreview = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <>
      <AIRenderPreview
        title={t('wiki.assistant.ai.render.plan.preview.sujet', 'Sujet traité')}
      />
      <AIRenderPreview
        title={t(
          'wiki.assistant.ai.render.plan.preview.interest',
          'Intérêt pédagogique',
        )}
      />
      <AIRenderPreview
        title={t(
          'wiki.assistant.ai.render.plan.preview.skills',
          'Compétences à acquérir',
        )}
      />
      <AIRenderPreview
        title={t('wiki.assistant.ai.render.plan.preview.amorce', 'Amorce')}
      />
      <AIRenderPreview
        title={t(
          'wiki.assistant.ai.render.plan.preview.activities',
          'Activités',
        )}
      />
    </>
  );
};
