import { Grid, TreeView } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { ID, odeServices } from 'edifice-ts-client';
import { useEffect } from 'react';
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
import { useGetWiki, wikiQueryOptions } from '~/services';
import { useTreeActions, useTreeData } from '~/store/treeview';

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const data = await queryClient.ensureQueryData(
      wikiQueryOptions.findOne(params.wikiId!)
    );

    // TODO: wait normalized rights
    /* const userRights = await checkUserRight([]);
    const { setUserRights } = useUserRightsStore.getState();
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
  const { setTreeData } = useTreeActions();

  /**
   * Redirect to the default page if exist
   */
  useEffect(() => {
    if (data) {
      const findIndexPage = data.pages.find((page) => page._id === data.index);

      if (findIndexPage) {
        const pageId = findIndexPage?._id;
        return navigate(`/id/${data?._id}/page/${pageId}`);
      }

      setTreeData(
        data.pages.map((page, index) => {
          return {
            id: page._id,
            name: page.title,
            section: true,
          };
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

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
