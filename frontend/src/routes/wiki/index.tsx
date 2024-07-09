import { Grid } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { odeServices } from 'edifice-ts-client';
import { useEffect } from 'react';
import {
  Link,
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
  const match = useMatch('/id/:wikiId');

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
  }, [data]);

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
          ...
          <div>
            <Link to="page/create">Create page</Link>
          </div>
        </Grid.Col>
        <Grid.Col sm="4" md="8" lg="6" xl="9">
          {match ? <WikiEmptyScreen /> : <Outlet />}
        </Grid.Col>
      </Grid>
    </>
  );
};
