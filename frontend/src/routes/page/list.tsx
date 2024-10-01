import {
  Badge,
  Heading,
  List,
  LoadingScreen,
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
  useParams,
} from 'react-router-dom';
import { useFilterVisiblePage } from '~/hooks';
import { Page } from '~/models';
import { useGetPagesFromWiki, wikiQueryOptions } from '~/services';
import { useOpenDeleteModal, useOpenRevisionModal } from '~/store';

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
  };

export const Pages = () => {
  const params = useParams();
  const filterVisiblePage = useFilterVisiblePage();
  const openVersionsModal = useOpenRevisionModal();
  const openDeleteModal = useOpenDeleteModal();

  const isDesktopDevice = useMediaQuery('only screen and (min-width: 1024px)');

  const [selectedPages, setSelectedPages] = useState<string[]>([]);

  const { isPending, data, error } = useGetPagesFromWiki({
    wikiId: params.wikiId!,
    content: false,
  });

  const { t } = useTranslation('wiki');
  const { formatDate } = useDate();

  const filteredData = data
    ?.filter((page) => filterVisiblePage(page))
    .sort((a, b) => b.modified.$date - a.modified.$date);

  const renderDesktopNode = (
    node: Page,
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
        <p className="text-truncate text-truncate-2">{node.title}</p>
      </div>
      <em className="text-gray-700 g-col-3">
        {t('wiki.read.author.publish.by', {
          author: formatDate(node.authorName),
        })}
      </em>
      <span className="g-col-1">{formatDate(node.modified.$date)}</span>
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
    </div>
  );

  const renderMobileNode = (
    node: Page,
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
          data={filteredData}
          renderNode={isDesktopDevice ? renderDesktopNode : renderMobileNode}
        />
        <Suspense fallback={<LoadingScreen position={false} />}>
          {openVersionsModal && <RevisionModal pageId={selectedPages[0]} />}
          {openDeleteModal && <DeleteListModal selectedPages={selectedPages} />}
        </Suspense>
      </div>
    </>
  );
};
