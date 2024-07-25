import { checkUserRight, Grid, TreeView } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { useMediaQuery } from '@uidotdev/usehooks';
import clsx from 'clsx';
import { ID, odeServices } from 'edifice-ts-client';
import { useState } from 'react';
import {
  LoaderFunctionArgs,
  Outlet,
  useMatch,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { Menu } from '~/components/Menu/Menu';
import { AppHeader } from '~/features';
import { DropdownTreeview } from '~/features/wiki/DropdownTreeview';
import { NewPage } from '~/features/wiki/NewPage';
import WikiEmptyScreen from '~/features/wiki/WikiEmptyScreen';
import { useFeedData } from '~/hooks/useFeedData';
import { useMenu } from '~/hooks/useMenu';
import { useRedirectDefaultPage } from '~/hooks/useRedirectDefaultPage';
import { useGetWiki, wikiQueryOptions } from '~/services';
import { getUserRightsActions } from '~/store';
import { useTreeData } from '~/store/treeview';
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
  const match = useMatch('/id/:wikiId/page/:pageId');
  const isSmallDevice = useMediaQuery('only screen and (max-width : 1023px)');
  const menus = useMenu();

  const [nodeId, setNodeId] = useState<string>('');

  const { data } = useGetWiki(params.wikiId!);

  /**
   * Redirect to the default page if exist
   */
  useRedirectDefaultPage();

  /**
   * Feed treeData
   */
  useFeedData();

  const handleClick = (pageId: ID) => {
    navigate(`/id/${data?._id}/page/${pageId}`);
    setNodeId(pageId);
  };

  return (
    <>
      <AppHeader />

      <Grid className="flex-grow-1">
        <Grid.Col
          sm="3"
          lg="2"
          xl="3"
          className="border-end pt-16 pe-16 d-none d-lg-block"
          as="aside"
        >
          <Menu label={data ? data.title : ''}>
            {
              <Menu.Item>
                <Menu.Button
                  onClick={menus.onClick}
                  leftIcon={menus.leftIcon}
                  selected={menus.selected}
                >
                  {menus.children}
                </Menu.Button>
              </Menu.Item>
            }
          </Menu>
          <NewPage />
          {treeData && (
            <TreeView
              data={treeData}
              showIcon={false}
              selectedNodeId={nodeId}
              onTreeItemClick={handleClick}
            />
          )}
        </Grid.Col>
        <Grid.Col
          sm="4"
          md="8"
          lg="6"
          xl="9"
          className={clsx('ms-n16 ms-lg-n24 me-n16', {
            'd-flex': match,
          })}
        >
          <div className="mt-16 mx-16 mt-lg-0 mx-lg-0">
            {isSmallDevice && (
              <DropdownTreeview
                treeData={treeData}
                nodeId={nodeId}
                handleClick={handleClick}
              />
            )}
            {match ? <WikiEmptyScreen /> : <Outlet />}
          </div>
        </Grid.Col>
      </Grid>
    </>
  );
};
