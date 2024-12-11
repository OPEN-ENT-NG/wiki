import { EmptyScreen, Heading, useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';

import illuWiki from '@images/emptyscreen/illu-wiki.svg';
import { useIsOnlyRead } from '~/hooks/useIsOnlyRead';

export const WikiEmptyScreen = () => {
  const emptyStyles = { maxWidth: '424px' };
  const isOnlyRead = useIsOnlyRead();

  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <div
      className="d-flex flex-column gap-24 flex-fill align-items-center justify-content-center m-auto"
      style={emptyStyles}
    >
      <EmptyScreen imageSrc={illuWiki} imageAlt="Wiki Image" />
      <Heading className="text-secondary mb-16 text-center" level="h2">
        {isOnlyRead
          ? t('wiki.first.emptyscreen.title.onlyRead', { ns: appCode })
          : t('wiki.first.emptyscreen.title', { ns: appCode })}
      </Heading>
      <p className="text-center">
        {isOnlyRead
          ? t('wiki.first.emptyscreen.text.onlyRead', { ns: appCode })
          : t('wiki.first.emptyscreen.text', { ns: appCode })}
      </p>
    </div>
  );
};

export default WikiEmptyScreen;
