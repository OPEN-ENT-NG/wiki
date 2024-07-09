import { EmptyScreen, Heading, useOdeClient } from '@edifice-ui/react';
import { useTranslation } from 'react-i18next';

import emptyScreenImage from '~/assets/illu-wiki.svg';

export const WikiEmptyScreen = () => {
  const emptyStyles = { maxWidth: '424px', margin: '0 auto' };

  const { appCode } = useOdeClient();
  const { t } = useTranslation(appCode);

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={emptyStyles}
    >
      <EmptyScreen imageSrc={emptyScreenImage} />
      <Heading
        className="text-secondary mb-16"
        level="h2"
        data-testid="emptyscreen-title"
      >
        {t('wiki.first.emptyscreen.title')}
      </Heading>
      <p className="text-center" data-testid="emptyscreen-text">
        {t('wiki.first.emptyscreen.text')}
      </p>
    </div>
  );
};

export default WikiEmptyScreen;
