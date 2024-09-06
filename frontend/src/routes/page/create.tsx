import { QueryClient } from '@tanstack/react-query';
import { ActionFunctionArgs, redirect } from 'react-router-dom';
import { FormPage } from '~/features/page/FormPage';
import { wikiQueryOptions, wikiService } from '~/services';

export const action =
  (queryClient: QueryClient) =>
  async ({ params, request }: ActionFunctionArgs) => {
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const toggle = formData.get('toggle') === 'on';

    const data = await wikiService.createPage({
      wikiId: params.wikiId!,
      data: {
        title,
        content,
        parentId: params.pageId! ?? undefined,
        isVisible: toggle,
      },
    });

    await queryClient.invalidateQueries({ queryKey: wikiQueryOptions.base });

    return redirect(`/id/${params.wikiId}/page/${data._id}`);
  };

export const CreatePage = ({ isSubPage }: { isSubPage?: boolean }) => {
  return <FormPage isSubPage={isSubPage} />;
};
