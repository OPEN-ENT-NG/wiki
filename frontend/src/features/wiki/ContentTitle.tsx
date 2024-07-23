import { Avatar, useDate, useOdeClient } from '@edifice-ui/react';
import { ID } from 'edifice-ts-client';
import { Page } from '~/models';
import { useTranslation } from 'react-i18next';
import { getAvatarURL, getUserbookURL } from '~/utils/AuthorUtils';

export const ContentTitle = ({ page }: { page: Page }) => {
  const { formatDate } = useDate();
  const { appCode } = useOdeClient();

  const { t } = useTranslation(appCode);

  return (
    <div className="d-flex flex-column mt-8 mx-md-8">
      <div className="d-flex align-items-center">
        <h2 className="text-gray-800">{page.title}</h2>
      </div>
      <div className="d-flex align-items-center gap-12 mb-16 mb-md-24 mt-8">
        <Avatar
          alt={t('wiki.consul.author.avatar')}
          size="sm"
          src={getAvatarURL(page.author as ID)}
          variant="circle"
        />
        <div className="text-gray-700 small d-flex flex-column flex-md-row column-gap-12 align-items-md-center ">
          <a href={getUserbookURL(page.author as ID)} className="page-author">
            {page.authorName}
          </a>
          <span className="separator d-none d-md-block"></span>
          <span>
            {t('wiki.consult.dated.updated', {
              date: formatDate(page.modified, 'short'),
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
