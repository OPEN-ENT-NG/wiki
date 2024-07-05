import { QueryClient } from '@tanstack/react-query';
import { odeServices } from 'edifice-ts-client';
import { LoaderFunctionArgs, Outlet, redirect } from 'react-router-dom';
import { wikiQueryOptions } from '~/services/queries';

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const data = await queryClient.ensureQueryData(
      wikiQueryOptions.one(params.wikiId!)
    );

    if (odeServices.http().isResponseError()) {
      throw new Response('', {
        status: odeServices.http().latestResponse.status,
        statusText: odeServices.http().latestResponse.statusText,
      });
    }

    const findIndexPage = data.pages.find((page) => page._id === data.index);

    if (findIndexPage) {
      const pageId = findIndexPage?._id;
      return redirect(`/id/${params.wikiId}/page/${pageId}`);
    }
  };

export const Wiki = () => {
  return <Outlet />;
};
