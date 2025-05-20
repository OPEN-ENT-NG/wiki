import {
  Badge,
  Heading,
  List,
  LoadingScreen,
  useBreakpoint,
  useDate,
} from '@edifice.io/react';
import { ViewsCounter, ViewsModal } from '@edifice.io/react/audience';
import { QueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { lazy, Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  useLocation,
  useParams,
} from 'react-router-dom';
import { DuplicateModal } from '~/features/page/DuplicateModal/DuplicateModal';
import { MoveModal } from '~/features/page/MoveModal/MoveModal';
import { useFilterVisiblePage, useListPage } from '~/hooks';
import { useIsOnlyRead } from '~/hooks/useIsOnlyRead';
import { Page } from '~/models';
import {
  useGetPagesFromWiki,
  useGetPagesViewsCounter,
  useGetPageViewsDetails,
  wikiQueryOptions,
  wikiService,
} from '~/services';
import {
  useOpenDeleteModal,
  useOpenDuplicateModal,
  useOpenMoveModal,
  useOpenRevisionModal,
  useSelectedPages,
  useWikiActions,
} from '~/store';
import { sortPagesByDate } from '~/utils/sortPagesByDate';

const RevisionModal = lazy(
  async () => await import('~/features/page/RevisionModal/RevisionModal'),
);

const DeleteListModal = lazy(
  async () => await import('~/features/page/DeleteListModal/DeleteListModal'),
);

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const data = await queryClient.ensureQueryData(
      wikiQueryOptions.findOne(params.wikiId!),
    );

    return data;
  };

export const action =
  (queryClient: QueryClient) =>
  async ({ params, request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const intent = formData.get('intent');
    const ids = JSON.parse(intent as string);

    await wikiService.deletePages({
      wikiId: params.wikiId!,
      ids,
    });

    queryClient.invalidateQueries();
  };

export const PageList = () => {
  const [isViewsModalOpen, setIsViewsModalOpen] = useState<boolean>(false);
  const [viewsCounterPageId, setViewsCounterPageId] = useState<string>('');

  const params = useParams();
  const location = useLocation();
  const filterVisiblePage = useFilterVisiblePage();
  const openVersionsModal = useOpenRevisionModal();
  const openDeleteModal = useOpenDeleteModal();
  const openDuplicateModal = useOpenDuplicateModal();
  const openMoveModal = useOpenMoveModal();
  const selectedPages = useSelectedPages();
  const isOnlyRead = useIsOnlyRead();
  const { setSelectedPages } = useWikiActions();

  const { lg } = useBreakpoint();
  const { isPending, data, error } = useGetPagesFromWiki({
    wikiId: params.wikiId!,
    content: false,
  });

  const { data: viewsCounterData } = useGetPagesViewsCounter({
    pageIds: data?.map((page) => page._id) || [],
  });

  const { data: pageViewsDetails } = useGetPageViewsDetails({
    pageId: viewsCounterPageId,
  });

  const { t } = useTranslation('wiki');
  const { formatDate } = useDate();

  const filteredData = data?.filter((page) => filterVisiblePage(page));
  const sortedData = filteredData ? sortPagesByDate(filteredData) : [];

  const selectedPagesCount = selectedPages.length;
  const items = useListPage({ selectedPages, pagesCount: selectedPagesCount });
  // Reset selectedPages when the component is unmounted
  useEffect(() => {
    return () => {
      setSelectedPages([]);
    };
  }, [setSelectedPages]);

  // Reset selectedPages when the page changes
  useEffect(() => {
    setSelectedPages([]);
  }, [location.pathname, setSelectedPages]);

  const getPageViewCount = (pageId: string): number => {
    return viewsCounterData?.[pageId] || 0;
  };

  const handleViewsCounterClick = async (pageId: string) => {
    setIsViewsModalOpen(true);
    setViewsCounterPageId(pageId);
  };

  const handleViewsModalClose = () => {
    setIsViewsModalOpen(false);
  };

  const renderDesktopNode = (
    node: Page,
    checkbox: JSX.Element | undefined,
    checked: boolean | undefined,
  ) => (
    <div
      className={clsx('grid gap-24 px-12 py-8 mb-2 align-items: center', {
        'bg-secondary-200 rounded': checked,
      })}
      style={{ '--edifice-columns': 9 } as React.CSSProperties}
    >
      <div
        className={`d-flex align-items-center gap-8 ${isOnlyRead ? 'g-col-4' : 'g-col-3'}`}
      >
        {checkbox}
        <p className="text-truncate text-truncate-2">{node.title}</p>
      </div>
      <em className="text-gray-700 g-col-3 text-truncate">
        {node.lastContributerName
          ? t('wiki.read.author.update.by', {
              author: node.lastContributerName,
            })
          : t('wiki.read.author.publish.by', {
              author: node.authorName,
            })}
      </em>
      <span className="g-col-1">{formatDate(node.modified.$date)}</span>
      <span className="g-col-1" data-testid="pageViewsSpan">
        <ViewsCounter
          viewsCounter={getPageViewCount(node._id)}
          onClick={() => handleViewsCounterClick(node._id)}
        />
      </span>
      {!isOnlyRead && (
        <div className="g-col-1 d-inline-grid">
          <Badge
            variant={{
              type: 'content',
              background: true,
              level: node.isVisible ? 'warning' : 'info',
            }}
          >
            {node.isVisible
              ? t('wiki.table.body.visible')
              : t('wiki.table.body.invisible')}
          </Badge>
        </div>
      )}
    </div>
  );

  const renderMobileNode = (
    node: Page,
    checkbox: JSX.Element | undefined,
    checked: boolean | undefined,
  ) => (
    <div
      className={clsx('grid px-12 py-8 mb-2 gap-2', {
        'bg-secondary-200 rounded': checked,
      })}
    >
      <div className="d-flex align-items-center gap-8 g-col-6 g-col-md-12 justify-content-between">
        <div className="d-flex align-items-center gap-8">
          {checkbox}
          <p className="text-truncate text-truncate-2">{node.title}</p>
        </div>
        <div className="d-inline-grid">
          <Badge
            variant={{
              type: 'content',
              background: true,
              level: node.isVisible ? 'warning' : 'info',
            }}
          >
            {node.isVisible
              ? t('wiki.table.body.visible')
              : t('wiki.table.body.invisible')}
          </Badge>
        </div>
      </div>
      <em className="text-gray-600">{formatDate(node.modified.$date)}</em>
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
          data={sortedData}
          items={items}
          renderNode={lg ? renderDesktopNode : renderMobileNode}
          onSelectedItems={setSelectedPages}
        />
        <Suspense fallback={<LoadingScreen position={false} />}>
          {openVersionsModal && <RevisionModal pageId={selectedPages[0]} />}
          {openDeleteModal && <DeleteListModal selectedPages={selectedPages} />}
          {openDuplicateModal && (
            <DuplicateModal pageId={selectedPages[0]} wikiId={params.wikiId!} />
          )}
          {openMoveModal && (
            <MoveModal wikiId={params.wikiId!} pageId={selectedPages[0]} />
          )}
          {isViewsModalOpen && pageViewsDetails && (
            <ViewsModal
              viewsDetails={pageViewsDetails}
              isOpen={isViewsModalOpen}
              onModalClose={handleViewsModalClose}
            />
          )}
        </Suspense>
      </div>
    </>
  );
};
