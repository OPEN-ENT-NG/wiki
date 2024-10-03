import { EmptyScreen, Heading, useOdeClient } from '@edifice-ui/react';
import { useTranslation } from 'react-i18next';

import emptyScreenImage from '~/assets/illu-wiki.svg';

export const WikiEmptyScreen = () => {
  const emptyStyles = { maxWidth: '424px' };

  const { appCode } = useOdeClient();
  const { t } = useTranslation(appCode);

  return (
    <div
      className="d-flex flex-column gap-24 flex-fill align-items-center justify-content-center m-auto"
      style={emptyStyles}
    >
      <EmptyScreen imageSrc={emptyScreenImage} imageAlt="Wiki Image" />
      <Heading className="text-secondary mb-16" level="h2">
        {t('wiki.first.emptyscreen.title', { ns: appCode })}
      </Heading>
      <p className="text-center">
        {t('wiki.first.emptyscreen.text', { ns: appCode })}
      </p>
    </div>
  );
};

export default WikiEmptyScreen;