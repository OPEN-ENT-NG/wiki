import { LoadingScreen } from '@edifice-ui/react';
import { ActionFunctionArgs, redirect, useParams } from 'react-router-dom';
import { FormPage } from '~/features/page/FormPage';
import { queryClient } from '~/providers';
import { useGetPage, wikiQueryOptions, wikiService } from '~/services';

export async function action({ params, request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  await wikiService.updatePage({
    wikiId: params.wikiId!,
    pageId: params.pageId!,
    data: {
      title,
      content,
    },
  });

  await queryClient.invalidateQueries({ queryKey: wikiQueryOptions.base });

  return redirect(`/id/${params.wikiId}/page/${params.pageId!}`);
}

export const EditPage = () => {
  const params = useParams();

  const { data, isPending } = useGetPage({
    wikiId: params.wikiId!,
    pageId: params.pageId!,
  });

  if (isPending) return <LoadingScreen />;

  return data ? <FormPage page={data} /> : null;
};
