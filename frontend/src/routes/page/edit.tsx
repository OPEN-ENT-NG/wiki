import { ActionFunctionArgs, redirect, useParams } from 'react-router-dom';
import { FormPage } from '~/components/FormPage';
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

  const { data } = useGetPage({
    wikiId: params.wikiId!,
    pageId: params.pageId!,
  });

  const page = data?.pages[0];

  return page ? (
    <div className="page-container mt-32">
      <FormPage page={page} />
    </div>
  ) : null;
};
