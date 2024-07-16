import { Grid, TreeView } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { ID, odeServices } from 'edifice-ts-client';
import {
  LoaderFunctionArgs,
  Outlet,
  useMatch,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { WikiEmptyScreen } from '~/components';
import { AppHeader } from '~/features';
import { NewPage } from '~/features/wiki/NewPage';
import { useFeedData } from '~/hooks/useFeedData';
import { useRedirectDefaultPage } from '~/hooks/useRedirectDefaultPage';
import { useGetWiki, wikiQueryOptions } from '~/services';
import { useTreeData } from '~/store/treeview';

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const data = await queryClient.ensureQueryData(
      wikiQueryOptions.findOne(params.wikiId!)
    );

    // TODO: wait normalized rights
    /* const userRights = await checkUserRight(data.rights);
    const { setUserRights } = getUserRightsActions();
    setUserRights(userRights); */

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
          <NewPage />
          {treeData && (
            <TreeView
              data={treeData}
              showIcon={false}
              onTreeItemClick={handleClick}
            />
          )}
        </Grid.Col>
        <Grid.Col sm="4" md="8" lg="6" xl="9">
          {match ? <WikiEmptyScreen /> : <Outlet />}
        </Grid.Col>
      </Grid>
    </>
  );
};
