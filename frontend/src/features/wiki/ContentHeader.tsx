import { Edit } from '@edifice-ui/icons';
import {
  Avatar,
  Button,
  useDate,
  useDirectory,
  useOdeClient,
} from '@edifice-ui/react';
import { ID } from 'edifice-ts-client';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Page } from '~/models';
import { useUserRights } from '~/store';

export const ContentHeader = ({ page }: { page: Page }) => {
  const { formatDate } = useDate();
  const navigate = useNavigate();
  const userRights = useUserRights();
  const { appCode } = useOdeClient();
  const { getAvatarURL, getUserbookURL } = useDirectory();

  const { t } = useTranslation(appCode);

  const handleEditPage = () => {
    navigate(`edit`);
  };

  const userCanEdit =
    userRights.contrib || userRights.creator || userRights.manager;

  return (
    <div className="d-flex justify-content-between">
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
                date: formatDate(page.modified, 'long'),
              })}
            </span>
          </div>
        </div>
      </div>
      <div>
        {userCanEdit && (
          <Button onClick={handleEditPage} leftIcon={<Edit />}>
            {t('wiki.page.edit')}
          </Button>
        )}
      </div>
    </div>
  );
};
