import { ID } from '@edifice.io/client';
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  IconButton,
  IconButtonProps,
  useDate,
  useDirectory,
  useEdificeClient,
} from '@edifice.io/react';
import {
  IconCopy,
  IconDelete,
  IconEdit,
  IconFolderMove,
  IconForgoing,
  IconHide,
  IconOptions,
  IconSee,
} from '@edifice.io/react/icons';
import { useMediaQuery } from '@uidotdev/usehooks';
import { RefAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSubmit } from 'react-router-dom';
import { Fragment } from 'react/jsx-runtime';
import { useIsOnlyRead } from '~/hooks/useIsOnlyRead';
import { Page } from '~/models';
import { useGetPage } from '~/services';
import { useUserRights, useWikiActions } from '~/store';
import { ActionDropdownMenuOptions } from '../../app/AppActions/AppActions';

export const PageHeader = ({
  page,
  wikiId,
  isPrint,
}: {
  page: Page;
  wikiId?: string;
  isPrint?: boolean;
}) => {
  const parentPage = useGetPage({
    wikiId: wikiId!,
    pageId: page.parentId ?? '',
  });
  const navigate = useNavigate();
  const userRights = useUserRights();
  const isOnlyRead = useIsOnlyRead();

  const { formatDate } = useDate();
  const { appCode, user } = useEdificeClient();
  const { getAvatarURL, getUserbookURL } = useDirectory();
  const {
    setOpenDeleteModal,
    setOpenRevisionModal,
    setOpenDuplicateModal,
    setOpenMoveModal,
  } = useWikiActions();
  const submit = useSubmit();
  const { t } = useTranslation(appCode);
  const isSmallDevice = useMediaQuery('only screen and (max-width: 1024px)');

  const canContrib = userRights.contrib;
  const canManage = userRights.manager;

  const handleVisibleAction = async () => {
    const formData = new FormData();
    formData.append('title', page.title);
    formData.append('content', page.content);
    formData.append('isHidden', page.isVisible ? 'true' : 'false');
    submit(formData, {
      method: 'post',
    });
  };

  const handleEditPage = () => navigate(`edit`);

  const dropdownOptions: ActionDropdownMenuOptions[] = [
    {
      id: 'visibility',
      label: page.isVisible
        ? t('wiki.page.dropdown.hide')
        : t('wiki.page.dropdown.visible'),
      icon: page.isVisible ? <IconHide /> : <IconSee />,
      action: handleVisibleAction,
      visibility:
        page.parentId && parentPage.data
          ? canManage && parentPage.data.isVisible
          : canManage,
    },
    {
      id: 'move',
      label: t('wiki.page.dropdown.move'),
      icon: <IconFolderMove />,
      action: () => setOpenMoveModal(true),
      visibility: canContrib || canManage,
    },
    {
      id: 'versions',
      label: t('wiki.page.dropdown.versions'),
      icon: <IconForgoing />,
      action: () => setOpenRevisionModal(true),
      visibility: canContrib || canManage,
    },
    {
      id: 'duplicate',
      label: t('wiki.page.dropdown.duplicate'),
      icon: <IconCopy />,
      action: () => setOpenDuplicateModal(true),
      visibility: canContrib || canManage,
    },
    {
      id: 'delete',
      label: t('wiki.page.dropdown.delete'),
      icon: <IconDelete />,
      action: () => setOpenDeleteModal(true),
      visibility: (canContrib && user?.userId === page.author) || canManage,
    },
  ];

  return (
    <div
      className={` justify-content-between ${!isSmallDevice && 'd-flex'}`}
      style={{ flexDirection: isSmallDevice ? 'unset' : 'row-reverse' }}
    >
      <div
        className={`d-flex  align-items-center gap-12 ${isSmallDevice ? ' justify-content-end mb-24' : 'justify-content-between'}`}
      >
        {!isOnlyRead && !isPrint && (
          <>
            <Button onClick={handleEditPage} leftIcon={<IconEdit />}>
              {t('wiki.page.edit')}
            </Button>
            <Dropdown>
              {(
                triggerProps: JSX.IntrinsicAttributes &
                  Omit<IconButtonProps, 'ref'> &
                  RefAttributes<HTMLButtonElement>,
              ) => (
                <div data-testid="dropdown">
                  <IconButton
                    {...triggerProps}
                    type="button"
                    aria-label="label"
                    color="primary"
                    variant="outline"
                    icon={<IconOptions />}
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
      <div className="d-flex flex-column">
        <div className="d-flex align-items-center">
          <h2 className="text-gray-800">{page.title}</h2>
        </div>
        <div className="d-flex align-items-center gap-12 mb-16 mb-md-24 mt-16">
          <Avatar
            alt={t('wiki.read.author.avatar')}
            size="sm"
            src={getAvatarURL(
              page.lastContributer ?? (page.author as ID),
              'user',
            )}
            variant="circle"
          />
          <div className="text-gray-700 small d-flex flex-column flex-md-row column-gap-12 align-items-md-center ">
            <a
              href={getUserbookURL(
                page.lastContributer ?? (page.author as ID),
                'user',
              )}
              className="page-author"
            >
              {page.lastContributerName ?? page.authorName}
            </a>
            {!isPrint && (
              <>
                <span className="separator d-none d-md-block"></span>
                <span>
                  {t('wiki.read.dated.updated', {
                    date: formatDate(page.modified, 'long'),
                  })}
                </span>
                {!page.isVisible && (
                  <Badge
                    variant={{
                      type: 'content',
                      level: 'info',
                      background: true,
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <IconHide width="20" height="20" className="me-8" />
                      {t('wiki.read.notvisible')}
                    </div>
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
