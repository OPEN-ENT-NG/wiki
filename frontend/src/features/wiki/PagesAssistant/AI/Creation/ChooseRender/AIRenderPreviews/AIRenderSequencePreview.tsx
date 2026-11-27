import { useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import { AIRenderPreview } from '~/components/AI/AIRenderPreview/AIRenderPreview';

export const AIRenderSequencePreview = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <>
      <AIRenderPreview
        title={t(
          'wiki.assistant.ai.render.sequence.preview.sujet',
          'Sujet traité',
        )}
      />
      <AIRenderPreview
        title={t(
          'wiki.assistant.ai.render.sequence.preview.interest',
          'Intérêt pédagogique',
        )}
      />
      <AIRenderPreview
        title={t(
          'wiki.assistant.ai.render.sequence.preview.skills',
          'Compétences à acquérir',
        )}
      />
      <AIRenderPreview
        title={t('wiki.assistant.ai.render.sequence.preview.amorce', 'Amorce')}
      />
      <AIRenderPreview
        title={t(
          'wiki.assistant.ai.render.sequence.preview.activities',
          'Activités',
        )}
      />
    </>
  );
};
