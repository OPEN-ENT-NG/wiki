import { Avatar, useDate, useDirectory, useOdeClient } from '@edifice-ui/react';
import { ID } from 'edifice-ts-client';
import { useTranslation } from 'react-i18next';
import { Page } from '~/models';

export const ContentTitle = ({ page }: { page: Page }) => {
  const { formatDate } = useDate();
  const { appCode } = useOdeClient();
  const { getAvatarURL, getUserbookURL } = useDirectory();

  const { t } = useTranslation(appCode);

  return (
    <div className="d-flex flex-column">
      <div className="d-flex align-items-center">
        <h2 className="text-gray-800">{page.title}</h2>
      </div>
      <div className="d-flex align-items-center gap-12 mb-16 mb-md-24 mt-8">
        <Avatar
          alt={t('wiki.read.author.avatar')}
          size="sm"
          src={getAvatarURL(page.author as ID, 'user')}
          variant="circle"
        />
        <div className="text-gray-700 small d-flex flex-column flex-md-row column-gap-12 align-items-md-center ">
          <a
            href={getUserbookURL(page.author as ID, 'user')}
            className="page-author"
          >
            {page.authorName}
          </a>
          <span className="separator d-none d-md-block"></span>
          <span>
            {t('wiki.read.dated.updated', {
              date: formatDate(page.modified, 'short'),
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
