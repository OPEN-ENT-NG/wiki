import { Plus } from '@edifice-ui/icons';
import { checkUserRight, Dropdown, Grid, Menu } from '@edifice-ui/react';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useMediaQuery } from '@uidotdev/usehooks';
import clsx from 'clsx';
import { ID, odeServices } from 'edifice-ts-client';
import { useEffect } from 'react';
import {
  LoaderFunctionArgs,
  Outlet,
  useMatch,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  AppHeader,
  DropdownTreeview,
  NewPage,
  WikiEmptyScreen,
} from '~/features';
import { SortableTree } from '~/components/Tree/SortableTree';
import { useFeedData } from '~/hooks/useFeedData';
import { useMenu } from '~/hooks/useMenu';
import { useRedirectDefaultPage } from '~/hooks/useRedirectDefaultPage';
import { useGetWiki, wikiQueryOptions, wikiService } from '~/services';
import { getUserRightsActions, useUserRights } from '~/store';
import {
  useSelectedNodeId,
  useTreeActions,
  useTreeData,
} from '~/store/treeview';
import './index.css';

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const data = await queryClient.ensureQueryData(
      wikiQueryOptions.findOne(params.wikiId!)
    );

    // TODO: wait normalized rights
    const userRights = await checkUserRight(data.rights);
    const { setUserRights } = getUserRightsActions();
    setUserRights(userRights);

    if (odeServices.http().isResponseError()) {
      throw new Response('', {
        status: odeServices.http().latestResponse.status,
        statusText: odeServices.http().latestResponse.statusText,
      });
    }

    return data;
  };

export const Index = () => {
  const params = useParams();
  const navigate = useNavigate();
  const treeData = useTreeData();
  const userRights = useUserRights();
  const selectedNodeId = useSelectedNodeId();
  const match = useMatch('/id/:wikiId');
  const isSmallDevice = useMediaQuery('only screen and (max-width: 1024px)');
  const queryClient = useQueryClient();

  const { setSelectedNodeId } = useTreeActions();
  const { data: menu, handleOnMenuClick } = useMenu({
    onMenuClick: setSelectedNodeId,
  });
  const { data } = useGetWiki(params.wikiId!);

  const isOnlyRead =
    userRights.read &&
    !userRights.contrib &&
    !userRights.creator &&
    !userRights.manager;

  /**
   * Redirect to the default page if exist
   */
  useRedirectDefaultPage();

  /**
   * Feed treeData
   */
  useFeedData();

  const handleOnTreeItemClick = (pageId: ID) =>
    navigate(`/id/${data?._id}/page/${pageId}`);

  const handleOnTreeItemCreateChildren = (pageId: ID) =>
    navigate(`page/${pageId}/subpage/create`);

  useEffect(() => {
    if (params.pageId) {
      setSelectedNodeId(`${params.pageId}`);
    } else {
      setSelectedNodeId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.pageId]);

  // const disabledIds = ['66d06b427d517979a6eb61a6'];

  return (
    <>
      <AppHeader />
      <Grid className="flex-grow-1">
        {!isSmallDevice && (
          <Grid.Col
            sm="3"
            lg="2"
            xl="3"
            className="border-end pt-16 pe-16 d-none d-lg-block"
            as="aside"
          >
            <Menu label={menu.children}>
              <Menu.Item>
                <Menu.Button
                  onClick={handleOnMenuClick}
                  leftIcon={menu.leftIcon}
                  selected={menu.selected}
                >
                  {menu.children}
                </Menu.Button>
              </Menu.Item>
            </Menu>

            <Dropdown.Separator />

            {!isOnlyRead && <NewPage />}

            {treeData.length > 0 && (
              <SortableTree
                nodes={treeData}
                selectedNodeId={selectedNodeId}
                // isDisabled={(nodeId) => disabledIds.includes(nodeId)}
                renderNode={({ nodeId, nodeName }) => (
                  <div className="d-flex flex-fill align-items-center justify-content-between">
                    <span>{nodeName}</span>
                    <button
                      className="tree-btn mx-8"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleOnTreeItemCreateChildren(nodeId);
                      }}
                    >
                      <Plus height={16} width={16} />
                    </button>
                  </div>
                )}
                onSortable={async ({ nodeId, parentId }) => {
                  const page = await wikiService.getPage({
                    wikiId: params.wikiId!,
                    pageId: nodeId as string,
                  });

                  if (!page) return;

                  await wikiService.updatePage({
                    wikiId: params.wikiId!,
                    pageId: nodeId as string,
                    data: {
                      title: page.title,
                      content: page.content ?? '',
                      isVisible: page.isVisible,
                      ...(parentId
                        ? {
                            parentId: parentId,
                          }
                        : undefined),
                    },
                  });
                }}
                onTreeItemClick={handleOnTreeItemClick}
              />
            )}
          </Grid.Col>
        )}
        <Grid.Col
          sm="4"
          md="8"
          lg="6"
          xl="9"
          className={clsx({
            'mt-16 mt-lg-0 mx-lg-0': isSmallDevice,
            'ms-n16 ms-lg-n24 me-n16': !isSmallDevice,
            'd-flex': match && !isSmallDevice,
          })}
        >
          {isSmallDevice && (
            <>
              <DropdownTreeview
                selectedNodeId={selectedNodeId}
                onTreeItemClick={handleOnTreeItemClick}
                onTreeItemAction={
                  !isOnlyRead ? handleOnTreeItemCreateChildren : undefined
                }
              />
              {!isOnlyRead && <NewPage />}
            </>
          )}
          {match ? <WikiEmptyScreen /> : <Outlet />}
        </Grid.Col>
      </Grid>
    </>
  );
};
