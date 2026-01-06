import {
  Flex,
  Grid,
  useEdificeClient,
  useHasWorkflow,
  useLibraryUrl,
} from '@edifice.io/react';
import { useTranslation } from 'react-i18next';

import { workflows } from '~/config';
import { useUserRights } from '~/store';
import { PagesAssistantManualCreationCard } from './PagesAssistantCards/PagesAssistantManualCreationCard';
import { PagesAssistantAICard } from './PagesAssistantCards/PagesAssistantAICard';
import { PagesAssistantLibraryCard } from './PagesAssistantCards/PagesAssistantLibraryCard';
import { PagesAssistantImportPollCard } from './PagesAssistantCards/PagesAssistantImportPollCard';

import './styles/styles.css';

export const PagesAssistantRoot = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const libraryUrl = useLibraryUrl();
  const hasGenerateWorkflow = useHasWorkflow(workflows.generate);
  const userRights = useUserRights();

  // Restrict Pages Assistant access to managers, creators and contributors
  if (!userRights.manager && !userRights.creator && !userRights.contrib) {
    throw new Error('Unauthorized access to Pages Assistant');
  }

  return (
    <Flex justify="center">
      <div className="col-12 col-md-10 col-lg-8">
        <div className="pages-assistant-wrapper my-40">
          <h2 className="my-32">
            {t('wiki.assistant.title', { ns: appCode })}
          </h2>
          <Grid>
            {/* MANUAL CREATION */}
            <Grid.Col sm="4" md="8" lg="8" xl="6">
              <PagesAssistantManualCreationCard />
            </Grid.Col>

            {/* AI ASSISTANT */}
            {hasGenerateWorkflow && (
              <Grid.Col sm="4" md="8" lg="8" xl="6">
                <PagesAssistantAICard />
              </Grid.Col>
            )}

            {/* LIBRARY INSPIRATION */}
            {libraryUrl && (
              <Grid.Col sm="4" md="8" lg="8" xl="6">
                <PagesAssistantLibraryCard />
              </Grid.Col>
            )}

            {/* IMPORT */}
            <Grid.Col sm="4" md="8" lg="8" xl="6">
              <PagesAssistantImportPollCard />
            </Grid.Col>
          </Grid>
        </div>
      </div>
    </Flex>
  );
};
