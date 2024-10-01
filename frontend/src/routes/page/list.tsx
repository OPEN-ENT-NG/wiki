import {
  Copy,
  Delete,
  FolderMove,
  Forgoing,
  Print,
  See,
} from '@edifice-ui/icons';
import {
  Badge,
  Heading,
  List,
  LoadingScreen,
  ToolbarItem,
  useDate,
} from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { useMediaQuery } from '@uidotdev/usehooks';
import clsx from 'clsx';
import { lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useFilterVisiblePage } from '~/hooks';
import { Page } from '~/models';
import { useGetPagesFromWiki, wikiQueryOptions } from '~/services';
import {
  useOpenDeleteModal,
  useOpenRevisionModal,
  useUserRights,
  useWikiActions,
} from '~/store';

const RevisionModal = lazy(
  async () => await import('~/features/page/RevisionModal/RevisionModal')
);

const DeleteListModal = lazy(
  async () => await import('~/features/page/DeleteListModal/DeleteListModal')
);

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const data = await queryClient.ensureQueryData(
      wikiQueryOptions.findOne(params.wikiId!)
    );

    return data;
  };

export const action =
  (queryClient: QueryClient) =>
  async ({ params, request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const intent = formData.get('intent');

    console.log({ formData, intent: JSON.parse(intent) });

    console.log('delete');
    /*  await wikiService.deletePage({
      wikiId: params.wikiId!,
      pageId: params.pageId!,
    }); */

    // We remove the query from the deleted page
    /* queryClient.removeQueries(
      pageQueryOptions.findOne({
        wikiId: params.wikiId!,
        pageId: params.pageId!,
      })
    ); */
  };

export const Pages = () => {
  const params = useParams();
  const filterVisiblePage = useFilterVisiblePage();
  const openVersionsModal = useOpenRevisionModal();
  const openDeleteModal = useOpenDeleteModal();

  const navigate = useNavigate();
  const userRights = useUserRights();
  const isDesktopDevice = useMediaQuery('only screen and (min-width: 1024px)');

  const [selectedPages, setSelectedPages] = useState<string[]>([]);

  const { setOpenRevisionModal, setOpenDeleteModal } = useWikiActions();
  const { isPending, data, error } = useGetPagesFromWiki({
    wikiId: params.wikiId!,
    content: false,
  });

  const { t } = useTranslation('wiki');
  const { formatDate } = useDate();

  const filteredData = data
    ?.filter((page) => filterVisiblePage(page))
    .sort((a, b) => b.modified.$date - a.modified.$date);

  const selectedPagesCount = selectedPages.length;

  const isOnlyRead =
    userRights.read &&
    !userRights.contrib &&
    !userRights.creator &&
    !userRights.manager;

  const items: ToolbarItem[] = [
    {
      type: 'icon',
      name: 'read',
      props: {
        icon: <See />,
        onClick: () =>
          navigate(`/id/${params.wikiId}/page/${selectedPages[0]}`),
        disabled: selectedPagesCount !== 1,
        'aria-label': t('wiki.list.toolbar.action.read'),
      },
      tooltip: {
        message: t('wiki.list.toolbar.action.read'),
        position: 'bottom',
      },
    },
    {
      type: 'icon',
      name: 'move',
      props: {
        icon: <FolderMove />,
        disabled: selectedPagesCount < 1 || selectedPagesCount > 2,
        'aria-label': t('wiki.list.toolbar.action.move'),
      },
      visibility: isOnlyRead ? 'hide' : 'show',
      tooltip: {
        message: t('wiki.list.toolbar.action.move'),
        position: 'bottom',
      },
    },
    {
      type: 'icon',
      name: 'duplicate',
      props: {
        icon: <Copy />,
        disabled: selectedPagesCount !== 1,
        'aria-label': t('wiki.list.toolbar.action.duplicate'),
      },
      visibility: isOnlyRead ? 'hide' : 'show',
      tooltip: {
        message: t('wiki.list.toolbar.action.duplicate'),
        position: 'bottom',
      },
    },
    {
      type: 'icon',
      name: 'history',
      props: {
        icon: <Forgoing />,
        onClick: () => setOpenRevisionModal(true),
        disabled: selectedPagesCount !== 1,
        'aria-label': t('wiki.list.toolbar.action.history'),
      },
      visibility: isOnlyRead ? 'hide' : 'show',
      tooltip: {
        message: t('wiki.list.toolbar.action.history'),
        position: 'bottom',
      },
    },
    {
      type: 'icon',
      name: 'print',
      props: {
        icon: <Print />,
        disabled: selectedPagesCount !== 1,
        'aria-label': t('wiki.list.toolbar.action.print'),
      },
      visibility: isOnlyRead ? 'hide' : 'show',
      tooltip: {
        message: t('wiki.list.toolbar.action.print'),
        position: 'bottom',
      },
    },
    {
      type: 'icon',
      name: 'delete',
      props: {
        icon: <Delete />,
        disabled: selectedPagesCount < 1,
        onClick: () => setOpenDeleteModal(true),
        'aria-label': t('wiki.list.toolbar.action.delete'),
      },
      visibility: isOnlyRead ? 'hide' : 'show',
      tooltip: {
        message: t('wiki.list.toolbar.action.delete '),
        position: 'bottom',
      },
    },
  ];

  const renderDesktopNode = (
    item: Page,
    checkbox: JSX.Element,
    checked: boolean
  ) => (
    <div
      className={clsx('grid gap-24 px-12 py-8 mb-2', {
        'bg-secondary-200 rounded': checked,
      })}
      style={{ '--edifice-columns': 8 } as React.CSSProperties}
    >
      <div className="d-flex align-items-center gap-8 g-col-3">
        {checkbox}
        <p className="text-truncate text-truncate-2">{item.title}</p>
      </div>
      <em className="text-gray-700 g-col-3">
        {t('wiki.read.author.publish.by', {
          author: formatDate(item.authorName),
        })}
      </em>
      <span className="g-col-1">{formatDate(item.modified.$date)}</span>
      <div className="g-col-1 d-inline-grid">
        <Badge
          variant={{
            type: 'content',
            background: true,
            level: item.isVisible ? 'warning' : 'info',
          }}
        >
          {item.isVisible
            ? t('wiki.table.body.visible')
            : t('wiki.table.body.invisible')}
        </Badge>
      </div>
    </div>
  );

  const renderMobileNode = (
    item: Page,
    checkbox: JSX.Element,
    checked: boolean
  ) => (
    <div
      className={clsx('grid px-12 py-8 mb-2 gap-2', {
        'bg-secondary-200 rounded': checked,
      })}
    >
      <div className="d-flex align-items-center gap-8 g-col-6 g-col-md-12 justify-content-between">
        <div className="d-flex align-items-center gap-8">
          {checkbox}
          <p className="text-truncate text-truncate-2">{item.title}</p>
        </div>
        <div className="d-inline-grid">
          <Badge
            variant={{
              type: 'content',
              background: true,
              level: item.isVisible ? 'warning' : 'info',
            }}
          >
            {item.isVisible
              ? t('wiki.table.body.visible')
              : t('wiki.table.body.invisible')}
          </Badge>
        </div>
      </div>
      <em className="text-gray-600">{formatDate(item.modified.$date)}</em>
    </div>
  );

  if (isPending) return <LoadingScreen />;

  if (error) return 'An error has occurred: ' + error.message;

  return (
    <>
      <Heading className="m-16" level="h2" headingStyle="h2">
        {t('wiki.pagelist')}
      </Heading>
      <div className="px-md-16">
        <List
          items={items}
          data={filteredData}
          renderNode={isDesktopDevice ? renderDesktopNode : renderMobileNode}
          onSelectedItems={setSelectedPages}
        />
        <Suspense fallback={<LoadingScreen position={false} />}>
          {openVersionsModal && <RevisionModal pageId={selectedPages[0]} />}
          {openDeleteModal && <DeleteListModal selectedPages={selectedPages} />}
        </Suspense>
      </div>
    </>
  );
};
