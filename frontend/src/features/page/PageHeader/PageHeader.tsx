import {
  Copy,
  Delete,
  Edit,
  FolderMove,
  Forgoing,
  Hide,
  Options,
} from '@edifice-ui/icons';
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  IconButton,
  IconButtonProps,
  useDate,
  useDirectory,
  useOdeClient,
} from '@edifice-ui/react';
import { ID } from 'edifice-ts-client';
import { RefAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Fragment } from 'react/jsx-runtime';
import { Page } from '~/models';
import { useUserRights, useWikiActions } from '~/store';
import { ActionDropdownMenuOptions } from '../../app/AppActions';

export const PageHeader = ({
  page,
  isPrint,
}: {
  page: Page;
  isPrint?: boolean;
}) => {
  const navigate = useNavigate();
  const userRights = useUserRights();

  const { formatDate } = useDate();
  const { appCode, user } = useOdeClient();
  const { getAvatarURL, getUserbookURL } = useDirectory();
  const { setOpenDeleteModal, setOpenRevisionModal } = useWikiActions();
  const { t } = useTranslation(appCode);

  const isOnlyRead =
    userRights.read &&
    !userRights.contrib &&
    !userRights.creator &&
    !userRights.manager;

  const canContrib = userRights.contrib;
  const canManage = userRights.manager;

  const handleEditPage = () => navigate(`edit`);

  const dropdownOptions: ActionDropdownMenuOptions[] = [
    {
      id: 'visibility',
      label: t('wiki.page.dropdown.visibility'),
      icon: <Hide />,
      action: () => console.log(''),
      visibility: canManage,
    },
    {
      id: 'move',
      label: t('wiki.page.dropdown.move'),
      icon: <FolderMove />,
      action: () => console.log(''),
      visibility: canContrib || canManage,
    },
    {
      id: 'versions',
      label: t('wiki.page.dropdown.versions'),
      icon: <Forgoing />,
      action: () => setOpenRevisionModal(true),
      visibility: canContrib || canManage,
    },
    {
      id: 'duplicate',
      label: t('wiki.page.dropdown.duplicate'),
      icon: <Copy />,
      action: () => console.log(''),
      visibility: canManage,
    },
    {
      id: 'delete',
      label: t('wiki.page.dropdown.delete'),
      icon: <Delete />,
      action: () => setOpenDeleteModal(true),
      visibility: (canContrib && user?.userId === page.author) || canManage,
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
            {!page.isVisible && !isPrint && (
              <Badge
                variant={{
                  type: 'content',
                  level: 'info',
                  background: true,
                }}
              >
                <div className="d-flex align-items-center">
                  <Hide width="20" height="20" className="me-8" />
                  {t('wiki.read.notvisible')}
                </div>
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-between align-items-center gap-12">
        {!isOnlyRead && !isPrint && (
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
