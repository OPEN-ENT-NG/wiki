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

import '../styles.css';
import { ManualCreationCard } from './Cards/ManualCreationCard';
import { AIFormCard } from './Cards/AIFormCard';
import { LibraryCard } from './Cards/LibraryCard';
import { AIImportPdfCard } from './Cards/AIImportPdfCard';

export const Home = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const libraryUrl = useLibraryUrl();
  const hasGenerateWorkflow = useHasWorkflow(workflows.generate);
  const hasImportPDFWorkflow = useHasWorkflow(workflows.importPDF);
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
              <ManualCreationCard />
            </Grid.Col>

            {/* AI ASSISTANT */}
            {hasGenerateWorkflow && (
              <Grid.Col sm="4" md="8" lg="8" xl="6">
                <AIFormCard />
              </Grid.Col>
            )}

            {/* LIBRARY INSPIRATION */}
            {libraryUrl && (
              <Grid.Col sm="4" md="8" lg="8" xl="6">
                <LibraryCard />
              </Grid.Col>
            )}

            {/* IMPORT */}
            {hasImportPDFWorkflow && (
              <Grid.Col sm="4" md="8" lg="8" xl="6">
                <AIImportPdfCard />
              </Grid.Col>
            )}
          </Grid>
        </div>
      </div>
    </Flex>
  );
};
