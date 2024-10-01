import {
  Copy,
  Delete,
  FolderMove,
  Forgoing,
  Print,
  See,
} from '@edifice-ui/icons';
import { ToolbarItem } from '@edifice-ui/react';
import { useMediaQuery } from '@uidotdev/usehooks';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserRights, useWikiActions } from '~/store';

export const useListPage = ({
  selectedPages,
  pagesCount,
}: {
  selectedPages: string[];
  pagesCount: number;
}) => {
  const params = useParams();
  const navigate = useNavigate();

  // const { lg } = useBreakpoint();
  const isDesktopDevice = useMediaQuery('only screen and (min-width: 1024px)');
  const userRights = useUserRights();
  const isOnlyRead =
    userRights.read &&
    !userRights.contrib &&
    !userRights.creator &&
    !userRights.manager;

  const { t } = useTranslation('wiki');
  const { setOpenRevisionModal, setOpenDeleteModal } = useWikiActions();

  const itemsTranslation = {
    read: {
      desktop: isDesktopDevice ? t('wiki.list.toolbar.action.read') : null,
      responsive: !isDesktopDevice ? t('wiki.list.toolbar.action.read') : '',
    },
    move: {
      desktop: isDesktopDevice ? t('wiki.list.toolbar.action.move') : null,
      responsive: !isDesktopDevice ? t('wiki.list.toolbar.action.move') : '',
    },
    duplicate: {
      desktop: isDesktopDevice ? t('wiki.list.toolbar.action.duplicate') : null,
      responsive: !isDesktopDevice
        ? t('wiki.list.toolbar.action.duplicate')
        : '',
    },
    history: {
      desktop: isDesktopDevice ? t('wiki.list.toolbar.action.history') : null,
      responsive: !isDesktopDevice ? t('wiki.list.toolbar.action.history') : '',
    },
    print: {
      desktop: isDesktopDevice ? t('wiki.list.toolbar.action.print') : null,
      responsive: !isDesktopDevice ? t('wiki.list.toolbar.action.print') : '',
    },
    delete: {
      desktop: isDesktopDevice ? t('wiki.list.toolbar.action.delete') : null,
      responsive: !isDesktopDevice ? t('wiki.list.toolbar.action.delete') : '',
    },
  };

  const items: ToolbarItem[] = [
    {
      type: 'button',
      name: 'read',
      props: {
        leftIcon: <See />,
        children: itemsTranslation.read.desktop,
        size: 'sm',
        onClick: () =>
          navigate(`/id/${params.wikiId}/page/${selectedPages[0]}`),
        disabled: pagesCount !== 1,
        'aria-label': itemsTranslation.read.responsive,
      },
      tooltip: {
        message: itemsTranslation.read.responsive,
        position: 'bottom',
      },
    },
    {
      type: 'button',
      name: 'move',
      props: {
        leftIcon: <FolderMove />,
        children: itemsTranslation.move.desktop,
        size: 'sm',
        disabled: pagesCount < 1 || pagesCount > 2,
        'aria-label': itemsTranslation.move.responsive,
      },
      visibility: isOnlyRead ? 'hide' : 'show',
      tooltip: {
        message: itemsTranslation.move.responsive,
        position: 'bottom',
      },
    },
    {
      type: 'button',
      name: 'duplicate',
      props: {
        leftIcon: <Copy />,
        children: itemsTranslation.duplicate.desktop,
        size: 'sm',
        disabled: pagesCount !== 1,
        'aria-label': itemsTranslation.duplicate.responsive,
      },
      visibility: isOnlyRead ? 'hide' : 'show',
      tooltip: {
        message: itemsTranslation.duplicate.responsive,
        position: 'bottom',
      },
    },
    {
      type: 'button',
      name: 'history',
      props: {
        leftIcon: <Forgoing />,
        children: itemsTranslation.history.desktop,
        size: 'sm',
        onClick: () => setOpenRevisionModal(true),
        disabled: pagesCount !== 1,
        'aria-label': itemsTranslation.history.responsive,
      },
      visibility: isOnlyRead ? 'hide' : 'show',
      tooltip: {
        message: itemsTranslation.history.responsive,
        position: 'bottom',
      },
    },
    {
      type: 'button',
      name: 'print',
      props: {
        leftIcon: <Print />,
        children: itemsTranslation.print.desktop,
        size: 'sm',
        disabled: pagesCount !== 1,
        'aria-label': itemsTranslation.print.responsive,
      },
      visibility: isOnlyRead ? 'hide' : 'show',
      tooltip: {
        message: itemsTranslation.print.responsive,
        position: 'bottom',
      },
    },
    {
      type: 'button',
      name: 'delete',
      props: {
        leftIcon: <Delete />,
        children: itemsTranslation.delete.desktop,
        size: 'sm',
        disabled: pagesCount < 1,
        onClick: () => setOpenDeleteModal(true),
        'aria-label': itemsTranslation.delete.responsive,
      },
      visibility: isOnlyRead ? 'hide' : 'show',
      tooltip: {
        message: itemsTranslation.delete.responsive,
        position: 'bottom',
      },
    },
  ];

  return items;
};
