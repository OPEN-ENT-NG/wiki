import { LoadingScreen } from '@edifice-ui/react';
import { QueryClient } from '@tanstack/react-query';
import { ActionFunctionArgs, redirect, useParams } from 'react-router-dom';
import { FormPage } from '~/features/page/FormPage';
import { useGetPage, wikiQueryOptions, wikiService } from '~/services';

export const action =
  (queryClient: QueryClient) =>
  async ({ params, request }: ActionFunctionArgs) => {
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const toggle = formData.get('toggle') === 'on';

    await wikiService.updatePage({
      wikiId: params.wikiId!,
      pageId: params.pageId!,
      data: {
        title,
        content,
        isVisible: toggle,
      },
    });

    await queryClient.invalidateQueries({ queryKey: wikiQueryOptions.base });

    return redirect(`/id/${params.wikiId}/page/${params.pageId!}`);
  };

export const EditPage = () => {
  const params = useParams();

  const { data, isPending } = useGetPage({
    wikiId: params.wikiId!,
    pageId: params.pageId!,
  });

  if (isPending) return <LoadingScreen />;

  return data ? <FormPage page={data} /> : null;
};
