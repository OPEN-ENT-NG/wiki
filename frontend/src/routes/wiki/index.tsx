import { Button, Grid, TreeView } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { ID, odeServices } from 'edifice-ts-client';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LoaderFunctionArgs,
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
} from 'react-router-dom';
import { WikiEmptyScreen } from '~/components/WikiEmptyScreen';
import { AppHeader } from '~/features/app/AppHeader';
import { type Wiki as WikiData } from '~/models';
import { wikiQueryOptions } from '~/services/queries';
import { useStoreContext } from '~/store';

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
  const data = useLoaderData() as WikiData;
  const navigate = useNavigate();
  const { setTreeData } = useStoreContext();
  const treeData = useStoreContext((state) => state.treeData);
  const match = useMatch('/id/:wikiId');
  const { t } = useTranslation();

  /**
   * Redirect to the default page if exist
   */
  useEffect(() => {
    const findIndexPage = data.pages.find((page) => page._id === data.index);

    if (findIndexPage) {
      const pageId = findIndexPage?._id;
      return navigate(`/id/${data._id}/page/${pageId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps

    setTreeData(
      data.pages.map((page) => {
        return {
          id: page._id,
          name: page.title,
          section: true,
          showIconSection: false,
        };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleClick = (pageId: ID) => {
    navigate(`/id/${data._id}/page/${pageId}`);
  };

  const handleCreatePage = () => {
    navigate(`page/create`);
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
          <div className="d-grid my-16">
            <Button variant="outline" onClick={handleCreatePage}>
              {t('wiki.create.new.page')}
            </Button>
          </div>
          <TreeView data={treeData} onTreeItemUnfold={handleClick} />
        </Grid.Col>
        <Grid.Col sm="4" md="8" lg="6" xl="9">
          {match ? <WikiEmptyScreen /> : <Outlet />}
        </Grid.Col>
      </Grid>
    </>
  );
};
