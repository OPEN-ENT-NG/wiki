import { LoadingScreen } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import {
  ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  redirect,
  useParams,
} from 'react-router-dom';
import { wikiService } from '~/services/api';
import { pageQueryOptions, useGetPage } from '~/services/queries';

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const data = await queryClient.ensureQueryData(
      pageQueryOptions.findOne({
        wikiId: params.wikiId!,
        pageId: params.pageId!,
      })
    );

    return data;
  };

export async function action({ params }: ActionFunctionArgs) {
  await wikiService.deletePage({
    wikiId: params.wikiId!,
    pageId: params.pageId!,
  });
  return redirect(`/id/${params.wikiId}`);
}

export const Page = () => {
  const params = useParams();

  const { isPending, error, data } = useGetPage({
    wikiId: params.wikiId!,
    pageId: params.pageId!,
  });

  if (isPending) return <LoadingScreen />;

  if (error) return 'An error has occurred: ' + error.message;

  return (
    <>
      <div>{data?.title}</div>
      <Form method="delete">
        <button type="submit">supprimer page</button>
      </Form>
    </>
  );
};
