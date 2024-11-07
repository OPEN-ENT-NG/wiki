import { QueryClient } from '@tanstack/react-query';
import { ActionFunctionArgs, redirect, useLocation } from 'react-router-dom';
import { FormPage } from '~/features';
import { pageQueryOptions, wikiQueryOptions, wikiService } from '~/services';
import { getToastActions } from '~/store/toast';
import { getFormValue } from '~/utils/getFormValue';

export const action =
  (queryClient: QueryClient) =>
  async ({ params, request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const { addToastMessage } = getToastActions();
    const pages = await queryClient.fetchQuery(
      pageQueryOptions.findAllFromWiki({
        wikiId: params.wikiId!,
        content: false,
      }),
    );
    const pagePosition = (pages ?? []).map((page) => page.position ?? 0);
    const title = getFormValue(formData, 'title');
    const content = getFormValue(formData, 'content');
    const isVisible = getFormValue(formData, 'isHidden') === 'false';
    const position =
      pagePosition.length > 0 ? Math.max(...pagePosition) + 1 : 1;
    const data = await wikiService.createPage({
      wikiId: params.wikiId!,
      data: {
        title,
        content,
        parentId: params.pageId! ?? undefined,
        isVisible,
        position,
      },
    });
    await queryClient.invalidateQueries({ queryKey: wikiQueryOptions.base });

    if (data.error) {
      addToastMessage({
        type: 'error',
        text: 'wiki.toast.error.save.page',
      });
      return null;
    }

    addToastMessage({
      type: 'success',
      text: 'wiki.toast.success.save.page',
    });

    return redirect(`/id/${params.wikiId}/page/${data._id}`);
  };

export const CreatePage = () => {
  const location = useLocation();

  return <FormPage key={location.pathname} />;
};
