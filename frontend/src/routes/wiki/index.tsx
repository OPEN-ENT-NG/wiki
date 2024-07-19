import { checkUserRight, Grid, TreeView } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { ID, odeServices } from 'edifice-ts-client';
import { useState } from 'react';
import {
  LoaderFunctionArgs,
  Outlet,
  useMatch,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { AppHeader } from '~/features';
import { NewPage } from '~/features/wiki/NewPage';
import WikiEmptyScreen from '~/features/wiki/WikiEmptyScreen';
import { useFeedData } from '~/hooks/useFeedData';
import { useRedirectDefaultPage } from '~/hooks/useRedirectDefaultPage';
import { useGetWiki, wikiQueryOptions } from '~/services';
import { getUserRightsActions } from '~/store';
import { useTreeData } from '~/store/treeview';
import './index.css';
import { DropdownTreeview } from '~/features/wiki/DropdownTreeview';

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
  const match = useMatch('/id/:wikiId');

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
          <p data-testid="text">some text</p>
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
        <Grid.Col sm="4" md="8" lg="6" xl="9" className="mt-24">
          <DropdownTreeview
            treeData={treeData}
            nodeId={nodeId}
            handleClick={handleClick}
          />
          {match ? <WikiEmptyScreen /> : <Outlet />}
        </Grid.Col>
      </Grid>
    </>
  );
};
