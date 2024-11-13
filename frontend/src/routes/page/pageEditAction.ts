import { QueryClient } from '@tanstack/react-query';
import { ActionFunctionArgs, redirect } from 'react-router-dom';
import { getToastActions } from '~/store/toast';
import { getFormValue } from '../../utils/getFormValue';
import { FormPageDataProps } from '~/hooks';
import { pageQueryOptions, wikiQueryOptions, wikiService } from '~/services';
import { getWikiActions } from '~/store';

export const pageEditAction =
  (queryClient: QueryClient, redirectPath?: string) =>
  async ({ params, request }: ActionFunctionArgs) => {
    const formData: FormData = await request.formData();
    const { addToastMessage } = getToastActions();

    // submitting from confirm visibility modal form
    const isConfirmVisibilityForm: string = getFormValue(
      formData,
      'isConfirmVisibilityForm',
    );

    const actionData: FormPageDataProps = isConfirmVisibilityForm
      ? (JSON.parse(getFormValue(formData, 'actionData')) as FormPageDataProps)
      : {
          title: getFormValue(formData, 'title'),
          content: getFormValue(formData, 'content'),
          isHidden: getFormValue(formData, 'isHidden') === 'true',
        };

    // if submitting from page edit form and page has subpages
    // and visibility has changed then we show confirm modal
    if (!isConfirmVisibilityForm) {
      const wikiData = await queryClient.ensureQueryData(
        wikiQueryOptions.findOne(params.wikiId!),
      );
      const pageData = wikiData.pages?.find(
        (page) => page._id === params.pageId,
      );
      if (pageData?.children && pageData.isVisible === actionData.isHidden) {
        getWikiActions().setOpenConfirmVisibilityModal(true);
        return actionData;
      }
    }

    // otherwise we call the updatePage service and redirect to current page.
    const data = await wikiService.updatePage({
      wikiId: params.wikiId!,
      pageId: params.pageId!,
      data: {
        title: actionData.title,
        content: actionData.content,
        isVisible: !actionData.isHidden,
      },
    });

    await queryClient.invalidateQueries({ queryKey: wikiQueryOptions.base });
    await queryClient.invalidateQueries({ queryKey: pageQueryOptions.base });

    if (data.error) {
      addToastMessage({
        type: 'error',
        text: 'wiki.toast.error.edit.page',
      });
      return null;
    }

    addToastMessage({
      type: 'success',
      text: 'wiki.toast.success.edit.page',
    });

    const baseUrl = `/id/${params.wikiId}/page/${params.pageId!}`;
    const redirectUrl = redirectPath ? `${baseUrl}/${redirectPath}` : baseUrl;

    return redirect(redirectUrl);
  };
