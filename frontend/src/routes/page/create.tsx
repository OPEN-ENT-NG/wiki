import { QueryClient } from '@tanstack/react-query';
import { ActionFunctionArgs, redirect, useLocation } from 'react-router-dom';
import { FormPage } from '~/features/page/FormPage/FormPage';
import { wikiQueryOptions, wikiService } from '~/services';

export const action =
  (queryClient: QueryClient) =>
  async ({ params, request }: ActionFunctionArgs) => {
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const isVisible = formData.get('isVisible') === 'on';

    const data = await wikiService.createPage({
      wikiId: params.wikiId!,
      data: {
        title,
        content,
        parentId: params.pageId! ?? undefined,
        isVisible,
      },
    });

    await queryClient.invalidateQueries({ queryKey: wikiQueryOptions.base });

    return redirect(`/id/${params.wikiId}/page/${data._id}`);
  };

export const CreatePage = () => {
  const location = useLocation();

  return <FormPage key={location.pathname} />;
};
