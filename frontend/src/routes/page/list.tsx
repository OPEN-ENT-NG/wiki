import { LoadingScreen } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { LoaderFunctionArgs, useParams } from 'react-router-dom';
import { Fragment } from 'react/jsx-runtime';
import { useGetWiki, wikiQueryOptions } from '~/services/queries';

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const data = await queryClient.ensureQueryData(
      wikiQueryOptions.findOne(params.wikiId!)
    );

    return data;
  };

export const Pages = () => {
  const params = useParams();
  const { isPending, data, error } = useGetWiki(params.wikiId!);

  if (isPending) return <LoadingScreen />;

  if (error) return 'An error has occurred: ' + error.message;

  return (
    <div>
      {data?.pages.map((page) => {
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
