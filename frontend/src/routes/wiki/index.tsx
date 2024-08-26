import { checkUserRight, Grid, Menu, TreeView } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { useMediaQuery } from '@uidotdev/usehooks';
import clsx from 'clsx';
import { ID, odeServices } from 'edifice-ts-client';
import {
  LoaderFunctionArgs,
  Outlet,
  useMatch,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { AppHeader } from '~/features';
import { DropdownTreeview } from '~/features/wiki/DropdownTreeview';
import { NewPage } from '~/features/wiki/NewPage';
import WikiEmptyScreen from '~/features/wiki/WikiEmptyScreen';
import { useFeedData } from '~/hooks/useFeedData';
import { useMenu } from '~/hooks/useMenu';
import { useRedirectDefaultPage } from '~/hooks/useRedirectDefaultPage';
import { useGetWiki, wikiQueryOptions } from '~/services';
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
  const { setSelectedNodeId } = useTreeActions();
  const match = useMatch('/id/:wikiId');
  const isSmallDevice = useMediaQuery('only screen and (max-width: 1024px)');
  const menu = useMenu();

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

  const handleOnTreeItemClick = (pageId: ID) => {
    navigate(`/id/${data?._id}/page/${pageId}`);
    setSelectedNodeId(pageId);
  };

  const handleOnMenuClick = () => {
    setSelectedNodeId('');
    menu.onClick();
  };

  const handleOnTreeItemCreateChildren = (pageId: ID) => {
    navigate(`page/${pageId}/subpage/create`);
  };

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
            <Menu label={data ? data.title : ''}>
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
            {!isOnlyRead && <NewPage />}
            {treeData && (
              <TreeView
                data={treeData}
                showIcon={false}
                selectedNodeId={selectedNodeId}
                onTreeItemClick={handleOnTreeItemClick}
                onTreeItemAction={handleOnTreeItemCreateChildren}
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
            <DropdownTreeview
              treeData={treeData}
              selectedNodeId={selectedNodeId}
              onTreeItemClick={handleOnTreeItemClick}
              onTreeItemAction={handleOnTreeItemCreateChildren}
            />
          )}
          {match ? <WikiEmptyScreen /> : <Outlet />}
        </Grid.Col>
      </Grid>
    </>
  );
};
