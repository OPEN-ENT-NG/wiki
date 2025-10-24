import { Grid, useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';

export const PagesAssistantAIStructureResult = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();

  return (
    <div className="mx-32 my-24">
      <h2>{t('wiki.assistant.ai.structure.result.title', { ns: appCode })}</h2>
      <Grid className="mt-24">
        <Grid.Col sm="5">
          <div className="p-16 border border-gray-300 rounded">
            <h3 className="mb-8">
              {t('wiki.assistant.ai.structure.result.column1.title', {
                ns: appCode,
              })}
            </h3>
            <p>
              {t('wiki.assistant.ai.structure.result.column1.content', {
                ns: appCode,
              })}
            </p>
          </div>
        </Grid.Col>
        <Grid.Col sm="7">
          <div className="p-16 border border-gray-300 rounded">
            <h3 className="mb-8">
              {t('wiki.assistant.ai.structure.result.column2.title', {
                ns: appCode,
              })}
            </h3>
            <p>
              {t('wiki.assistant.ai.structure.result.column2.content', {
                ns: appCode,
              })}
            </p>
          </div>
        </Grid.Col>
      </Grid>
    </div>
  );
};
