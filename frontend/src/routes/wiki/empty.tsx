import { QueryClient } from '@tanstack/react-query';
import { LoaderFunctionArgs, Outlet, useParams } from 'react-router-dom';
import { useGetWiki, wikiQueryOptions } from '~/services/queries';

export const loader =
  (queryClient: QueryClient) =>
  async ({ params, request }: LoaderFunctionArgs) => {
    try {
      /* const allWiki = await queryClient.ensureQueryData(
        wikiQueryOptions.listall()
      );
      const allWikiWithPages = await queryClient.ensureQueryData(
        wikiQueryOptions.listallpages()
      ); */
      const findOneWiki = await queryClient.ensureQueryData(
        wikiQueryOptions.one(params.wikiId!)
      );

      console.log('all wikis', {
        /* allWiki, allWikiWithPages, */ findOneWiki,
      });
    } catch (error) {
      console.error(error);
    }

    return null;
  };

export const EmptyWiki = () => {
  const params = useParams();
  const { data, isError, isLoading } = useGetWiki(params.wikiId!);

  /* if (isLoading) return <LoadingScreen />;

  if (isError) return 'Error';

  if (!data) return null;

  if (data?.pages?.length <= 0) return <div>Page Wiki Empty</div>; */

  return <Outlet />;
};
