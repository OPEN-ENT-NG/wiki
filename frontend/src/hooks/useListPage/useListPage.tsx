import { ToolbarItem, useBreakpoint } from '@edifice.io/react';
import {
  IconCopy,
  IconDelete,
  IconFolderMove,
  IconForgoing,
  IconPrint,
  IconSee,
} from '@edifice.io/react/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useWikiActions } from '~/store';
import { useIsAuthorOrManager } from '../useIsAuthorOrManager';
import { useIsOnlyRead } from '../useIsOnlyRead';

export const useListPage = ({
  selectedPages,
  pagesCount,
}: {
  selectedPages: string[];
  pagesCount: number;
}) => {
  const params = useParams();
  const navigate = useNavigate();
  const isOnlyRead = useIsOnlyRead();
  const { isManagerOfWiki, isManagerOfSelectedPage } = useIsAuthorOrManager();
  // the user can delete the page if he is the author of the selected page or a manager of the wiki or the selected page
  const canDelete = isManagerOfSelectedPage || isManagerOfWiki;
  const { lg } = useBreakpoint();

  const { t } = useTranslation('wiki');
  const {
    setOpenRevisionModal,
    setOpenDeleteModal,
    setOpenDuplicateModal,
    setOpenPrintModal,
  } = useWikiActions();

  const itemsTranslation = {
    read: {
      desktop: lg ? t('wiki.list.toolbar.action.read') : null,
      responsive: !lg ? t('wiki.list.toolbar.action.read') : '',
    },
    move: {
      desktop: lg ? t('wiki.list.toolbar.action.move') : null,
      responsive: !lg ? t('wiki.list.toolbar.action.move') : '',
    },
    duplicate: {
      desktop: lg ? t('wiki.list.toolbar.action.duplicate') : null,
      responsive: !lg ? t('wiki.list.toolbar.action.duplicate') : '',
    },
    history: {
      desktop: lg ? t('wiki.list.toolbar.action.history') : null,
      responsive: !lg ? t('wiki.list.toolbar.action.history') : '',
    },
    print: {
      desktop: lg ? t('wiki.list.toolbar.action.print') : null,
      responsive: !lg ? t('wiki.list.toolbar.action.print') : '',
    },
    delete: {
      desktop: lg ? t('wiki.list.toolbar.action.delete') : null,
      responsive: !lg ? t('wiki.list.toolbar.action.delete') : '',
    },
  };

  const items: ToolbarItem[] = [
    {
      type: 'button',
      name: 'read',
      props: {
        'leftIcon': <IconSee />,
        'children': itemsTranslation.read.desktop,
        'size': 'sm',
        'onClick': () =>
          navigate(`/id/${params.wikiId}/page/${selectedPages[0]}`),
        'disabled': pagesCount !== 1,
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
        'leftIcon': <IconFolderMove />,
        'children': itemsTranslation.move.desktop,
        'size': 'sm',
        'disabled': pagesCount < 1 || pagesCount > 2,
        'aria-label': itemsTranslation.move.responsive,
      },
      // TODO: remove this line when the move action is implemented
      visibility: 'hide', // isOnlyRead ? 'hide' : 'show',
      tooltip: {
        message: itemsTranslation.move.responsive,
        position: 'bottom',
      },
    },
    {
      type: 'button',
      name: 'duplicate',
      props: {
        'leftIcon': <IconCopy />,
        'children': itemsTranslation.duplicate.desktop,
        'size': 'sm',
        'disabled': pagesCount !== 1,
        'onClick': () => setOpenDuplicateModal(true),
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
        'leftIcon': <IconForgoing />,
        'children': itemsTranslation.history.desktop,
        'size': 'sm',
        'onClick': () => setOpenRevisionModal(true),
        'disabled': pagesCount !== 1,
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
        'leftIcon': <IconPrint />,
        'children': itemsTranslation.print.desktop,
        'size': 'sm',
        'disabled': pagesCount !== 1,
        'onClick': () => setOpenPrintModal(true),
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
        'leftIcon': <IconDelete />,
        'children': itemsTranslation.delete.desktop,
        'size': 'sm',
        'disabled': pagesCount < 1 || !canDelete,
        'onClick': () => setOpenDeleteModal(true),
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
