import { LoadingScreen } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { LoaderFunctionArgs, useParams } from 'react-router-dom';
import { Fragment } from 'react/jsx-runtime';
import { useGetWiki, wikiQueryOptions } from '~/services/queries';

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const data = await queryClient.ensureQueryData(
      wikiQueryOptions.one(params.wikiId!)
    );

    return data;
  };

export const Pages = () => {
  const params = useParams();
  const query = useGetWiki(params.wikiId!);

  if (query.isLoading) return <LoadingScreen />;

  return (
    <div>
      {query.data?.pages.map((page) => {
        return (
          <Fragment key={page._id}>
            <div>{page._id}</div>
            <div>{page.title}</div>
            <div dangerouslySetInnerHTML={{ __html: page.contentPlain }} />
          </Fragment>
        );
      })}
    </div>
  );
};
