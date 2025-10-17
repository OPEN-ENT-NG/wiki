import { Button, Card, Grid, useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';

export const PagesAssistant = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();

  return (
    <>
      <h2 className="my-32">
        {t('wiki.pages.assistant.title', { ns: appCode })}
      </h2>
      <Grid>
        {/* MANUAL CREATION */}
        <Grid.Col sm="6">
          <Card isSelectable={false} isClickable={false}>
            <Card.Body>
              <div className="text-truncate">
                <Card.Title>
                  <p>
                    {t('wiki.pages.assistant.manual.title', { ns: appCode })}
                  </p>
                </Card.Title>
                <Card.Text>
                  <p>
                    {t('wiki.pages.assistant.manual.description', {
                      ns: appCode,
                    })}
                  </p>
                </Card.Text>
              </div>
            </Card.Body>
            <Card.Footer>
              <Button color="tertiary" variant="ghost" size="sm">
                {t('wiki.pages.assistant.manual.button', {
                  ns: appCode,
                })}
              </Button>
            </Card.Footer>
          </Card>
        </Grid.Col>

        {/* AI ASSISTANT */}
        <Grid.Col sm="6">
          <Card isSelectable={false} isClickable={false}>
            <Card.Body>
              <div className="text-truncate">
                <Card.Title>
                  <p>{t('wiki.pages.assistant.ai.title', { ns: appCode })}</p>
                </Card.Title>
                <Card.Text>
                  <p>
                    {t('wiki.pages.assistant.ai.description', {
                      ns: appCode,
                    })}
                  </p>
                </Card.Text>
              </div>
            </Card.Body>
            <Card.Footer>
              <Button color="tertiary" variant="ghost" size="sm">
                {t('wiki.pages.assistant.ai.button', {
                  ns: appCode,
                })}
              </Button>
            </Card.Footer>
          </Card>
        </Grid.Col>

        {/* LIBRARY INSPIRATION */}
        <Grid.Col sm="6">
          <Card isSelectable={false} isClickable={false}>
            <Card.Body>
              <div className="text-truncate">
                <Card.Title>
                  <p>
                    {t('wiki.pages.assistant.library.title', { ns: appCode })}
                  </p>
                </Card.Title>
                <Card.Text>
                  <p>
                    {t('wiki.pages.assistant.library.description', {
                      ns: appCode,
                    })}
                  </p>
                </Card.Text>
              </div>
            </Card.Body>
            <Card.Footer>
              <Button color="tertiary" variant="ghost" size="sm">
                {t('wiki.pages.assistant.library.button', {
                  ns: appCode,
                })}
              </Button>
            </Card.Footer>
          </Card>
        </Grid.Col>

        {/* IMPORT */}
        <Grid.Col sm="6">
          <Card isSelectable={false} isClickable={false}>
            <Card.Body>
              <div className="text-truncate">
                <Card.Title>
                  <p>
                    {t('wiki.pages.assistant.import.title', { ns: appCode })}
                  </p>
                </Card.Title>
                <Card.Text>
                  <p>
                    {t('wiki.pages.assistant.import.description', {
                      ns: appCode,
                    })}
                  </p>
                </Card.Text>
              </div>
            </Card.Body>
            <Card.Footer>
              <Button color="tertiary" variant="ghost" size="sm">
                {t('wiki.pages.assistant.import.button', {
                  ns: appCode,
                })}
              </Button>
            </Card.Footer>
          </Card>
        </Grid.Col>
      </Grid>
    </>
  );
};
