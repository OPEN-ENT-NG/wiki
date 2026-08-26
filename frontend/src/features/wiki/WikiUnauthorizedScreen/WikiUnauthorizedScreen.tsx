import { EmptyScreen, Heading, useEdificeClient } from '@edifice.io/react';
import { useTranslation } from 'react-i18next';

import illuUnauthorized from '@images/emptyscreen/illu-error.svg';

export const WikiUnauthorizedScreen = () => {
  const emptyStyles = { maxWidth: '600px' };

  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <div
      className="d-flex flex-column gap-24 flex-fill align-items-center justify-content-center m-auto"
      style={emptyStyles}
    >
      <EmptyScreen imageSrc={illuUnauthorized} imageAlt="Unauthorized Image" />
      <Heading className="text-secondary mb-16 text-center" level="h2">
        {t('wiki.unauthorized.emptyscreen.title', {
          ns: appCode,
        })}{' '}
        :
      </Heading>
      <ul className="text-start">
        <li>
          {t('wiki.unauthorized.emptyscreen.text.first', {
            ns: appCode,
          })}
        </li>
        <li>
          {t('wiki.unauthorized.emptyscreen.text.second', {
            ns: appCode,
          })}
        </li>
      </ul>
    </div>
  );
};

export default WikiUnauthorizedScreen;
