import {
  Copy,
  Delete,
  Edit,
  FolderMove,
  Hide,
  Options,
  Tool,
} from '@edifice-ui/icons';
import {
  Avatar,
  Button,
  Dropdown,
  IconButton,
  IconButtonProps,
  useDate,
  useDirectory,
  useOdeClient,
  useUser,
} from '@edifice-ui/react';
import { ID } from 'edifice-ts-client';
import { RefAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Fragment } from 'react/jsx-runtime';
import { useAccess } from '~/hooks/useAccess';
import { Page } from '~/models';
import { useUserRights, useWikiActions } from '~/store';
import { ActionDropdownMenuOptions } from '../app/AppActions';

export const ContentHeader = ({ page }: { page: Page }) => {
  const { formatDate } = useDate();
  const navigate = useNavigate();
  const userRights = useUserRights();
  const { appCode } = useOdeClient();
  const { user } = useUser();
  const { getAvatarURL, getUserbookURL } = useDirectory();
  const { setOpenDeleteModal } = useWikiActions();
  const { t } = useTranslation(appCode);
  const { isOnlyRead } = useAccess();

  const handleEditPage = () => navigate(`edit`);

  const dropdownOptions: ActionDropdownMenuOptions[] = [
    {
      id: 'visible',
      label: t('Rendre non visible la page'),
      icon: <Hide />,
      action: () => console.log(''),
      visibility: userRights.creator || userRights.manager,
    },
    {
      id: 'move',
      label: t('Déplacer la page'),
      icon: <FolderMove />,
      action: () => console.log(''),
      visibility:
        userRights.contrib || userRights.creator || userRights.manager,
    },
    {
      id: 'versions',
      label: t("Voir l'historique"),
      icon: <Tool />,
      action: () => console.log(''),
      visibility: userRights.creator || userRights.manager,
    },
    {
      id: 'duplicate',
      label: t('Dupliquer la page'),
      icon: <Copy />,
      action: () => console.log(''),
      visibility: userRights.creator || userRights.manager,
    },
    {
      id: 'delete',
      label: t('supprimer la page'),
      icon: <Delete />,
      action: () => setOpenDeleteModal(true),
      visibility:
        (userRights.contrib && user?.userId === page.author) ||
        userRights.creator ||
        userRights.manager,
    },
  ];

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
      <div className="d-flex justify-content-between align-items-center gap-12">
        {!isOnlyRead && (
          <>
            <Button onClick={handleEditPage} leftIcon={<Edit />}>
              {t('wiki.page.edit')}
            </Button>
            <Dropdown>
              {(
                triggerProps: JSX.IntrinsicAttributes &
                  Omit<IconButtonProps, 'ref'> &
                  RefAttributes<HTMLButtonElement>
              ) => (
                <div data-testid="dropdown">
                  <IconButton
                    {...triggerProps}
                    type="button"
                    aria-label="label"
                    color="primary"
                    variant="outline"
                    icon={<Options />}
                  />

                  <Dropdown.Menu>
                    {dropdownOptions.map((option) => (
                      <Fragment key={option.id}>
                        {option.type === 'divider' ? (
                          <Dropdown.Separator />
                        ) : (
                          option.visibility && (
                            <Dropdown.Item
                              icon={option.icon}
                              onClick={() => option.action(null)}
                            >
                              {option.label}
                            </Dropdown.Item>
                          )
                        )}
                      </Fragment>
                    ))}
                  </Dropdown.Menu>
                </div>
              )}
            </Dropdown>
          </>
        )}
      </div>
    </div>
  );
};
