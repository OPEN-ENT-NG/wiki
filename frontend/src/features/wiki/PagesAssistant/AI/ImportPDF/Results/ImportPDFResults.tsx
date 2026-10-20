import {
  Alert,
  Button,
  Flex,
  Grid,
  Stepper,
  useEdificeClient,
} from '@edifice.io/react';
import {
  IconAiFill,
  IconEdit,
  IconTextPage,
  IconWand,
} from '@edifice.io/react/icons';
import { useTranslation } from 'react-i18next';
import AIButton from '~/components/AIButton/AIButton';
import { ButtonAIScreebActivate } from '../../ButtonAIScreebActivate';
import { useImportPDFResults } from './useImportPDFResults';

export const ImportPDFResults = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const {
    pagesStructure,
    contentFinished,
    generatedWiki,
    handleCancelButtonClick,
  } = useImportPDFResults();

  return (
    <Flex justify="center">
      <div className="col-12 col-md-10 col-lg-8">
        <div className="my-24">
          <Stepper currentStep={2} nbSteps={3} />
          <h2 className="mt-16">
            {t('wiki.assistant.ai.importpdf.results.title', {
              ns: appCode,
            })}
          </h2>
          <Grid className="mt-24">
            <Grid.Col sm="5">
              <div
                className="px-16 pt-16 rounded"
                style={{
                  border: 'solid 1px #F9BEEF',
                  background: 'linear-gradient(to right, #FFF5FD, #FDFAEC)',
                }}
              >
                {pagesStructure.map((page, index) => (
                  <div key={index}>
                    <p className="mb-16">{page.title}</p>
                  </div>
                ))}
              </div>
            </Grid.Col>
            <Grid.Col sm="7">
              <div className="p-16">
                <Flex gap="16" className="mb-24">
                  <IconWand />
                  <span>
                    {t('wiki.assistant.ai.importpdf.results.info.1', {
                      ns: appCode,
                    })}
                  </span>
                </Flex>
                <Flex gap="16" className="mb-24">
                  <IconTextPage />
                  <span>
                    {t('wiki.assistant.ai.importpdf.results.info.2', {
                      ns: appCode,
                    })}
                  </span>
                </Flex>
                <Flex gap="16" className="mb-24">
                  <IconEdit />
                  <span>
                    {t('wiki.assistant.ai.importpdf.results.info.3', {
                      ns: appCode,
                    })}
                  </span>
                </Flex>
                <Alert type="warning">
                  {t('wiki.assistant.ai.importpdf.results.warning', {
                    ns: appCode,
                  })}
                </Alert>
              </div>
            </Grid.Col>
          </Grid>

          <div className="mt-24">
            <Flex justify="end" className="mb-8">
              {!contentFinished && (
                <span
                  className="small"
                  style={{ color: '#909090', fontStyle: 'italic' }}
                >
                  {t('wiki.assistant.ai.importpdf.results.wait.info', {
                    ns: appCode,
                  })}
                </span>
              )}
              {contentFinished && (
                <span className="small" style={{ color: '#7DBF85' }}>
                  {t('wiki.assistant.ai.importpdf.results.wait.info.finished', {
                    ns: appCode,
                  })}
                </span>
              )}
            </Flex>
            <Flex justify="end" align="center" gap="16" className="loading">
              <Button
                variant="ghost"
                color="tertiary"
                onClick={handleCancelButtonClick}
              >
                {t('cancel')}
              </Button>
              {!contentFinished && (
                <AIButton
                  leftIcon={<IconAiFill color="#C232AA" />}
                  disabled={true}
                ></AIButton>
              )}
              {contentFinished && generatedWiki && (
                <ButtonAIScreebActivate generatedWiki={generatedWiki} />
              )}
            </Flex>
          </div>
        </div>
      </div>
    </Flex>
  );
};
