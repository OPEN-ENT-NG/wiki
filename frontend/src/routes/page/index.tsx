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
      pageQueryOptions.one(params.wikiId!, params.pageId!)
    );

    return data;
  };

export async function action({ params }: ActionFunctionArgs) {
  console.log({ params });
  await wikiService.deletePage(params.wikiId!, params.pageId!);
  return redirect(`/id/${params.wikiId}`);
}

export const Page = () => {
  const params = useParams();
  const querie = useGetPage(params.wikiId!, params.pageId!);

  if (querie.isLoading) return <LoadingScreen />;

  return (
    <>
      <div>{querie.data?.title}</div>
      <Form method="delete">
        <button type="submit">supprimer page</button>
      </Form>
    </>
  );
};
