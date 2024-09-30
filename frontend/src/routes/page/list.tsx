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
  Checkbox,
  Heading,
  LoadingScreen,
  Toolbar,
  ToolbarItem,
  useDate,
  useOdeClient,
} from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { useMediaQuery } from '@uidotdev/usehooks';
import clsx from 'clsx';
import { Fragment, lazy, ReactNode, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useCheckableTable, useFilterVisiblePage } from '~/hooks';
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

type ListCheckboxOptions = {
  items: any[];
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
};

type ListProps<T> = {
  checkboxOptions?: ListCheckboxOptions;
  items: ToolbarItem[];
  data: T[] | undefined;
  renderNode: (item: T) => ReactNode;
};

const List = <T extends { id: string }>({
  checkboxOptions,
  items,
  data,
  renderNode,
}: ListProps<T>) => {
  return (
    <div>
      <div
        className={clsx('d-flex align-items-center', {
          'px-12': checkboxOptions,
        })}
      >
        {checkboxOptions && (
          <div className="d-flex align-items-center gap-8">
            <Checkbox
              checked={checkboxOptions?.checked}
              indeterminate={checkboxOptions?.indeterminate}
              onChange={checkboxOptions?.onChange}
            />
            <span>({checkboxOptions?.items.length})</span>
          </div>
        )}
        <Toolbar
          items={items}
          isBlock
          variant="no-shadow"
          className={clsx('py-4', {
            'py-4': checkboxOptions,
            'px-0': !checkboxOptions,
          })}
        />
      </div>
      <div className="border-top"></div>
      <div className="mt-8">
        {data?.map((item) => (
          <Fragment key={item.id}>{renderNode(item)}</Fragment>
        ))}
      </div>
    </div>
  );
};

export const Pages = () => {
  const params = useParams();
  const filterVisiblePage = useFilterVisiblePage();
  const navigate = useNavigate();
  const openVersionsModal = useOpenRevisionModal();
  const openDeleteModal = useOpenDeleteModal();
  const userRights = useUserRights();
  const canManage = userRights.manager;
  const isDesktopDevice = useMediaQuery('only screen and (min-width: 1024px)');

  const { isPending, data, error } = useGetPagesFromWiki({
    wikiId: params.wikiId!,
    content: false,
  });

  const { t } = useTranslation('wiki');
  const { user } = useOdeClient();
  const { formatDate } = useDate();
  const { setOpenRevisionModal, setOpenDeleteModal } = useWikiActions();

  const {
    selectedItems,
    allItemsSelected,
    isIndeterminate,
    handleOnSelectAllItems,
    handleOnSelectItem,
  } = useCheckableTable<Page>(data);

  const isOnlyRead =
    userRights.read &&
    !userRights.contrib &&
    !userRights.creator &&
    !userRights.manager;

  const selectedItemsCount = selectedItems.length;

  const items: ToolbarItem[] = [
    {
      type: 'icon',
      name: 'read',
      props: {
        icon: <See />,
        onClick: () =>
          navigate(`/id/${params.wikiId}/page/${selectedItems[0]}`),
        disabled: selectedItemsCount !== 1,
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
        disabled: selectedItems.length < 1 || selectedItems.length > 2,
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
        disabled: selectedItemsCount !== 1,
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
        disabled: selectedItemsCount !== 1,
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
        disabled: selectedItemsCount !== 1,
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
        disabled: selectedItems.length < 1,
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

  const filteredData = data
    ?.filter((page) => filterVisiblePage(page))
    .sort((a, b) => b.modified.$date - a.modified.$date);

  const renderDesktopNode = (item: Page) => (
    <div
      className={clsx('grid gap-24 px-12 py-8 mb-2', {
        'bg-secondary-200 rounded': selectedItems.includes(item.id),
      })}
      style={{ '--edifice-columns': 8 } as React.CSSProperties}
    >
      <div className="d-flex align-items-center gap-8 g-col-3">
        <Checkbox
          checked={selectedItems.includes(item.id)}
          onChange={() => handleOnSelectItem(item.id)}
        />
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

  const renderMobileNode = (item: Page) => (
    <div
      className={clsx('grid px-12 py-8 mb-2 gap-2', {
        'bg-secondary-200 rounded': selectedItems.includes(item.id),
      })}
    >
      <div className="d-flex align-items-center gap-8 g-col-6 g-col-md-12 justify-content-between">
        <div className="d-flex align-items-center gap-8">
          <Checkbox
            checked={selectedItems.includes(item.id)}
            onChange={() => handleOnSelectItem(item.id)}
          />
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
          checkboxOptions={{
            items: selectedItems,
            checked: allItemsSelected,
            indeterminate: isIndeterminate,
            onChange: () => handleOnSelectAllItems(allItemsSelected),
          }}
          renderNode={isDesktopDevice ? renderDesktopNode : renderMobileNode}
        />
        <Suspense fallback={<LoadingScreen position={false} />}>
          {openVersionsModal && <RevisionModal pageId={selectedItems[0]} />}
          {openDeleteModal && <DeleteListModal selectedItems={selectedItems} />}
        </Suspense>
      </div>
    </>
  );
};
