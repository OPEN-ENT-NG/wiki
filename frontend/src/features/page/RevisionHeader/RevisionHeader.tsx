import { Undo, Wand } from '@edifice-ui/icons';
import {
  Avatar,
  Badge,
  Button,
  useDate,
  useDirectory,
  useOdeClient,
} from '@edifice-ui/react';
import { ID } from 'edifice-ts-client';
import { useTranslation } from 'react-i18next';
import { useRevision } from '~/hooks/useRevision/useRevision';
import { Page } from '~/models';

export const RevisionHeader = ({ page }: { page: Page }) => {
  const { formatDate } = useDate();
  const { appCode } = useOdeClient();
  const { t } = useTranslation(appCode);
  const { getAvatarURL, getUserbookURL } = useDirectory();
  const { navigateToLatestRevision, restoreCurrentRevision, canRestore } =
    useRevision();
  return (
    <div className="d-md-flex justify-content-between">
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
          <div className="text-gray-700 small d-flex flex-column flex-xl-row column-gap-12 align-items-start align-items-xl-center">
            <a
              href={getUserbookURL(page.author as ID, 'user')}
              className="page-author"
            >
              {page.authorName}
            </a>
            <span className="separator d-none d-xl-block"></span>
            <span>
              {t('wiki.read.dated.updated', {
                date: formatDate(page.modified, 'long'),
              })}
            </span>

            <Badge
              variant={{
                type: 'content',
                level: 'warning',
                background: true,
              }}
            >
              <div className="d-flex align-items-center">
                {t('wiki.version.passed')}
              </div>
            </Badge>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-end justify-content-xl-between align-items-center gap-12">
        <Button
          onClick={navigateToLatestRevision}
          leftIcon={<Undo />}
          variant="outline"
        >
          {t('wiki.version.latest')}
        </Button>
        {canRestore() && (
          <Button
            onClick={restoreCurrentRevision}
            leftIcon={<Wand />}
            variant="filled"
          >
            {t('wiki.version.restore')}
          </Button>
        )}
      </div>
    </div>
  );
};
