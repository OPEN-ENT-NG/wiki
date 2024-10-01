import { QueryClient } from '@tanstack/react-query';
import { ActionFunctionArgs, redirect, useLocation } from 'react-router-dom';
import { FormPage } from '~/features/page/FormPage';
import { wikiQueryOptions, wikiService } from '~/services';
import { getFormValue } from '~/utils/getFormValue';

export const action =
  (queryClient: QueryClient) =>
  async ({ params, request }: ActionFunctionArgs) => {
    const formData = await request.formData();

    const title = getFormValue(formData, 'title');
    const content = getFormValue(formData, 'content');
    const isVisible = getFormValue(formData, 'isVisible') === 'true';

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
